import uuid
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.merchant import Merchant
from backend.app.models.category import Category
from backend.app.models.product import Product
from backend.app.models.policy import Policy
from backend.app.models.customer import Customer
from backend.app.models.order import Order, OrderItem
from backend.app.models.payment import Payment
from backend.app.models.audit import AuditLog
from backend.app.models.user import User
from backend.app.services.auth_service import hash_password

DEMO_CATEGORIES = [
    {"name": "Cables", "slug": "cables", "description": "Fast charging and durable sync cables"},
    {"name": "Peripherals", "slug": "peripherals", "description": "Ergonomic wireless mice and precision mouse pads"},
    {"name": "Audio", "slug": "audio", "description": "In-ear stereo earphones and audio cables"},
    {"name": "Protection", "slug": "protection", "description": "Shockproof phone cases and tempered glass screen guards"},
    {"name": "Stands", "slug": "stands", "description": "Desktop phone holders and adjustable metallic mobile stands"},
    {"name": "Accessories", "slug": "accessories", "description": "Adapters, organizers, LED lights, and tech cleaning kits"},
    {"name": "Laptops", "slug": "laptops", "description": "Developer workstations (legacy test fixture)"}
]

# EXACT 15 DEMO PRODUCTS WITH LOCAL STATIC OPTIMIZED ASSETS
DEMO_ACCESSORIES_15 = [
    ("ACC_USB_01", "ACC-USB-01", "USB Cable", "cat_cables", "Cables", "Braided 60W USB-C fast charging cable (1.5m)", 80.0, 120.0, 30, 8, "/images/products/acc_usb_01.webp"),
    ("ACC_MOU_02", "ACC-MOU-02", "Wireless Mouse", "cat_peripherals", "Peripherals", "Ergonomic 2.4GHz optical wireless mouse with silent clicks", 250.0, 350.0, 20, 5, "/images/products/acc_mou_02.webp"),
    ("ACC_EAR_03", "ACC-EAR-03", "Earphones", "cat_audio", "Audio", "In-ear wired earphones with dynamic bass and inline HD mic", 150.0, 220.0, 25, 6, "/images/products/acc_ear_03.webp"),
    ("ACC_COV_04", "ACC-COV-04", "Phone Cover", "cat_protection", "Protection", "Shockproof matte TPU protective phone case with raised camera bezel", 60.0, 100.0, 30, 8, "/images/products/acc_cov_04.webp"),
    ("ACC_STA_05", "ACC-STA-05", "Mobile Stand", "cat_stands", "Stands", "Adjustable solid aluminum desktop mobile stand with anti-slip silicone", 100.0, 150.0, 20, 5, "/images/products/acc_sta_05.webp"),
    ("ACC_PAD_06", "ACC-PAD-06", "Mouse Pad", "cat_peripherals", "Peripherals", "Smooth speed-weave fabric mouse pad with non-slip natural rubber base", 40.0, 80.0, 25, 6, "/images/products/acc_pad_06.webp"),
    ("ACC_SCR_07", "ACC-SCR-07", "Screen Protector", "cat_protection", "Protection", "9H tempered glass screen protector with oleophobic coating", 50.0, 100.0, 30, 8, "/images/products/acc_scr_07.webp"),
    ("ACC_ADA_08", "ACC-ADA-08", "USB Adapter", "cat_accessories", "Accessories", "Compact aluminum OTG Type-C to USB 3.0 high-speed adapter", 70.0, 130.0, 20, 5, "/images/products/acc_ada_08.webp"),
    ("ACC_ORG_09", "ACC-ORG-09", "Cable Organizer", "cat_accessories", "Accessories", "5-channel flexible silicone desk cable management clips", 30.0, 60.0, 25, 6, "/images/products/acc_org_09.webp"),
    ("ACC_HOL_10", "ACC-HOL-10", "Phone Holder", "cat_stands", "Stands", "Universal 360-degree magnetic car air vent phone holder mount", 120.0, 180.0, 20, 5, "/images/products/acc_hol_10.webp"),
    ("ACC_CHG_11", "ACC-CHG-11", "Wall Charger", "cat_cables", "Cables", "Dual-port 20W fast charging wall adapter with surge protection", 170.0, 250.0, 3, 4, "/images/products/acc_chg_11.webp"),
    ("ACC_LED_12", "ACC-LED-12", "USB LED Light", "cat_accessories", "Accessories", "Flexible mini USB portable LED reading lamp for laptops and powerbanks", 50.0, 90.0, 20, 5, "/images/products/acc_led_12.webp"),
    ("ACC_CLN_13", "ACC-CLN-13", "Cleaning Kit", "cat_accessories", "Accessories", "Multi-function 7-in-1 screen cleaner spray, brush and keycap puller", 90.0, 150.0, 15, 4, "/images/products/acc_cln_13.webp"),
    ("ACC_AUX_14", "ACC-AUX-14", "AUX Cable", "cat_audio", "Audio", "Gold-plated 3.5mm male-to-male nylon braided audio aux cord (1m)", 60.0, 110.0, 20, 5, "/images/products/acc_aux_14.webp"),
    ("ACC_HUB_15", "ACC-HUB-15", "USB Hub", "cat_accessories", "Accessories", "4-port USB 3.0 high-speed data splitter hub with LED indicator", 200.0, 299.0, 2, 4, "/images/products/acc_hub_15.webp")
]
DEMO_PRODUCTS = DEMO_ACCESSORIES_15

