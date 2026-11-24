import csv
import io
import hashlib
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.product import Product
from backend.app.models.order import Order, OrderItem
from backend.app.models.category import Category
from backend.app.models.import_record import ImportRecord
from backend.app.models.stock_adjustment import StockAdjustment
from backend.app.models.audit import AuditLog

TEMPLATES = {
    "products": {
        "filename": "products_template.csv",
        "headers": ["name", "sku", "category", "description", "cost_price", "price", "stock", "low_stock_threshold"],
        "sample": [
            ["Wireless Mouse", "SKU-MOU-01", "Accessories", "2.4GHz Ergonomic Mouse with optical sensor", "400.00", "700.00", "20", "5"],
            ["Mechanical Keyboard", "SKU-KEY-02", "Accessories", "Compact mechanical keyboard with blue switches", "1200.00", "2400.00", "15", "3"],
            ["Cotton Polo Shirt", "SKU-APP-03", "Apparel", "100% Breathable cotton polo shirt", "350.00", "799.00", "40", "10"],
            ["Organic Green Tea 250g", "SKU-GRO-04", "Grocery", "High-altitude Darjeeling whole leaf green tea", "150.00", "280.00", "50", "10"]
        ]
    },
    "inventory": {
        "filename": "inventory_adjustments_template.csv",
        "headers": ["sku", "new_stock", "reorder_threshold", "reason"],
        "sample": [
            ["SKU-MOU-01", "35", "5", "Supplier bulk delivery arrival"],
            ["SKU-KEY-02", "20", "4", "Stock verification audit"]
        ]
    },
    "historical_sales": {
        "filename": "historical_sales_template.csv",
        "headers": ["order_id", "date", "customer_name", "customer_phone", "sku", "quantity", "unit_price", "discount", "payment_method"],
        "sample": [
            ["HIST-001", "2026-11-10", "Ananya Roy", "9876543210", "SKU-MOU-01", "2", "700.00", "0", "UPI"],
            ["HIST-002", "2026-11-12", "Vikram Patel", "9123456780", "SKU-KEY-02", "1", "2400.00", "100.00", "CARD"]
        ]
    }
}

