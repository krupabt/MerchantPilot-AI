import os
import shutil
import sqlite3
import random
from datetime import datetime, timedelta

def reset_and_seed(db_path="merchantpilot.db"):
    print(f"--- Starting Database Reset & Reseed for {db_path} ---")
    
    # 1. Backup existing database
    if os.path.exists(db_path):
        backup_path = "merchantpilot_backup.db"
        shutil.copyfile(db_path, backup_path)
        print(f"Backed up {db_path} to {backup_path}")

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 2. Clear ONLY demo merchant m_1001 records
    print("Purging legacy m_1001 records...")
    c.execute("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE merchant_id='m_1001')")
    c.execute("DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE merchant_id='m_1001')")
    c.execute("DELETE FROM orders WHERE merchant_id='m_1001'")
    c.execute("DELETE FROM stock_adjustments WHERE merchant_id='m_1001'")
    c.execute("DELETE FROM products WHERE merchant_id='m_1001'")
    c.execute("DELETE FROM audit_logs WHERE session_id LIKE '%seed%' OR session_id LIKE '%demo%'")
    conn.commit()

    # 3. Ensure tables and columns exist
    c.execute("""
        INSERT OR REPLACE INTO merchants (id, name, email, currency, business_category, phone, address, is_demo, created_at)
        VALUES (
            'm_1001',
            'Smart Accessories Store',
            'admin@smartaccessories.com',
            'INR',
            'Mobile & Tech Accessories',
            '+91 98765 43210',
            'Shop 14, Commercial Plaza, Bangalore, KA',
            1,
            '2026-08-01 10:00:00'
        )
    """)

    # Ensure categories exist
    categories = [
        ("cat_cables", "Cables", "cables", "Fast charging and durable sync cables"),
        ("cat_peripherals", "Peripherals", "peripherals", "Ergonomic wireless mice and precision mouse pads"),
        ("cat_audio", "Audio", "audio", "In-ear stereo earphones and audio cables"),
        ("cat_protection", "Protection", "protection", "Shockproof phone cases and tempered glass screen guards"),
        ("cat_stands", "Stands", "stands", "Desktop phone holders and adjustable metallic mobile stands"),
        ("cat_accessories", "Accessories", "accessories", "Adapters, organizers, LED lights, and tech cleaning kits")
    ]
    for cid, name, slug, desc in categories:
        c.execute("""
            INSERT OR REPLACE INTO categories (id, name, slug, description)
            VALUES (?, ?, ?, ?)
        """, (cid, name, slug, desc))

    # 4. Insert Exactly 15 Realistic Demo Products
    products_data = [
        ("ACC_USB_01", "ACC-USB-01", "USB Cable", "cat_cables", "Cables", "Braided 60W USB-C fast charging cable (1.5m)", 80.0, 120.0, 30, 8, "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=600&q=80"),
        ("ACC_MOU_02", "ACC-MOU-02", "Wireless Mouse", "cat_peripherals", "Peripherals", "Ergonomic 2.4GHz optical wireless mouse with silent clicks", 250.0, 350.0, 20, 5, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80"),
        ("ACC_EAR_03", "ACC-EAR-03", "Earphones", "cat_audio", "Audio", "In-ear wired earphones with dynamic bass and inline HD mic", 150.0, 220.0, 25, 6, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"),
        ("ACC_COV_04", "ACC-COV-04", "Phone Cover", "cat_protection", "Protection", "Shockproof matte TPU protective phone case with raised camera bezel", 60.0, 100.0, 30, 8, "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80"),
        ("ACC_STA_05", "ACC-STA-05", "Mobile Stand", "cat_stands", "Stands", "Adjustable solid aluminum desktop mobile stand with anti-slip silicone", 100.0, 150.0, 20, 5, "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80"),
        ("ACC_PAD_06", "ACC-PAD-06", "Mouse Pad", "cat_peripherals", "Peripherals", "Smooth speed-weave fabric mouse pad with non-slip natural rubber base", 40.0, 80.0, 25, 6, "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80"),
        ("ACC_SCR_07", "ACC-SCR-07", "Screen Protector", "cat_protection", "Protection", "9H tempered glass screen protector with oleophobic coating", 50.0, 100.0, 30, 8, "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80"),
        ("ACC_ADA_08", "ACC-ADA-08", "USB Adapter", "cat_accessories", "Accessories", "Compact aluminum OTG Type-C to USB 3.0 high-speed adapter", 70.0, 130.0, 20, 5, "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"),
        ("ACC_ORG_09", "ACC-ORG-09", "Cable Organizer", "cat_accessories", "Accessories", "5-channel flexible silicone desk cable management clips", 30.0, 60.0, 25, 6, "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80"),
        ("ACC_HOL_10", "ACC-HOL-10", "Phone Holder", "cat_stands", "Stands", "Universal 360-degree magnetic car air vent phone holder mount", 120.0, 180.0, 20, 5, "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80"),
        ("ACC_CHG_11", "ACC-CHG-11", "Wall Charger", "cat_cables", "Cables", "Dual-port 20W fast charging wall adapter with surge protection", 170.0, 250.0, 3, 4, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80"),  # Low stock demo!
        ("ACC_LED_12", "ACC-LED-12", "USB LED Light", "cat_accessories", "Accessories", "Flexible mini USB portable LED reading lamp for laptops and powerbanks", 50.0, 90.0, 20, 5, "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80"),
        ("ACC_CLN_13", "ACC-CLN-13", "Cleaning Kit", "cat_accessories", "Accessories", "Multi-function 7-in-1 screen cleaner spray, brush and keycap puller", 90.0, 150.0, 15, 4, "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80"),
        ("ACC_AUX_14", "ACC-AUX-14", "AUX Cable", "cat_audio", "Audio", "Gold-plated 3.5mm male-to-male nylon braided audio aux cord (1m)", 60.0, 110.0, 20, 5, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"),
        ("ACC_HUB_15", "ACC-HUB-15", "USB Hub", "cat_accessories", "Accessories", "4-port USB 3.0 high-speed data splitter hub with LED indicator", 200.0, 299.0, 2, 4, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80")   # Low stock demo!
    ]

    for pid, sku, name, cat_id, cat_name, desc, cost, price, stock, threshold, img in products_data:
        c.execute("""
            INSERT OR REPLACE INTO products (
                id, merchant_id, category_id, sku, name, category, description,
                price, cost_price, stock, low_stock_threshold, currency, rating,
                image_url, is_active, created_at
            ) VALUES (?, 'm_1001', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 4.8, ?, 1, '2026-08-01 10:00:00')
        """, (pid, cat_id, sku, name, cat_name, desc, price, cost, stock, threshold, img))

    conn.commit()
    print(f"Inserted exactly {len(products_data)} demo products for m_1001.")

    # 5. Create Small Realistic Sales History for m_1001 across last 7 days
    # ~4 to 6 orders per day, amounts ₹60 to ₹500
    prod_map = {p[0]: {"name": p[2], "price": p[7], "cost": p[6]} for p in products_data}

    # Frequent baskets for Apriori:
    # 1. USB Cable + Phone Cover (12 orders)
    # 2. Earphones + USB Cable (9 orders)
    # 3. Wireless Mouse + Mouse Pad (7 orders)
    # 4. Phone Cover + Screen Protector (8 orders)
    # Plus individual items
    sales_baskets = [
        # (item_ids, discount, channel, payment_method, customer_name, day_offset, hour_offset)
        # Day 0 (Today: 5 orders)
        (["ACC_USB_01", "ACC_COV_04"], 20.0, "POS", "CASH", "Walk-in Customer", 0, 2),
        (["ACC_EAR_03", "ACC_USB_01"], 0.0, "ONLINE", "RAZORPAY", "Ananya Verma", 0, 4),
        (["ACC_MOU_02"], 0.0, "POS", "UPI", "Rohan Mehta", 0, 5),
        (["ACC_SCR_07", "ACC_COV_04"], 10.0, "POS", "CASH", "Walk-in Customer", 0, 7),
        (["ACC_ORG_09"], 0.0, "POS", "CASH", "Walk-in Customer", 0, 8),

        # Day 1 (Yesterday: 5 orders)
        (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "UPI", "Vikram Singh", 1, 3),
        (["ACC_MOU_02", "ACC_PAD_06"], 30.0, "POS", "CARD", "Priya Patel", 1, 5),
        (["ACC_EAR_03"], 0.0, "ONLINE", "RAZORPAY", "Aarav Sharma", 1, 7),
        (["ACC_STA_05", "ACC_USB_01"], 20.0, "POS", "CASH", "Walk-in Customer", 1, 9),
        (["ACC_LED_12"], 0.0, "POS", "CASH", "Walk-in Customer", 1, 11),

        # Day 2 (2 days ago: 6 orders)
        (["ACC_COV_04", "ACC_SCR_07"], 20.0, "POS", "UPI", "Neha Gupta", 2, 2),
        (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "CASH", "Walk-in Customer", 2, 4),
        (["ACC_EAR_03", "ACC_USB_01"], 20.0, "POS", "CASH", "Walk-in Customer", 2, 6),
        (["ACC_ADA_08"], 0.0, "ONLINE", "RAZORPAY", "Karan Kapoor", 2, 8),
        (["ACC_MOU_02", "ACC_PAD_06"], 0.0, "POS", "CARD", "Rahul Sharma", 2, 10),
        (["ACC_AUX_14"], 0.0, "POS", "CASH", "Walk-in Customer", 2, 12),

        # Day 3 (3 days ago: 5 orders)
        (["ACC_USB_01", "ACC_COV_04"], 20.0, "POS", "CASH", "Walk-in Customer", 3, 3),
        (["ACC_EAR_03", "ACC_USB_01"], 0.0, "POS", "UPI", "Meera Nair", 3, 5),
        (["ACC_MOU_02", "ACC_PAD_06"], 20.0, "ONLINE", "RAZORPAY", "Arjun Reddy", 3, 7),
        (["ACC_COV_04", "ACC_SCR_07"], 0.0, "POS", "CASH", "Walk-in Customer", 3, 9),
        (["ACC_CHG_11"], 0.0, "POS", "UPI", "Walk-in Customer", 3, 11),

        # Day 4 (4 days ago: 5 orders)
        (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "CASH", "Walk-in Customer", 4, 2),
        (["ACC_EAR_03", "ACC_USB_01"], 20.0, "POS", "CARD", "Siddharth Rao", 4, 4),
        (["ACC_COV_04", "ACC_SCR_07"], 10.0, "POS", "UPI", "Tanvi Joshi", 4, 6),
        (["ACC_MOU_02"], 0.0, "POS", "CASH", "Walk-in Customer", 4, 8),
        (["ACC_CLN_13"], 0.0, "POS", "CASH", "Walk-in Customer", 4, 10),

        # Day 5 (5 days ago: 5 orders)
        (["ACC_USB_01", "ACC_COV_04"], 20.0, "ONLINE", "RAZORPAY", "Divya Menon", 5, 3),
        (["ACC_MOU_02", "ACC_PAD_06"], 30.0, "POS", "CASH", "Walk-in Customer", 5, 5),
        (["ACC_EAR_03", "ACC_USB_01"], 0.0, "POS", "UPI", "Kavita Shah", 5, 7),
        (["ACC_COV_04", "ACC_SCR_07"], 0.0, "POS", "CASH", "Walk-in Customer", 5, 9),
        (["ACC_HOL_10"], 0.0, "POS", "CASH", "Walk-in Customer", 5, 11),

        # Day 6 (6 days ago: 4 orders)
        (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "CASH", "Walk-in Customer", 6, 4),
        (["ACC_EAR_03", "ACC_USB_01"], 20.0, "POS", "UPI", "Aditya Kulkarni", 6, 6),
        (["ACC_COV_04", "ACC_SCR_07"], 10.0, "POS", "CARD", "Shreya Bhat", 6, 8),
        (["ACC_MOU_02", "ACC_PAD_06"], 0.0, "POS", "CASH", "Walk-in Customer", 6, 10),
    ]

    base_time = datetime.utcnow()
    total_revenue_gen = 0.0
    total_cogs_gen = 0.0

    for idx, (item_ids, discount, channel, pay_method, cust_name, d_offset, h_offset) in enumerate(sales_baskets, start=101):
        ord_id = f"ord_seed_acc_{idx}"
        ord_time = (base_time - timedelta(days=d_offset, hours=h_offset)).strftime("%Y-%m-%d %H:%M:%S")
        
        subtotal = sum(prod_map[pid]["price"] for pid in item_ids)
        final_amt = round(max(0.0, subtotal - discount), 2)
        cogs = sum(prod_map[pid]["cost"] for pid in item_ids)
        
        total_revenue_gen += final_amt
        total_cogs_gen += cogs

        c.execute("""
            INSERT INTO orders (
                id, merchant_id, customer_name, customer_email, subtotal_amount,
                discount_amount, final_amount, currency, status, fulfillment_status,
                sales_channel, payment_method, is_ai_assisted, is_bundle, created_at, updated_at
            ) VALUES (?, 'm_1001', ?, ?, ?, ?, ?, 'INR', 'PAID', 'DELIVERED', ?, ?, ?, ?, ?, ?)
        """, (
            ord_id,
            cust_name,
            f"{cust_name.lower().replace(' ', '')}@example.com",
            subtotal,
            discount,
            final_amt,
            channel,
            pay_method,
            1 if len(item_ids) > 1 else 0,
            1 if len(item_ids) > 1 else 0,
            ord_time,
            ord_time
        ))

        for pid in item_ids:
            pinfo = prod_map[pid]
            c.execute("""
                INSERT INTO order_items (
                    id, order_id, product_id, product_name, quantity, unit_price, unit_cost, total_price
                ) VALUES (?, ?, ?, ?, 1, ?, ?, ?)
            """, (
                f"item_{ord_id}_{pid}",
                ord_id,
                pid,
                pinfo["name"],
                pinfo["price"],
                pinfo["cost"],
                pinfo["price"]
            ))

        # Add matching payment record
        c.execute("""
            INSERT INTO payments (
                id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
                amount, currency, status, verification_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'sig_verified_demo', ?, 'INR', 'CAPTURED', 'VERIFIED', ?, ?)
        """, (
            f"pay_{ord_id}",
            ord_id,
            f"rzp_order_{ord_id}",
            f"rzp_pay_{ord_id}",
            final_amt,
            ord_time,
            ord_time
        ))

    conn.commit()

    # 6. Verify Summary
    c.execute("SELECT COUNT(*), SUM(final_amount) FROM orders WHERE merchant_id='m_1001'")
    total_ord, total_rev = c.fetchone()
    gross_prof = total_revenue_gen - total_cogs_gen
    margin_pct = (gross_prof / total_revenue_gen * 100) if total_revenue_gen > 0 else 0
    print(f"\n✅ Clean Demo Reseed Complete for m_1001:")
    print(f"  • Total Orders: {total_ord}")
    print(f"  • Total Revenue: ₹{total_rev:,.2f}")
    print(f"  • Total COGS: ₹{total_cogs_gen:,.2f}")
    print(f"  • Total Gross Profit: ₹{gross_prof:,.2f} ({margin_pct:.1f}% margin)")
    print(f"  • Average Bill: ₹{(total_rev / total_ord):,.2f}")

    conn.close()

if __name__ == "__main__":
    reset_and_seed()
