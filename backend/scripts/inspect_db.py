import sqlite3
import os

db_path = "merchantpilot.db"
print(f"Inspecting {db_path} (exists: {os.path.exists(db_path)})...")
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT COUNT(*), SUM(final_amount) FROM orders WHERE merchant_id='m_1001'")
    print("Orders for m_1001:", c.fetchone())
    c.execute("SELECT COUNT(*), SUM(final_amount) FROM orders WHERE merchant_id='m_1001' AND status='PAID'")
    print("Paid orders for m_1001:", c.fetchone())
    c.execute("SELECT id, name, price, cost_price, stock FROM products WHERE merchant_id='m_1001'")
    rows = c.fetchall()
    print(f"Total products for m_1001: {len(rows)}")
    for r in rows:
        print(" ", r)
    conn.close()
