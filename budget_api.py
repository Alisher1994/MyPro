
# === Budget API Endpoints ===

# ===== STAGES (Этапы) =====
@app.get("/objects/{object_id}/budget/stages/")
async def get_stages(object_id: int):
    """Получить все этапы для объекта"""
    query = "SELECT * FROM budget_stages WHERE object_id=$1 ORDER BY order_index;"
    async with app.state.db.acquire() as conn:
        rows = await conn.fetch(query, object_id)
    return [dict(row) for row in rows]

@app.post("/objects/{object_id}/budget/stages/")
async def add_stage(object_id: int, data: dict):
    """Добавить новый этап"""
    name = data.get("name", "Новый этап")
    # Получаем максимальный order_index
    async with app.state.db.acquire() as conn:
        max_order = await conn.fetchval(
            "SELECT COALESCE(MAX(order_index), -1) FROM budget_stages WHERE object_id=$1",
            object_id
        )
        row = await conn.fetchrow(
            "INSERT INTO budget_stages (object_id, name, order_index) VALUES ($1, $2, $3) RETURNING *",
            object_id, name, max_order + 1
        )
    return dict(row)

@app.put("/objects/{object_id}/budget/stages/{stage_id}")
async def update_stage(object_id: int, stage_id: int, data: dict):
    """Обновить этап"""
    name = data.get("name")
    collapsed = data.get("collapsed")
    order_index = data.get("order_index")
    
    updates = []
    params = []
    param_count = 1
    
    if name is not None:
        updates.append(f"name=${param_count}")
        params.append(name)
        param_count += 1
    if collapsed is not None:
        updates.append(f"collapsed=${param_count}")
        params.append(collapsed)
        param_count += 1
    if order_index is not None:
        updates.append(f"order_index=${param_count}")
        params.append(order_index)
        param_count += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.extend([stage_id, object_id])
    query = f"UPDATE budget_stages SET {', '.join(updates)} WHERE id=${param_count} AND object_id=${param_count+1} RETURNING *"
    
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(query, *params)
    if not row:
        raise HTTPException(status_code=404, detail="Stage not found")
    return dict(row)

@app.delete("/objects/{object_id}/budget/stages/{stage_id}")
async def delete_stage(object_id: int, stage_id: int):
    """Удалить этап (каскадно удалятся виды работ и ресурсы)"""
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(
            "DELETE FROM budget_stages WHERE id=$1 AND object_id=$2 RETURNING id",
            stage_id, object_id
        )
    if not row:
        raise HTTPException(status_code=404, detail="Stage not found")
    return {"status": "deleted"}

@app.post("/objects/{object_id}/budget/stages/reorder")
async def reorder_stages(object_id: int, data: dict):
    """Изменить порядок этапов"""
    stage_ids = data.get("stage_ids", [])  # [id1, id2, id3, ...]
    try:
        async with app.state.db.acquire() as conn:
            for idx, stage_id in enumerate(stage_ids):
                stage_id_int = int(stage_id)
                await conn.execute(
                    "UPDATE budget_stages SET order_index=$1 WHERE id=$2 AND object_id=$3",
                    idx, stage_id_int, object_id
                )
        return {"status": "reordered"}
    except Exception as e:
        print(f"Error reordering stages: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reorder stages: {str(e)}")


# ===== WORK TYPES (Виды работ) =====
@app.get("/objects/{object_id}/budget/work-types/")
async def get_work_types(object_id: int):
    """Получить все виды работ для объекта"""
    query = """
        SELECT wt.* FROM budget_work_types wt
        JOIN budget_stages s ON wt.stage_id = s.id
        WHERE s.object_id=$1
        ORDER BY s.order_index, wt.order_index;
    """
    async with app.state.db.acquire() as conn:
        rows = await conn.fetch(query, object_id)
    return [dict(row) for row in rows]

@app.post("/budget/stages/{stage_id}/work-types/")
async def add_work_type(stage_id: int, data: dict):
    """Добавить вид работ в этап"""
    name = data.get("name", "Новый вид работ")
    unit = data.get("unit", "шт")
    quantity = data.get("quantity", 0)
    
    async with app.state.db.acquire() as conn:
        max_order = await conn.fetchval(
            "SELECT COALESCE(MAX(order_index), -1) FROM budget_work_types WHERE stage_id=$1",
            stage_id
        )
        row = await conn.fetchrow(
            "INSERT INTO budget_work_types (stage_id, name, unit, quantity, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            stage_id, name, unit, quantity, max_order + 1
        )
    return dict(row)