def seed_database(db: Session = None):
    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        # 1. Seed Categories
        cat_map = {}
        for c_data in DEMO_CATEGORIES:
            cat = db.query(Category).filter(Category.slug == c_data["slug"]).first()
            if not cat:
                cat = Category(
                    id=f"cat_{c_data['slug']}",
                    name=c_data["name"],
                    slug=c_data["slug"],
                    description=c_data["description"]
                )
                db.add(cat)
                db.flush()
            cat_map[c_data["slug"]] = cat

        # 2. Seed Demo Merchant m_1001 (Smart Accessories Store)
        merchant = db.query(Merchant).filter(Merchant.id == "m_1001").first()
        if not merchant:
            merchant = Merchant(
                id="m_1001",
                name="Smart Accessories Store",
                email="admin@smartaccessories.com",
                business_category="Mobile & Tech Accessories",
                phone="+91 98765 43210",
                address="Shop 14, Commercial Plaza, Bangalore, KA",
                currency="INR",
                is_demo=True,
                created_at=datetime.utcnow() - timedelta(days=90)
            )
            db.add(merchant)
            db.flush()
        else:
            merchant.name = "Smart Accessories Store"
            merchant.business_category = "Mobile & Tech Accessories"
            merchant.is_demo = True

        # 3. Seed Commercial Policy
        policy = db.query(Policy).filter(Policy.merchant_id == "m_1001").first()
        if not policy:
            policy = Policy(
                id="pol_m_1001",
                merchant_id="m_1001",
                name="Retail Margin Protection Policy",
                max_discount_percentage=10.0,
                max_discount_amount=6000.0,
                max_transaction_amount=100000.0,
                allowed_actions=["search_catalog", "check_inventory", "create_offer", "validate_policy"],
                restricted_actions=["arbitrary_price_override", "negative_margin"],
                require_human_approval=True,
                is_active=True
            )
            db.add(policy)
            db.flush()
        else:
            policy.max_discount_percentage = 10.0
            policy.max_discount_amount = 6000.0
            policy.max_transaction_amount = 100000.0

        # 4. Seed Exactly 15 Products for m_1001
        for pid, sku, name, cat_slug, cat_name, desc, cost, price, stock, threshold, img in DEMO_ACCESSORIES_15:
            cat_obj = cat_map.get(cat_slug.replace("cat_", ""))
            cat_id = cat_obj.id if cat_obj else None
            existing = db.query(Product).filter(Product.id == pid, Product.merchant_id == "m_1001").first()
            if not existing:
                prod = Product(
                    id=pid,
                    merchant_id="m_1001",
                    category_id=cat_id,
                    sku=sku,
                    name=name,
                    category=cat_name,
                    description=desc,
                    cost_price=cost,
                    price=price,
                    stock=stock,
                    low_stock_threshold=threshold,
                    currency="INR",
                    rating=4.8,
                    image_url=img,
                    specs={"warranty": "1 Year Replacement", "origin": "Retail Certified"},
                    tags=[name.lower(), cat_name.lower(), "accessories", "fast delivery"],
                    is_active=True,
                    created_at=datetime.utcnow() - timedelta(days=60)
                )
                db.add(prod)
            else:
                existing.sku = sku
                existing.name = name
                existing.category = cat_name
                existing.cost_price = cost
                existing.price = price
                existing.stock = stock
                existing.low_stock_threshold = threshold
                existing.image_url = img
        db.flush()

        # Legacy test fixture products for unit test suite compatibility
        legacy_products = [
            ("P101", "SKU-LEGACY-P101", "Apex ProBook 15 Developer Edition", "Laptops", 39000.0, 60000.0, 18, 5, ["P102", "P103"], "High-performance developer laptop engineered for programming, coding, software development and heavy multitasking.", ["laptops", "programming", "coding", "developer", "fixture"]),
            ("P102", "SKU-LEGACY-P102", "ProClick Ergonomic Wireless Mouse", "Peripherals", 500.0, 1000.0, 45, 5, [], "Ergonomic high-precision wireless mouse with silent clicks.", ["peripherals", "mouse", "fixture"]),
            ("P103", "SKU-LEGACY-P103", "Voyager Tech Backpack", "Accessories", 1200.0, 2499.0, 30, 5, [], "Weatherproof durable tech backpack with laptop sleeve.", ["accessories", "backpack", "fixture"]),
            ("P107", "SKU-LEGACY-P107", "Apex Studio UltraBook 16", "Laptops", 55000.0, 75000.0, 8, 2, ["P102", "P103"], "Ultra-slim 16-inch high-performance studio workstation laptop.", ["laptops", "ultrabook", "fixture"]),
            ("P111", "SKU-LEGACY-P111", "UltraBook 14 Thin & Light", "Laptops", 35000.0, 52000.0, 10, 5, ["P102"], "Ultra-portable 14-inch thin and light laptop for travelers.", ["laptops", "thin-and-light", "fixture"])
        ]
        for lpid, lsku, lname, lcat, lcost, lprice, lstock, lthresh, lcomps, ldesc, ltags in legacy_products:
            lexist = db.query(Product).filter(Product.id == lpid).first()
            if not lexist:
                db.add(Product(
                    id=lpid,
                    merchant_id="m_1001",
                    sku=lsku,
                    name=lname,
                    category=lcat,
                    description=ldesc,
                    cost_price=lcost,
                    price=lprice,
                    stock=lstock,
                    low_stock_threshold=lthresh,
                    currency="INR",
                    rating=4.85,
                    image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
                    specs={"compatible_products": lcomps, "processor": "Intel i7", "ram": "32GB"},
                    compatible_product_ids=lcomps,
                    tags=ltags,
                    is_active=True,
                    is_published=False
                ))
            else:
                lexist.is_published = False
                lexist.stock = lstock
                lexist.price = lprice
                lexist.cost_price = lcost
                lexist.description = ldesc
                lexist.tags = ltags
                lexist.compatible_product_ids = lcomps
                lexist.specs = {"compatible_products": lcomps, "processor": "Intel i7", "ram": "32GB"}
        db.flush()

        # 5. Seed Users
        if not db.query(User).filter(User.email == "merchant@merchantpilot.ai").first():
            db.add(User(
                id="usr_demo_merchant",
                name="Demo Merchant",
                email="merchant@merchantpilot.ai",
                password_hash=hash_password("Admin@123456"),
                role="merchant",
                merchant_id="m_1001",
                created_at=datetime.utcnow() - timedelta(days=90)
            ))
            db.flush()

        if not db.query(User).filter(User.email == "customer@merchantpilot.ai").first():
            db.add(User(
                id="usr_demo_customer",
                name="Demo Customer",
                email="customer@merchantpilot.ai",
                password_hash=hash_password("Customer@123456"),
                role="customer",
                created_at=datetime.utcnow() - timedelta(days=90)
            ))
            db.flush()

        # 6. Seed/Refresh 7-Day Realistic Sales across Asia/Kolkata
        latest_seed = db.query(Order).filter(Order.id.like("ord_seed_acc_%")).order_by(Order.created_at.desc()).first()
        should_reseed = False
        if not latest_seed:
            should_reseed = True
        elif (datetime.utcnow() - latest_seed.created_at).total_seconds() > 43200: # 12 hours old
            should_reseed = True

        if should_reseed:
            # Delete old seed orders if refreshing timestamps
            old_orders = db.query(Order).filter(Order.id.like("ord_seed_acc_%")).all()
            for oo in old_orders:
                db.query(OrderItem).filter(OrderItem.order_id == oo.id).delete()
                db.query(Payment).filter(Payment.order_id == oo.id).delete()
                db.delete(oo)
            db.flush()

            prod_lookup = {p[0]: {"name": p[2], "price": p[7], "cost": p[6]} for p in DEMO_ACCESSORIES_15}
            prod_lookup["P101"] = {"name": "Apex ProBook 15", "price": 60000.0, "cost": 39000.0}
            prod_lookup["P102"] = {"name": "Wireless Mouse", "price": 1000.0, "cost": 500.0}
            prod_lookup["P103"] = {"name": "Voyager Backpack", "price": 2499.0, "cost": 1200.0}

            seed_baskets = [
                # Today (Day 0: 5 orders)
                (["ACC_USB_01", "ACC_COV_04"], 20.0, "POS", "CASH", "Walk-in Customer", 0, 2),
                (["ACC_EAR_03", "ACC_USB_01"], 0.0, "ONLINE", "RAZORPAY", "Ananya Verma", 0, 4),
                (["ACC_MOU_02"], 0.0, "POS", "UPI", "Rohan Mehta", 0, 5),
                (["ACC_SCR_07", "ACC_COV_04"], 10.0, "POS", "CASH", "Walk-in Customer", 0, 7),
                (["ACC_ORG_09"], 0.0, "POS", "CASH", "Walk-in Customer", 0, 8),
                # Yesterday (Day 1: 5 orders)
                (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "UPI", "Vikram Singh", 1, 3),
                (["ACC_MOU_02", "ACC_PAD_06"], 30.0, "POS", "CARD", "Priya Patel", 1, 5),
                (["ACC_EAR_03"], 0.0, "ONLINE", "RAZORPAY", "Aarav Sharma", 1, 7),
                (["ACC_STA_05", "ACC_USB_01"], 20.0, "POS", "CASH", "Walk-in Customer", 1, 9),
                (["ACC_LED_12"], 0.0, "POS", "CASH", "Walk-in Customer", 1, 11),
                # Day 2: 6 orders
                (["ACC_COV_04", "ACC_SCR_07"], 20.0, "POS", "UPI", "Neha Gupta", 2, 2),
                (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "CASH", "Walk-in Customer", 2, 4),
                (["ACC_EAR_03", "ACC_USB_01"], 20.0, "POS", "CASH", "Walk-in Customer", 2, 6),
                (["ACC_ADA_08"], 0.0, "ONLINE", "RAZORPAY", "Karan Kapoor", 2, 8),
                (["ACC_MOU_02", "ACC_PAD_06"], 0.0, "POS", "CARD", "Rahul Sharma", 2, 10),
                (["ACC_AUX_14"], 0.0, "POS", "CASH", "Walk-in Customer", 2, 12),
                # Day 3: 5 orders
                (["ACC_USB_01", "ACC_COV_04"], 20.0, "POS", "CASH", "Walk-in Customer", 3, 3),
                (["ACC_EAR_03", "ACC_USB_01"], 0.0, "POS", "UPI", "Meera Nair", 3, 5),
                (["ACC_MOU_02", "ACC_PAD_06"], 20.0, "ONLINE", "RAZORPAY", "Arjun Reddy", 3, 7),
                (["ACC_COV_04", "ACC_SCR_07"], 0.0, "POS", "CASH", "Walk-in Customer", 3, 9),
                (["ACC_CHG_11"], 0.0, "POS", "UPI", "Walk-in Customer", 3, 11),
                # Day 4: 5 orders
                (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "CASH", "Walk-in Customer", 4, 2),
                (["ACC_EAR_03", "ACC_USB_01"], 20.0, "POS", "CARD", "Siddharth Rao", 4, 4),
                (["ACC_COV_04", "ACC_SCR_07"], 10.0, "POS", "UPI", "Tanvi Joshi", 4, 6),
                (["ACC_MOU_02"], 0.0, "POS", "CASH", "Walk-in Customer", 4, 8),
                (["ACC_CLN_13"], 0.0, "POS", "CASH", "Walk-in Customer", 4, 10),
                # Day 5: 5 orders
                (["ACC_USB_01", "ACC_COV_04"], 20.0, "ONLINE", "RAZORPAY", "Divya Menon", 5, 3),
                (["ACC_MOU_02", "ACC_PAD_06"], 30.0, "POS", "CASH", "Walk-in Customer", 5, 5),
                (["ACC_EAR_03", "ACC_USB_01"], 0.0, "POS", "UPI", "Kavita Shah", 5, 7),
                (["ACC_COV_04", "ACC_SCR_07"], 0.0, "POS", "CASH", "Walk-in Customer", 5, 9),
                (["ACC_HOL_10"], 0.0, "POS", "CASH", "Walk-in Customer", 5, 11),
                # Day 6: 4 orders
                (["ACC_USB_01", "ACC_COV_04"], 0.0, "POS", "CASH", "Walk-in Customer", 6, 4),
                (["ACC_EAR_03", "ACC_USB_01"], 20.0, "POS", "UPI", "Aditya Kulkarni", 6, 6),
                (["ACC_COV_04", "ACC_SCR_07"], 10.0, "POS", "CARD", "Shreya Bhat", 6, 8),
                (["ACC_MOU_02", "ACC_PAD_06"], 0.0, "POS", "CASH", "Walk-in Customer", 6, 10),
            ]

            now = datetime.utcnow()
            for idx, (item_ids, discount, channel, pay_method, cust_name, d_off, h_off) in enumerate(seed_baskets, start=101):
                ord_id = f"ord_seed_acc_{idx}"
                ord_time = now - timedelta(days=d_off, hours=h_off)
                subtotal = sum(prod_lookup[pid]["price"] for pid in item_ids)
                final_amt = round(max(0.0, subtotal - discount), 2)

                order_rec = Order(
                    id=ord_id,
                    merchant_id="m_1001",
                    customer_name=cust_name,
                    customer_email=f"{cust_name.lower().replace(' ', '')}@example.com",
                    subtotal_amount=subtotal,
                    discount_amount=discount,
                    final_amount=final_amt,
                    currency="INR",
                    status="PAID",
                    fulfillment_status="DELIVERED",
                    sales_channel=channel,
                    payment_method=pay_method,
                    is_ai_assisted=True if len(item_ids) > 1 else False,
                    is_bundle=True if len(item_ids) > 1 else False,
                    created_at=ord_time,
                    updated_at=ord_time
                )
                db.add(order_rec)

                for pid in item_ids:
                    pinfo = prod_lookup[pid]
                    db.add(OrderItem(
                        id=f"item_{ord_id}_{pid}",
                        order_id=ord_id,
                        product_id=pid,
                        product_name=pinfo["name"],
                        quantity=1,
                        unit_price=pinfo["price"],
                        unit_cost=pinfo["cost"],
                        total_price=pinfo["price"]
                    ))

                db.add(Payment(
                    id=f"pay_{ord_id}",
                    order_id=ord_id,
                    razorpay_order_id=f"rzp_order_{ord_id}",
                    razorpay_payment_id=f"rzp_pay_{ord_id}",
                    razorpay_signature="sig_verified_demo",
                    amount=final_amt,
                    currency="INR",
                    status="CAPTURED",
                    verification_status="VERIFIED",
                    created_at=ord_time,
                    updated_at=ord_time
                ))

            db.flush()

        db.commit()
        print("Database seeded successfully with clean 15-product Smart Accessories demo catalog.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
