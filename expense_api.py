# === Expense API Endpoints ===
from fastapi import Request, HTTPException
import time
from datetime import date as dtdate, datetime
import os

# Get budget tree with expense data
@app.get("/objects/{object_id}/expenses/tree")
async def get_expenses_tree(object_id: int):
    """Получить дерево бюджета с данными о расходах"""
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
                
                wt_dict['resources'] = []
                for res in resources:
                    res_dict = dict(res)
                    
                    # Получаем расходы для ресурса
                    expenses = await conn.fetch(
                        "SELECT * FROM resource_expenses WHERE resource_id=$1 ORDER BY date DESC",
                        res['id']
                    )
                    res_dict['expenses'] = [dict(exp) for exp in expenses]
                    
                    wt_dict['resources'].append(res_dict)
                
                stage_dict['work_types'].append(wt_dict)
            
            result.append(stage_dict)
        
        return result

# Add expense for resource
@app.post("/budget/resources/{resource_id}/expenses/")
async def add_expense(resource_id: int, request: Request):
    """Добавить расход для ресурса"""
    try:
        data = await request.json()
        print(f"Adding expense for resource {resource_id}: {data}")
        
        # Robust Date Handling
        date_str = data.get("date")
        date_val = dtdate.today()
        
        if date_str:
            try:
                # Try ISO format YYYY-MM-DD
                date_val = dtdate.fromisoformat(date_str)
            except ValueError:
                try:
                    # Try DD.MM.YYYY (common in some locales)
                    date_val = datetime.strptime(date_str, "%d.%m.%Y").date()
                except ValueError:
                    print(f"Date parse failed for '{date_str}', using today")
                    date_val = dtdate.today()
            
        # Handle potential None/Null values safely
        qty_raw = data.get("actual_quantity")
        price_raw = data.get("actual_price")
        
        actual_quantity = float(qty_raw) if qty_raw is not None else 0.0
        actual_price = float(price_raw) if price_raw is not None else 0.0
        comment = data.get("comment", "") or ""
        
        async with app.state.db.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO resource_expenses 
                (resource_id, date, actual_quantity, actual_price, comment)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            """, resource_id, date_val, actual_quantity, actual_price, comment)
        
        return dict(row)
    except Exception as e:
        print(f"Error adding expense: {e}")
        # Return a 400 error with the message so the frontend can show it
        raise HTTPException(status_code=400, detail=f"Server Error: {str(e)}")

# Update expense
@app.put("/expenses/{expense_id}")
async def update_expense(expense_id: int, request: Request):
    """Обновить расход"""
    try:
        data = await request.json()
        
        updates = []
        params = []
        param_count = 1
        
        if "date" in data:
            updates.append(f"date=${param_count}")
            # Try to parse date if provided
            d_val = data["date"]
            try:
                d_obj = dtdate.fromisoformat(d_val)
            except:
                try:
                    d_obj = datetime.strptime(d_val, "%d.%m.%Y").date()
                except:
                    d_obj = dtdate.today()
            params.append(d_obj)
            param_count += 1
            
        if "actual_quantity" in data:
            updates.append(f"actual_quantity=${param_count}")
            val = data["actual_quantity"]
            params.append(float(val) if val is not None else 0.0)
            param_count += 1
        if "actual_price" in data:
            updates.append(f"actual_price=${param_count}")
            val = data["actual_price"]
            params.append(float(val) if val is not None else 0.0)
            param_count += 1
        if "comment" in data:
            updates.append(f"comment=${param_count}")
            params.append(data["comment"])
            param_count += 1
        
        if updates:
            params.append(expense_id)
            query = f"UPDATE resource_expenses SET {', '.join(updates)} WHERE id=${param_count} RETURNING *"
            async with app.state.db.acquire() as conn:
                row = await conn.fetchrow(query, *params)
            return dict(row) if row else {"error": "Not found"}
        
        return {"error": "No updates"}
    except Exception as e:
        print(f"Error updating expense: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Upload receipt photo
@app.put("/expenses/{expense_id}/receipt/{receipt_num}")
async def upload_receipt(expense_id: int, receipt_num: int, request: Request):
    """Загрузить фото чека"""
    try:
        form = await request.form()
        file = form.get(f"receipt_{receipt_num}")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Save file
        filename = f"receipt_{expense_id}_{receipt_num}_{int(time.time() * 1000)}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        
        # Update database
        field_name = f"receipt_photo_{receipt_num}"
        async with app.state.db.acquire() as conn:
            row = await conn.fetchrow(
                f"UPDATE resource_expenses SET {field_name}=$1 WHERE id=$2 RETURNING *",
                f"/uploads/{filename}", expense_id
            )
        
        return dict(row) if row else {"error": "Not found"}
    except Exception as e:
        print(f"Error uploading receipt: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Delete expense
@app.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: int):
    """Удалить расход"""
    async with app.state.db.acquire() as conn:
        await conn.execute("DELETE FROM resource_expenses WHERE id=$1", expense_id)
    return {"status": "deleted"}


# ===== NEW EXPENSES API (Новая структура расходов) =====

@app.get("/objects/{object_id}/expenses/")
async def get_expenses(object_id: int, expense_type: str = None):
    """Получить все расходы для объекта"""
    try:
        if expense_type:
            query = "SELECT * FROM expenses WHERE object_id=$1 AND expense_type=$2 ORDER BY date DESC;"
            async with app.state.db.acquire() as conn:
                rows = await conn.fetch(query, object_id, expense_type)
        else:
            query = "SELECT * FROM expenses WHERE object_id=$1 ORDER BY date DESC;"
            async with app.state.db.acquire() as conn:
                rows = await conn.fetch(query, object_id)
        
        return [
            {
                "id": row["id"],
                "object_id": row["object_id"],
                "budget_id": row["budget_id"],
                "expense_type": row["expense_type"],
                "date": row["date"].isoformat() if row["date"] else None,
                "expense_item": row["expense_item"],
                "planned_amount": float(row["planned_amount"]) if row["planned_amount"] else 0,
                "actual_amount": float(row["actual_amount"]) if row["actual_amount"] else 0,
                "currency": row["currency"],
                "document_path": row["document_path"],
                "document_status": row["document_status"],
                "comment": row["comment"]
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Error getting expenses: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting expenses: {str(e)}")

@app.post("/objects/{object_id}/expenses/")
async def add_expense(object_id: int, data: dict):
    """Добавить новый расход"""
    try:
        from datetime import datetime
        
        expense_date = datetime.strptime(data.get("date"), "%Y-%m-%d").date() if data.get("date") else None
        
        query = """
            INSERT INTO expenses (
                object_id, budget_id, expense_type, date, expense_item,
                planned_amount, actual_amount, currency, document_path, document_status, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        """
        async with app.state.db.acquire() as conn:
            row = await conn.fetchrow(
                query,
                object_id,
                data.get("budgetId"),
                data.get("expenseType", "СМР"),
                expense_date,
                data.get("expenseItem", ""),
                data.get("plannedAmount", 0),
                data.get("actualAmount", 0),
                data.get("currency", "UZS"),
                data.get("documentPath"),
                data.get("documentStatus", "draft"),
                data.get("comment", "")
            )
        
        return {
            "id": row["id"],
            "object_id": row["object_id"],
            "budget_id": row["budget_id"],
            "expense_type": row["expense_type"],
            "date": row["date"].isoformat() if row["date"] else None,
            "expense_item": row["expense_item"],
            "planned_amount": float(row["planned_amount"]) if row["planned_amount"] else 0,
            "actual_amount": float(row["actual_amount"]) if row["actual_amount"] else 0,
            "currency": row["currency"],
            "document_path": row["document_path"],
            "document_status": row["document_status"],
            "comment": row["comment"]
        }
    except Exception as e:
        print(f"Error adding expense: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error adding expense: {str(e)}")

@app.put("/objects/{object_id}/expenses/{expense_id}")
async def update_expense(object_id: int, expense_id: int, data: dict):
    """Обновить расход"""
    from datetime import datetime
    
    updates = []
    params = []
    param_count = 1
    
    fields_map = {
        "budgetId": "budget_id",
        "expenseType": "expense_type",
        "date": "date",
        "expenseItem": "expense_item",
        "plannedAmount": "planned_amount",
        "actualAmount": "actual_amount",
        "currency": "currency",
        "documentPath": "document_path",
        "documentStatus": "document_status",
        "comment": "comment"
    }
    
    for js_field, db_field in fields_map.items():
        if js_field in data:
            value = data[js_field]
            if db_field == "date" and isinstance(value, str):
                value = datetime.strptime(value, "%Y-%m-%d").date()
            updates.append(f"{db_field}=${param_count}")
            params.append(value)
            param_count += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.extend([expense_id, object_id])
    query = f"UPDATE expenses SET {', '.join(updates)} WHERE id=${param_count} AND object_id=${param_count+1} RETURNING *"
    
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(query, *params)
    
    if not row:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return {
        "id": row["id"],
        "object_id": row["object_id"],
        "budget_id": row["budget_id"],
        "expense_type": row["expense_type"],
        "date": row["date"].isoformat() if row["date"] else None,
        "expense_item": row["expense_item"],
        "planned_amount": float(row["planned_amount"]) if row["planned_amount"] else 0,
        "actual_amount": float(row["actual_amount"]) if row["actual_amount"] else 0,
        "currency": row["currency"],
        "document_path": row["document_path"],
        "document_status": row["document_status"],
        "comment": row["comment"]
    }

@app.delete("/objects/{object_id}/expenses/{expense_id}")
async def delete_new_expense(object_id: int, expense_id: int):
    """Удалить расход"""
    async with app.state.db.acquire() as conn:
        row = await conn.fetchrow(
            "DELETE FROM expenses WHERE id=$1 AND object_id=$2 RETURNING id",
            expense_id, object_id
        )
    if not row:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"status": "deleted"}

@app.post("/objects/{object_id}/expenses/{expense_id}/upload-document")
async def upload_expense_document(object_id: int, expense_id: int, request: Request):
    """Загрузить документ для расхода"""
    try:
        form = await request.form()
        file = form.get("file")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Создаем директорию uploads если её нет
        os.makedirs("uploads", exist_ok=True)
        
        # Генерируем уникальное имя файла
        timestamp = int(time.time())
        filename = f"expense_{expense_id}_{timestamp}_{file.filename}"
        filepath = os.path.join("uploads", filename)
        
        # Сохраняем файл
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        
        # Обновляем базу данных
        async with app.state.db.acquire() as conn:
            row = await conn.fetchrow(
                "UPDATE expenses SET document_path=$1 WHERE id=$2 AND object_id=$3 RETURNING *",
                f"/uploads/{filename}", expense_id, object_id
            )
        
        if not row:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        return {
            "id": row["id"],
            "document_path": row["document_path"]
        }
    except Exception as e:
        print(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