@app.put("/budget/work-types/{work_type_id}")
async def update_work_type(work_type_id: int, data: dict):
    """Обновить вид работ"""
    name = data.get("name")
    unit = data.get("unit")
    quantity = data.get("quantity")
    collapsed = data.get("collapsed")
    order_index = data.get("order_index")
    stage_id = data.get("stage_id")  # Для переноса между этапами
    
    updates = []
    params = []
    param_count = 1
    
    if name is not None:
        updates.append(f"name=${param_count}")
        params.append(name)
        param_count += 1
    if unit is not None:
        updates.append(f"unit=${param_count}")
        params.append(unit)
        param_count += 1
    if quantity is not None:
        updates.append(f"quantity=${param_count}")
        params.append(quantity)
        param_count += 1
    if collapsed is not None:
        updates.append(f"collapsed=${param_count}")
        params.append(collapsed)
        param_count += 1
    if order_index is not None:
        updates.append(f"order_index=${param_count}")
        params.append(order_index)
        param_count += 1
    if stage_id is not None:
        updates.append(f"stage_id=${param_count}")
        params.append(stage_id)
        param_count += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(work_type_id)
    query = f"UPDATE budget_work_types SET {', '.join(updates)} WHERE id=${param_count} RETURNING *"
    
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(query, *params)
    if not row:
        raise HTTPException(status_code=404, detail="Work type not found")
    return dict(row)

@app.delete("/budget/work-types/{work_type_id}")
async def delete_work_type(work_type_id: int):
    """Удалить вид работ (каскадно удалятся ресурсы)"""
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(
            "DELETE FROM budget_work_types WHERE id=$1 RETURNING id",
            work_type_id
        )
    if not row:
        raise HTTPException(status_code=404, detail="Work type not found")
    return {"status": "deleted"}

@app.post("/budget/stages/{stage_id}/work-types/reorder")
async def reorder_work_types(stage_id: int, data: dict):
    """Изменить порядок видов работ внутри этапа"""
    work_type_ids = data.get("work_type_ids", [])
    try:
        async with app.state.db.acquire() as conn:
            for idx, wt_id in enumerate(work_type_ids):
                wt_id_int = int(wt_id)
                await conn.execute(
                    "UPDATE budget_work_types SET order_index=$1 WHERE id=$2 AND stage_id=$3",
                    idx, wt_id_int, stage_id
                )
        return {"status": "reordered"}
    except Exception as e:
        print(f"Error reordering work types: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reorder work types: {str(e)}")


# ===== RESOURCES (Ресурсы) =====
@app.get("/objects/{object_id}/budget/resources/")
async def get_resources(object_id: int):
    """Получить все ресурсы для объекта"""
    query = """
        SELECT r.* FROM budget_resources r
        JOIN budget_work_types wt ON r.work_type_id = wt.id
        JOIN budget_stages s ON wt.stage_id = s.id
        WHERE s.object_id=$1
        ORDER BY s.order_index, wt.order_index, r.order_index;
    """
    async with app.state.db.acquire() as conn:
        rows = await conn.fetch(query, object_id)
    return [dict(row) for row in rows]