class ImportService:
    @staticmethod
    def get_template_csv(template_type: str) -> str:
        t_key = template_type.lower().strip()
        if t_key not in TEMPLATES:
            t_key = "products"
        tmpl = TEMPLATES[t_key]
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(tmpl["headers"])
        for row in tmpl["sample"]:
            writer.writerow(row)
        return output.getvalue()

    @staticmethod
    def preview_import(db: Session, merchant_id: str, import_type: str, csv_content: str, filename: str) -> Dict[str, Any]:
        t_key = import_type.lower().strip()
        if t_key not in TEMPLATES:
            raise ValueError(f"Invalid import type '{import_type}'. Supported: products, inventory, historical_sales")

        # Compute hash to detect duplicate imports
        file_hash = hashlib.sha256(csv_content.encode("utf-8")).hexdigest()
        existing_import = db.query(ImportRecord).filter(
            ImportRecord.merchant_id == merchant_id,
            ImportRecord.file_hash == file_hash,
            ImportRecord.status == "SUCCESS"
        ).first()

        reader = csv.DictReader(io.StringIO(csv_content))
        if not reader.fieldnames:
            raise ValueError("Empty or unreadable CSV file.")

        expected_headers = TEMPLATES[t_key]["headers"]
        missing_headers = [h for h in expected_headers if h not in reader.fieldnames]
        if missing_headers:
            raise ValueError(f"Missing required CSV header columns: {', '.join(missing_headers)}")

        valid_rows = []
        errors = []
        existing_skus_in_db = {
            (p.sku or p.id).lower(): p for p in db.query(Product).filter(Product.merchant_id == merchant_id).all()
        }
        seen_skus_in_batch = set()

        for row_num, row in enumerate(reader, start=2):
            try:
                if t_key == "products":
                    name = (row.get("name") or "").strip()
                    sku = (row.get("sku") or "").strip()
                    cat = (row.get("category") or "General Retail").strip()
                    desc = (row.get("description") or f"{name} merchandise").strip()
                    price = float(row.get("price") or 0.0)
                    cost = float(row.get("cost_price") or 0.0)
                    stock = int(float(row.get("stock") or 0))
                    threshold = int(float(row.get("low_stock_threshold") or 5))

                    if not name:
                        errors.append({"row": row_num, "error": "Product name is required."})
                        continue
                    if price <= 0:
                        errors.append({"row": row_num, "error": f"Price must be > 0 (got {price})."})
                        continue
                    if cost < 0:
                        errors.append({"row": row_num, "error": f"Cost price cannot be negative."})
                        continue

                    if sku:
                        sku_lower = sku.lower()
                        if sku_lower in seen_skus_in_batch:
                            errors.append({"row": row_num, "error": f"Duplicate SKU '{sku}' found inside this CSV file."})
                            continue
                        seen_skus_in_batch.add(sku_lower)

                    valid_rows.append({
                        "name": name,
                        "sku": sku or f"SKU-{uuid.uuid4().hex[:6].upper()}",
                        "category": cat,
                        "description": desc,
                        "cost_price": cost,
                        "price": price,
                        "stock": max(0, stock),
                        "low_stock_threshold": max(1, threshold),
                        "exists_in_workspace": sku.lower() in existing_skus_in_db if sku else False
                    })

                elif t_key == "inventory":
                    sku = (row.get("sku") or "").strip()
                    new_stock = int(float(row.get("new_stock") or 0))
                    threshold = int(float(row.get("reorder_threshold") or 5))
                    reason = (row.get("reason") or "Bulk inventory adjustment").strip()

                    if not sku:
                        errors.append({"row": row_num, "error": "SKU is required."})
                        continue
                    if sku.lower() not in existing_skus_in_db:
                        errors.append({"row": row_num, "error": f"SKU '{sku}' not found in your workspace."})
                        continue

                    prod = existing_skus_in_db[sku.lower()]
                    valid_rows.append({
                        "product_id": prod.id,
                        "product_name": prod.name,
                        "sku": sku,
                        "current_stock": prod.stock,
                        "new_stock": max(0, new_stock),
                        "delta": max(0, new_stock) - prod.stock,
                        "reorder_threshold": threshold,
                        "reason": reason
                    })

                elif t_key == "historical_sales":
                    order_ref = (row.get("order_id") or f"HIST-{uuid.uuid4().hex[:6].upper()}").strip()
                    date_str = (row.get("date") or datetime.utcnow().strftime("%Y-%m-%d")).strip()
                    cust_name = (row.get("customer_name") or "Historical Buyer").strip()
                    cust_phone = (row.get("customer_phone") or "").strip()
                    sku = (row.get("sku") or "").strip()
                    qty = int(float(row.get("quantity") or 1))
                    unit_price = float(row.get("unit_price") or 0.0)
                    discount = float(row.get("discount") or 0.0)
                    pay_method = (row.get("payment_method") or "CASH").upper().strip()

                    if not sku:
                        errors.append({"row": row_num, "error": "SKU is required."})
                        continue
                    if sku.lower() not in existing_skus_in_db:
                        errors.append({"row": row_num, "error": f"SKU '{sku}' does not match any product in your workspace."})
                        continue
                    if qty <= 0:
                        errors.append({"row": row_num, "error": "Quantity must be at least 1."})
                        continue
                    if unit_price <= 0:
                        errors.append({"row": row_num, "error": "Unit price must be > 0."})
                        continue

                    prod = existing_skus_in_db[sku.lower()]
                    valid_rows.append({
                        "order_id": order_ref,
                        "date": date_str,
                        "customer_name": cust_name,
                        "customer_phone": cust_phone,
                        "product_id": prod.id,
                        "product_name": prod.name,
                        "sku": sku,
                        "quantity": qty,
                        "unit_price": unit_price,
                        "unit_cost": getattr(prod, "cost_price", 0.0) or 0.0,
                        "discount": discount,
                        "final_amount": max(0.0, round(unit_price * qty - discount, 2)),
                        "payment_method": pay_method
                    })
            except Exception as e:
                errors.append({"row": row_num, "error": str(e)})

        return {
            "file_hash": file_hash,
            "filename": filename,
            "import_type": t_key,
            "is_duplicate": existing_import is not None,
            "duplicate_warning": "Warning: A file with this exact content was already imported previously." if existing_import else None,
            "total_rows": len(valid_rows) + len(errors),
            "valid_rows_count": len(valid_rows),
            "valid_count": len(valid_rows),
            "invalid_rows_count": len(errors),
            "errors_count": len(errors),
            "preview_rows": valid_rows[:10],
            "all_valid_rows": valid_rows,
            "errors": errors
        }

    @staticmethod
    def execute_import(db: Session, merchant_id: str, import_type: str, file_hash: str, filename: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
        t_key = import_type.lower().strip()
        imported_count = 0

        # Check for duplicate
        existing = db.query(ImportRecord).filter(
            ImportRecord.merchant_id == merchant_id,
            ImportRecord.file_hash == file_hash,
            ImportRecord.status == "SUCCESS"
        ).first()
        if existing:
            raise ValueError("Duplicate import prevented: This file has already been imported into your workspace.")

        if t_key == "products":
            for r in rows:
                # If SKU exists, update it, else create
                existing_prod = db.query(Product).filter(
                    Product.merchant_id == merchant_id,
                    Product.sku == r["sku"]
                ).first()

                if existing_prod:
                    existing_prod.name = r["name"]
                    existing_prod.category = r["category"]
                    existing_prod.description = r["description"]
                    existing_prod.cost_price = r["cost_price"]
                    existing_prod.price = r["price"]
                    existing_prod.stock = r["stock"]
                    existing_prod.low_stock_threshold = r["low_stock_threshold"]
                    existing_prod.updated_at = datetime.utcnow()
                else:
                    # Match or create category
                    cat_slug = r["category"].lower().replace(" ", "-")
                    cat = db.query(Category).filter(Category.slug == cat_slug).first()
                    if not cat:
                        cat = Category(id=f"cat_{uuid.uuid4().hex[:8]}", name=r["category"], slug=cat_slug)
                        db.add(cat)
                        db.flush()

                    new_prod = Product(
                        id=f"P{uuid.uuid4().hex[:6].upper()}",
                        sku=r["sku"],
                        merchant_id=merchant_id,
                        category_id=cat.id,
                        name=r["name"],
                        category=r["category"],
                        description=r["description"],
                        cost_price=r["cost_price"],
                        price=r["price"],
                        currency="INR",
                        stock=r["stock"],
                        low_stock_threshold=r["low_stock_threshold"],
                        is_active=True
                    )
                    db.add(new_prod)
                imported_count += 1

        elif t_key == "inventory":
            for r in rows:
                prod = db.query(Product).filter(
                    Product.id == r["product_id"],
                    Product.merchant_id == merchant_id
                ).first()
                if prod:
                    prev = prod.stock
                    prod.stock = r["new_stock"]
                    prod.low_stock_threshold = r["reorder_threshold"]
                    prod.updated_at = datetime.utcnow()

                    adj = StockAdjustment(
                        id=f"adj_{uuid.uuid4().hex[:10]}",
                        merchant_id=merchant_id,
                        product_id=prod.id,
                        product_name=prod.name,
                        adjustment_type="RESTOCK" if r["delta"] > 0 else "MANUAL",
                        quantity_delta=r["delta"],
                        previous_stock=prev,
                        new_stock=r["new_stock"],
                        reason=f"CSV Inventory Import: {r.get('reason', '')}"
                    )
                    db.add(adj)
                    imported_count += 1

        elif t_key == "historical_sales":
            # Note: Requirement explicitly says:
            # "Imported historical sales must not incorrectly reduce current inventory a second time."
            for r in rows:
                order_dt = datetime.utcnow()
                try:
                    order_dt = datetime.strptime(r["date"], "%Y-%m-%d")
                except Exception:
                    pass

                hist_order = Order(
                    id=f"ord_hist_{uuid.uuid4().hex[:10]}",
                    merchant_id=merchant_id,
                    customer_name=r["customer_name"],
                    customer_phone=r["customer_phone"],
                    sales_channel="POS",
                    payment_method=r["payment_method"],
                    payment_reference=r["order_id"],
                    subtotal_amount=round(r["unit_price"] * r["quantity"], 2),
                    discount_amount=r["discount"],
                    final_amount=r["final_amount"],
                    status="PAID",
                    fulfillment_status="DELIVERED",
                    notes=f"Historical CSV Import (Ref: {r['order_id']})",
                    created_at=order_dt
                )
                db.add(hist_order)
                db.flush()

                order_item = OrderItem(
                    id=f"item_{uuid.uuid4().hex[:10]}",
                    order_id=hist_order.id,
                    product_id=r["product_id"],
                    product_name=r["product_name"],
                    quantity=r["quantity"],
                    unit_price=r["unit_price"],
                    unit_cost=r["unit_cost"],
                    total_price=r["final_amount"]
                )
                db.add(order_item)
                imported_count += 1

        # Record import audit
        rec = ImportRecord(
            id=f"imp_{uuid.uuid4().hex[:10]}",
            merchant_id=merchant_id,
            import_type=t_key.upper(),
            filename=filename,
            file_hash=file_hash,
            records_count=imported_count,
            status="SUCCESS",
            summary={"imported_count": imported_count, "import_type": t_key}
        )
        db.add(rec)
        db.commit()

        return {
            "success": True,
            "message": f"Successfully imported {imported_count} record(s) into your workspace.",
            "import_id": rec.id,
            "imported_count": imported_count
        }

    @staticmethod
    def list_import_history(db: Session, merchant_id: str) -> List[Dict[str, Any]]:
        records = (
            db.query(ImportRecord)
            .filter(ImportRecord.merchant_id == merchant_id)
            .order_by(ImportRecord.created_at.desc())
            .all()
        )
        return [
            {
                "id": r.id,
                "import_type": r.import_type,
                "filename": r.filename,
                "records_count": r.records_count,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ]
