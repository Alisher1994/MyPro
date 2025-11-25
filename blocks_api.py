
# === Blocks API Endpoints ===
# Note: This file is exec()'d into main.py context
# Variables like 'app' and 'HTTPException' are available from main.py

# ===== OBJECT BLOCKS (Блоки объекта) =====

@app.get("/objects/{object_id}/blocks/")
async def get_blocks(object_id: int):
    """Get all blocks for a specific object, ordered by order_index"""
    try:
        query = """
            SELECT id, object_id, name, status, color, order_index, created_at
            FROM object_blocks
            WHERE object_id = $1
            ORDER BY order_index, created_at
        """
        async with app.state.db.acquire() as conn:
            rows = await conn.fetch(query, object_id)
        return [
            {
                "id": row["id"],
                "object_id": row["object_id"],
                "name": row["name"],
                "status": row["status"],
                "color": row["color"],
                "order_index": row["order_index"],
                "created_at": row["created_at"].isoformat() if row["created_at"] else None
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/objects/{object_id}/blocks/")
async def create_block(object_id: int, data: dict):
    """Create a new block for an object"""
    try:
        name = data.get("name")
        status = data.get("status", "active")
        color = data.get("color", "#3B82F6")
        order_index = data.get("order_index", 0)
        
        if not name:
            raise HTTPException(status_code=400, detail="Name is required")
        
        query = """
            INSERT INTO object_blocks (object_id, name, status, color, order_index)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, object_id, name, status, color, order_index, created_at
        """
        async with app.state.db.acquire() as conn:
            row = await conn.fetchrow(query, object_id, name, status, color, order_index)
        
        return {
            "id": row["id"],
            "object_id": row["object_id"],
            "name": row["name"],
            "status": row["status"],
            "color": row["color"],
            "order_index": row["order_index"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/blocks/{block_id}")
async def get_block(block_id: int):
    """Get a specific block by ID"""
    try:
        query = """
            SELECT id, object_id, name, status, color, order_index, created_at
            FROM object_blocks
            WHERE id = $1
        """
        async with app.state.db.acquire() as conn:
            row = await conn.fetchrow(query, block_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Block not found")
        
        return {
            "id": row["id"],
            "object_id": row["object_id"],
            "name": row["name"],
            "status": row["status"],
            "color": row["color"],
            "order_index": row["order_index"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/blocks/{block_id}")
async def update_block(block_id: int, data: dict):
    """Update a block"""
    try:
        # Build dynamic update query
        update_fields = []
        values = []
        param_count = 1
        
        if "name" in data and data["name"] is not None:
            update_fields.append(f"name = ${param_count}")
            values.append(data["name"])
            param_count += 1
        
        if "status" in data and data["status"] is not None:
            update_fields.append(f"status = ${param_count}")
            values.append(data["status"])
            param_count += 1
        
        if "color" in data and data["color"] is not None:
            update_fields.append(f"color = ${param_count}")
            values.append(data["color"])
            param_count += 1
        
        if "order_index" in data and data["order_index"] is not None:
            update_fields.append(f"order_index = ${param_count}")
            values.append(data["order_index"])
            param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(block_id)
        query = f"""
            UPDATE object_blocks
            SET {', '.join(update_fields)}
            WHERE id = ${param_count}
            RETURNING id, object_id, name, status, color, order_index, created_at
        """
        
        async with app.state.db.acquire() as conn:
            row = await conn.fetchrow(query, *values)
        
        if not row:
            raise HTTPException(status_code=404, detail="Block not found")
        
        return {
            "id": row["id"],
            "object_id": row["object_id"],
            "name": row["name"],
            "status": row["status"],
            "color": row["color"],
            "order_index": row["order_index"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/blocks/{block_id}")
async def delete_block(block_id: int):
    """Delete a block (only if no budgets/incomes reference it)"""
    try:
        async with app.state.db.acquire() as conn:
            # Check if block is referenced
            budget_count = await conn.fetchval(
                "SELECT COUNT(*) FROM budgets WHERE block_id = $1",
                block_id
            )
            income_count = await conn.fetchval(
                "SELECT COUNT(*) FROM incomes WHERE block_id = $1",
                block_id
            )
            
            if budget_count > 0 or income_count > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot delete block: {budget_count} budgets and {income_count} incomes reference it"
                )
            
            result = await conn.execute(
                "DELETE FROM object_blocks WHERE id = $1",
                block_id
            )
            
            if result == "DELETE 0":
                raise HTTPException(status_code=404, detail="Block not found")
        
        return {"message": "Block deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/blocks/{block_id}/budgets/")
async def get_block_budgets(block_id: int, section: str = None):
    """Get all budgets for a specific block, optionally filtered by section"""
    try:
        if section:
            query = """
                SELECT * FROM budgets
                WHERE block_id = $1 AND section = $2
                ORDER BY date_modified DESC
            """
            async with app.state.db.acquire() as conn:
                rows = await conn.fetch(query, block_id, section)
        else:
            query = """
                SELECT * FROM budgets
                WHERE block_id = $1
                ORDER BY date_modified DESC
            """
            async with app.state.db.acquire() as conn:
                rows = await conn.fetch(query, block_id)
        
        return [
            {
                "id": row["id"],
                "object_id": row["object_id"],
                "date_start": row["date_start"].isoformat() if row["date_start"] else None,
                "name": row["name"],
                "block": row["block"],
                "block_id": row.get("block_id"),
                "section": row.get("section"),
                "contract_number": row["contract_number"],
                "version": row["version"],
                "status": row["status"],
                "status_text": row["status_text"],
                "date_modified": row["date_modified"].isoformat() if row["date_modified"] else None,
                "total_amount": float(row["total_amount"]) if row["total_amount"] else 0,
                "currency": row["currency"],
                "comment": row["comment"]
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/blocks/{block_id}/incomes/")
async def get_block_incomes(block_id: int):
    """Get all incomes for a specific block"""
    try:
        query = """
            SELECT * FROM incomes
            WHERE block_id = $1
            ORDER BY date DESC
        """
        async with app.state.db.acquire() as conn:
            rows = await conn.fetch(query, block_id)
        
        return [
            {
                "id": row["id"],
                "date": row["date"].isoformat() if row["date"] else None,
                "photo": row["photo"],
                "amount": float(row["amount"]) if row["amount"] else 0,
                "sender": row["sender"],
                "receiver": row["receiver"],
                "comment": row["comment"],
                "operation_type": row["operation_type"],
                "source_object_id": row["source_object_id"],
                "currency": row["currency"],
                "block": row.get("block"),
                "block_id": row.get("block_id")
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