@app.post("/budget/work-types/{work_type_id}/resources/")
async def add_resource(
    work_type_id: int,
    resource_type: str = Form(...),
    name: str = Form(...),
    unit: str = Form("шт"),
    quantity: float = Form(0),
    price: float = Form(0),
    supplier: str = Form(""),
    photo: UploadFile = File(None)
):
    """Добавить ресурс в вид работ"""
    photo_path = None
    if photo:
        orig = os.path.basename(photo.filename)
        safe = re.sub(r'[^A-Za-z0-9_.-]', '_', orig)
        fname = f"resource_{work_type_id}_{int(dtdate.today().strftime('%Y%m%d'))}_{safe}"
        dest = os.path.join(UPLOAD_DIR, fname)
        with open(dest, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_path = f"/uploads/{fname}"
    
    async with app.state.db.acquire() as conn:
        max_order = await conn.fetchval(
            "SELECT COALESCE(MAX(order_index), -1) FROM budget_resources WHERE work_type_id=$1",
            work_type_id
        )
        row = await conn.fetchrow(
            """INSERT INTO budget_resources 
               (work_type_id, photo, resource_type, name, unit, quantity, price, supplier, order_index)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *""",
            work_type_id, photo_path, resource_type, name, unit, quantity, price, supplier, max_order + 1
        )
    return dict(row)

@app.put("/budget/resources/{resource_id}")
async def update_resource(
    resource_id: int,
    resource_type: str = Form(None),
    name: str = Form(None),
    unit: str = Form(None),
    quantity: float = Form(None),
    price: float = Form(None),
    supplier: str = Form(None),
    order_index: int = Form(None),
    photo: UploadFile = File(None)
):
    """Обновить ресурс"""
    updates = []
    params = []
    param_count = 1
    
    if photo:
        orig = os.path.basename(photo.filename)
        safe = re.sub(r'[^A-Za-z0-9_.-]', '_', orig)
        fname = f"resource_{resource_id}_{int(dtdate.today().strftime('%Y%m%d'))}_{safe}"
        dest = os.path.join(UPLOAD_DIR, fname)
        with open(dest, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_path = f"/uploads/{fname}"
        updates.append(f"photo=${param_count}")
        params.append(photo_path)
        param_count += 1
    
    if resource_type is not None:
        updates.append(f"resource_type=${param_count}")
        params.append(resource_type)
        param_count += 1
    if name is not None:
        updates.append(f"name=${param_count}")
        params.append(name)
        param_count += 1
    if unit is not None:
        updates.append(f"unit=${param_count}")
        params.append(unit)
        param_count += 1
    if quantity is not None:
        updates.append(f"quantity=${param_count}")
        params.append(quantity)
        param_count += 1
    if price is not None:
        updates.append(f"price=${param_count}")
        params.append(price)
        param_count += 1
    if supplier is not None:
        updates.append(f"supplier=${param_count}")
        params.append(supplier)
        param_count += 1
    if order_index is not None:
        updates.append(f"order_index=${param_count}")
        params.append(order_index)
        param_count += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(resource_id)
    query = f"UPDATE budget_resources SET {', '.join(updates)} WHERE id=${param_count} RETURNING *"
    
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(query, *params)
    if not row:
        raise HTTPException(status_code=404, detail="Resource not found")
    return dict(row)

@app.delete("/budget/resources/{resource_id}")
async def delete_resource(resource_id: int):
    """Удалить ресурс"""
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(
            "DELETE FROM budget_resources WHERE id=$1 RETURNING id",
            resource_id
        )
    if not row:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"status": "deleted"}

@app.post("/budget/work-types/{work_type_id}/resources/reorder")
async def reorder_resources(work_type_id: int, data: dict):
    """Изменить порядок ресурсов внутри вида работ"""
    resource_ids = data.get("resource_ids", [])
    try:
        async with app.state.db.acquire() as conn:
            for idx, res_id in enumerate(resource_ids):
                # Конвертируем в int на случай если пришла строка
                res_id_int = int(res_id)
                await conn.execute(
                    "UPDATE budget_resources SET order_index=$1 WHERE id=$2 AND work_type_id=$3",
                    idx, res_id_int, work_type_id
                )
        return {"status": "reordered"}
    except Exception as e:
        print(f"Error reordering resources: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reorder resources: {str(e)}")


# ===== HELPER: Get full budget tree =====
@app.get("/objects/{object_id}/budget/tree/")
async def get_budget_tree(object_id: int):
    """Получить полное дерево бюджета (этапы -> виды работ -> ресурсы)"""
    async with app.state.db.acquire() as conn:
        # Получаем этапы
        stages = await conn.fetch(
            "SELECT * FROM budget_stages WHERE object_id=$1 ORDER BY order_index",
            object_id
        )
        
        result = []
        for stage in stages:
            stage_dict = dict(stage)
            
            # Получаем виды работ для этапа
            work_types = await conn.fetch(
                "SELECT * FROM budget_work_types WHERE stage_id=$1 ORDER BY order_index",
                stage['id']
            )
            
            stage_dict['work_types'] = []
            for wt in work_types:
                wt_dict = dict(wt)
                
                # Получаем ресурсы для вида работ
                resources = await conn.fetch(
                    "SELECT * FROM budget_resources WHERE work_type_id=$1 ORDER BY order_index",
                    wt['id']
                )
                wt_dict['resources'] = [dict(r) for r in resources]
                
                stage_dict['work_types'].append(wt_dict)
            
            result.append(stage_dict)
    
    return result
