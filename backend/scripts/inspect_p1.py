import sqlite3

conn = sqlite3.connect('merchantpilot_backup.db')
c = conn.cursor()
c.execute("SELECT id, name, merchant_id FROM products WHERE id LIKE 'P1%'")
for r in c.fetchall():
    print(r)
conn.close()
