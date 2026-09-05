import uuid
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.merchant import Merchant
from backend.app.models.product import Product
from backend.app.models.policy import Policy
from backend.app.models.customer import Customer
from backend.app.models.order import Order, OrderItem
from backend.app.models.payment import Payment
from backend.app.models.audit import AuditLog
from backend.app.models.user import User
from backend.app.services.auth_service import hash_password

DEMO_PRODUCTS = [
    {
        "id": "P101",
        "name": "Apex ProBook 15 Developer Edition",
        "category": "Laptops",
        "description": "High-performance developer workstation with 14-core Intel Core i7, 32GB DDR5 RAM, and 1TB NVMe Gen4 SSD.",
        "price": 60000.0,
        "currency": "INR",
        "stock": 18,
        "rating": 4.85,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "processor": "Intel Core i7-13700H (14-Core, up to 5.0 GHz)",
            "memory": "32GB DDR5 5200MHz",
            "storage": "1TB M.2 NVMe PCIe 4.0 SSD",
            "display": "15.6-inch QHD (2560x1440) 165Hz IPS 100% sRGB",
            "battery": "86Wh with 100W USB-C PD Fast Charging",
            "weight": "1.78 kg"
        },
        "compatible_product_ids": ["P102", "P103", "P104", "P105", "P112"],
        "tags": ["laptop", "programming", "developer", "coding", "workstation", "compute", "python", "fast"]
    },
    {
        "id": "P102",
        "name": "Apex Precision Wireless Mouse",
        "category": "Accessories",
        "description": "Ergonomic ultra-low latency wireless mouse with dual 2.4GHz/Bluetooth connectivity and silent tactile switches.",
        "price": 1000.0,
        "currency": "INR",
        "stock": 85,
        "rating": 4.75,
        "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "sensor": "4000 DPI Optical Precision Sensor",
            "battery_life": "70 days on single USB-C charge",
            "connectivity": "Bluetooth 5.2 + 2.4GHz USB Dongle",
            "weight": "85g"
        },
        "compatible_product_ids": ["P101", "P104", "P105", "P110", "P111"],
        "tags": ["mouse", "wireless", "ergonomic", "accessory", "peripheral", "bluetooth"]
    },
    {
        "id": "P103",
        "name": "Apex Pro Shield Laptop Bag",
        "category": "Accessories",
        "description": "Water-resistant weatherproof ballistic nylon laptop backpack with dedicated cushioned compartments and USB pass-through.",
        "price": 1500.0,
        "currency": "INR",
        "stock": 42,
        "rating": 4.65,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "capacity": "25 Liters",
            "material": "1680D Ballistic Nylon with Hydrophobic Coating",
            "compatibility": "Fits laptops up to 16-inch",
            "features": "TSA Checkpoint Friendly, Hidden Anti-Theft Pocket"
        },
        "compatible_product_ids": ["P101", "P111"],
        "tags": ["bag", "backpack", "case", "sleeve", "protection", "travel"]
    },
    {
        "id": "P104",
        "name": "Apex Tactile Mechanical Keyboard",
        "category": "Keyboards",
        "description": "Hot-swappable 75% compact mechanical keyboard with factory-lubed custom switches and per-key RGB backlighting.",
        "price": 3500.0,
        "currency": "INR",
        "stock": 30,
        "rating": 4.80,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "layout": "75% ANSI (82 Keys)",
            "switches": "Apex Linear Red Hot-Swappable",
            "keycaps": "Double-Shot PBT Cherry Profile",
            "connectivity": "Tri-Mode (USB-C, Bluetooth 5.0, 2.4GHz)"
        },
        "compatible_product_ids": ["P101", "P102", "P105", "P110"],
        "tags": ["keyboard", "mechanical", "rgb", "developer", "typing", "gaming"]
    },
    {
        "id": "P105",
        "name": "Apex 27-inch 4K UHD Monitor",
        "category": "Monitors",
        "description": "Factory calibrated 4K IPS creator display with 90W USB-C single cable power delivery and HDR400.",
        "price": 25000.0,
        "currency": "INR",
        "stock": 14,
        "rating": 4.90,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "panel": "27-inch IPS 4K (3840x2160) 60Hz",
            "color_accuracy": "Delta E < 2, 99% DCI-P3",
            "ports": "1x USB-C (90W PD, DP Alt), 2x HDMI 2.1, 1x DP 1.4, 4x USB-A 3.2",
            "stand": "Height, Pivot, Swivel, Tilt adjustable"
        },
        "compatible_product_ids": ["P101", "P106", "P112"],
        "tags": ["monitor", "display", "4k", "screen", "workstation", "creator", "usb-c"]
    },
    {
        "id": "P106",
        "name": "Apex Ultra-HD 4K Webcam",
        "category": "Accessories",
        "description": "Professional 4K streaming webcam with AI auto-framing, dual noise-canceling stereo microphones, and physical privacy shutter.",
        "price": 7000.0,
        "currency": "INR",
        "stock": 25,
        "rating": 4.70,
        "image_url": "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "resolution": "4K UHD @ 30fps / 1080p @ 60fps",
            "lens": "Glass lens with 90° FOV and Autofocus",
            "audio": "Dual Omnidirectional Noise Cancelling Mics",
            "mount": "Universal Monitor Clip + 1/4 inch Tripod Thread"
        },
        "compatible_product_ids": ["P101", "P105", "P108"],
        "tags": ["webcam", "camera", "video", "streaming", "zoom", "wfh", "calls"]
    },
    {
        "id": "P107",
        "name": "Apex 4K Cinema Camera",
        "category": "Cameras",
        "description": "Full-frame mirrorless cinema camera featuring 10-bit 4:2:2 internal recording, dual native ISO, and 5-axis IBIS.",
        "price": 75000.0,
        "currency": "INR",
        "stock": 8,
        "rating": 4.95,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "sensor": "24.2MP Full-Frame Exmor R CMOS Sensor",
            "video": "4K UHD 60p, 10-Bit 4:2:2 All-Intra, S-Cinetone",
            "stabilization": "5-Axis In-Body Image Stabilization (5.5 Stops)",
            "mount": "E-Mount Full Frame"
        },
        "compatible_product_ids": ["P108", "P109"],
        "tags": ["camera", "cinema", "video", "photography", "dslr", "4k", "creator"]
    },
    {
        "id": "P108",
        "name": "Apex Pro Carbon Fiber Tripod",
        "category": "Accessories",
        "description": "Ultra-rigid 8-layer carbon fiber heavy-duty tripod with 360° fluid panoramic ball head and Arca-Swiss quick release.",
        "price": 8500.0,
        "currency": "INR",
        "stock": 20,
        "rating": 4.88,
        "image_url": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "material": "8x Layer Carbon Fiber",
            "max_load": "12 kg (26.5 lbs)",
            "max_height": "168 cm (66 inches)",
            "folded_length": "42 cm",
            "weight": "1.35 kg"
        },
        "compatible_product_ids": ["P107", "P106"],
        "tags": ["tripod", "stand", "carbon", "camera", "mount", "video", "photo"]
    },
    {
        "id": "P109",
        "name": "Apex Studio ANC Wireless Headphones",
        "category": "Audio",
        "description": "Audiophile studio headphones with hybrid active noise cancellation, custom 45mm beryllium drivers, and LDAC high-res audio.",
        "price": 12000.0,
        "currency": "INR",
        "stock": 35,
        "rating": 4.82,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "driver": "45mm Custom Beryllium Acoustic Drivers",
            "anc": "4-Microphone Hybrid ANC (-38dB attenuation)",
            "battery": "45 Hours ANC On, Fast charge 10 min = 5 hrs",
            "codecs": "LDAC, AAC, aptX Adaptive, SBC"
        },
        "compatible_product_ids": ["P101", "P105", "P111"],
        "tags": ["headphones", "audio", "anc", "wireless", "studio", "sound", "music"]
    },
    {
        "id": "P110",
        "name": "Apex Ergonomic Extended Desk Mat",
        "category": "Accessories",
        "description": "Premium 900x400mm waterproof micro-textured surface desk pad with non-slip natural rubber base and anti-fray stitched edges.",
        "price": 800.0,
        "currency": "INR",
        "stock": 90,
        "rating": 4.60,
        "image_url": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "dimensions": "900 x 400 x 4 mm",
            "surface": "Spill-Resistant Micro-Weave Cloth",
            "base": "Textured Anti-Slip Natural Rubber"
        },
        "compatible_product_ids": ["P101", "P102", "P104", "P105"],
        "tags": ["mat", "deskpad", "mousepad", "desk", "setup", "accessory"]
    },
    {
        "id": "P111",
        "name": "Apex UltraBook 14 Thin & Light",
        "category": "Laptops",
        "description": "Ultra-portable aerospace aluminum laptop with Intel Core Ultra 7 processor, OLED 120Hz screen, and all-day 18-hour battery.",
        "price": 52000.0,
        "currency": "INR",
        "stock": 12,
        "rating": 4.78,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "processor": "Intel Core Ultra 7 155H with NPU AI Boost",
            "memory": "16GB LPDDR5X 7467MHz",
            "storage": "512GB NVMe PCIe 4.0 SSD",
            "display": "14.0-inch 2.8K (2880x1800) OLED 120Hz 0.2ms",
            "weight": "1.19 kg"
        },
        "compatible_product_ids": ["P102", "P103", "P109", "P112"],
        "tags": ["laptop", "ultrabook", "portable", "lightweight", "oled", "ai"]
    },
    {
        "id": "P112",
        "name": "Apex PowerDock 10-in-1 Thunderbolt Hub",
        "category": "Accessories",
        "description": "Dual 4K display output hub with 100W Power Delivery pass-through, Gigabit Ethernet, SD 4.0 card reader, and 10Gbps USB-C.",
        "price": 5500.0,
        "currency": "INR",
        "stock": 28,
        "rating": 4.86,
        "image_url": "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "power": "100W USB-C Power Delivery Input",
            "ports": "2x HDMI 4K@60Hz, 1x Gigabit RJ45, 3x USB 3.2 10Gbps, SD/TF, 3.5mm Audio",
            "casing": "Anodized Aluminum Alloy"
        },
        "compatible_product_ids": ["P101", "P105", "P111"],
        "tags": ["hub", "dock", "thunderbolt", "usb-c", "adapter", "monitor", "lan"]
    }
]

def seed_database(db: Session = None):
    """
    Seeds database with realistic electronics merchant, products, active policies,
    and 60+ realistic historical transaction baskets for robust association rule mining.
    """
    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        # 1. Seed Merchant
        merchant = db.query(Merchant).filter(Merchant.id == "m_1001").first()
        if not merchant:
            merchant = Merchant(
                id="m_1001",
                name="Apex Electronics & Compute",
                email="admin@apexelectronics.com",
                currency="INR",
                created_at=datetime.utcnow() - timedelta(days=180)
            )
            db.add(merchant)
            db.flush()

        # 2. Seed Default Policy
        policy = db.query(Policy).filter(Policy.id == "pol_default").first()
        if not policy:
            policy = Policy(
                id="pol_default",
                merchant_id="m_1001",
                name="Standard Commercial Guardrail Policy",
                max_discount_percentage=10.0,
                max_discount_amount=6000.0,
                max_transaction_amount=100000.0,
                allowed_actions=[
                    "search_catalog", "get_product_details", "check_inventory",
                    "get_sales_insights", "recommend_upsell", "recommend_cross_sell",
                    "create_offer", "validate_policy", "create_cart",
                    "create_razorpay_order", "check_payment_status", "record_audit_event"
                ],
                restricted_actions=[
                    "refund", "arbitrary_price_override", "money_transfer",
                    "bypass_approval_gate", "modify_merchant_ledger"
                ],
                require_human_approval=True,
                is_active=True
            )
            db.add(policy)
            db.flush()

        # 3. Seed Products
        for prod_data in DEMO_PRODUCTS:
            existing = db.query(Product).filter(Product.id == prod_data["id"]).first()
            if not existing:
                prod = Product(
                    id=prod_data["id"],
                    merchant_id="m_1001",
                    name=prod_data["name"],
                    category=prod_data["category"],
                    description=prod_data["description"],
                    price=prod_data["price"],
                    currency=prod_data["currency"],
                    stock=prod_data["stock"],
                    rating=prod_data["rating"],
                    image_url=prod_data["image_url"],
                    specs=prod_data["specs"],
                    compatible_product_ids=prod_data["compatible_product_ids"],
                    tags=prod_data["tags"],
                    is_active=True,
                    created_at=datetime.utcnow() - timedelta(days=120)
                )
                db.add(prod)
        db.flush()

        # 4. Seed Customers
        customers = [
            ("cust_101", "Aarav Sharma", "aarav.sharma@techdev.io", "9876543210"),
            ("cust_102", "Priya Patel", "priya.patel@designstudio.in", "9876543211"),
            ("cust_103", "Rohan Mehta", "rohan.mehta@fintechventures.com", "9876543212"),
            ("cust_104", "Ananya Verma", "ananya.v@cinemacreators.net", "9876543213"),
            ("cust_105", "Vikram Singh", "vikram.singh@startupforge.io", "9876543214"),
        ]
        for cid, name, email, phone in customers:
            if not db.query(Customer).filter(Customer.id == cid).first():
                db.add(Customer(id=cid, name=name, email=email, phone=phone, created_at=datetime.utcnow() - timedelta(days=90)))
        db.flush()

        # Seed Demo Merchant User
        if db.query(User).count() == 0:
            db.add(User(
                id="usr_demo_merchant",
                name="Demo Merchant",
                email="merchant@merchantpilot.ai",
                password_hash=hash_password("Admin@123456"),
                role="merchant",
                created_at=datetime.utcnow() - timedelta(days=90)
            ))
            db.flush()

        # 5. Seed Realistic Historical Order Baskets (60+ orders)
        existing_orders_count = db.query(Order).count()
        if existing_orders_count < 10:
            prod_lookup = {p["id"]: p for p in DEMO_PRODUCTS}

            # High Affinity Basket Patterns for Market Basket Mining
            basket_templates = [
                # Pattern 1: Laptop + Mouse (Heavy co-occurrence ~ 80%)
                (["P101", "P102"], 501.0, "Developer Starter Kit", True, True, 20),
                # Pattern 2: Laptop + Bag (High co-occurrence ~ 45%)
                (["P101", "P103"], 300.0, "Mobile Pro Bundle", True, True, 10),
                # Pattern 3: Camera + Tripod (Cinema combination ~ 75%)
                (["P107", "P108"], 1501.0, "Content Creator Pro Kit", True, True, 12),
                # Pattern 4: Monitor + Webcam (Workstation pair ~ 55%)
                (["P105", "P106"], 1001.0, "Ergonomic WFH Workstation", True, True, 8),
                # Pattern 5: Keyboard + Mouse + Mat (Desk setup ~ 60%)
                (["P104", "P102", "P110"], 450.0, "Tactile Desk Master Bundle", True, True, 9),
                # Pattern 6: Single Product orders
                (["P101"], 0.0, None, False, False, 5),
                (["P111"], 0.0, None, False, False, 4),
                (["P109"], 0.0, None, False, False, 6),
                (["P105"], 0.0, None, False, False, 4),
            ]

            order_counter = 1000
            for item_ids, discount, b_name, is_ai, is_bundle, freq in basket_templates:
                for f in range(freq):
                    order_counter += 1
                    ord_id = f"ord_seed_{order_counter}"
                    days_ago = random.randint(1, 60)
                    ord_date = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(1, 23), minutes=random.randint(1, 59))
                    
                    subtotal = sum(prod_lookup[pid]["price"] for pid in item_ids)
                    final_amt = max(0.0, subtotal - discount)
                    
                    order_rec = Order(
                        id=ord_id,
                        merchant_id="m_1001",
                        customer_id=random.choice(customers)[0],
                        session_id=f"sess_seed_{order_counter}" if is_ai else None,
                        subtotal_amount=round(subtotal, 2),
                        discount_amount=round(discount, 2),
                        final_amount=round(final_amt, 2),
                        currency="INR",
                        status="PAID",
                        is_ai_assisted=is_ai,
                        is_bundle=is_bundle,
                        bundle_name=b_name,
                        policy_approval_token=f"appr_seed_{order_counter}" if discount > 0 else None,
                        created_at=ord_date,
                        updated_at=ord_date
                    )
                    db.add(order_rec)

                    for pid in item_ids:
                        p_info = prod_lookup[pid]
                        item_rec = OrderItem(
                            id=f"item_seed_{order_counter}_{pid}",
                            order_id=ord_id,
                            product_id=pid,
                            product_name=p_info["name"],
                            quantity=1,
                            unit_price=p_info["price"],
                            total_price=p_info["price"]
                        )
                        db.add(item_rec)

                    # Add matching Payment record
                    pay_rec = Payment(
                        id=f"pay_seed_{order_counter}",
                        order_id=ord_id,
                        razorpay_order_id=f"order_seed_{order_counter}",
                        razorpay_payment_id=f"pay_seed_{order_counter}",
                        razorpay_signature=f"test_sig_{uuid.uuid4().hex[:16]}",
                        amount=final_amt,
                        currency="INR",
                        status="CAPTURED",
                        verification_status="VERIFIED_HMAC",
                        created_at=ord_date,
                        updated_at=ord_date
                    )
                    db.add(pay_rec)

            db.flush()

        # 6. Seed Sample Audit Trail Logs
        existing_logs = db.query(AuditLog).count()
        if existing_logs < 5:
            sample_logs = [
                ("AI_BUYER", "NATURAL_LANGUAGE_REQUEST", "Customer requested laptop for programming under ₹65,000 and a mouse.", "PERMITTED", None, None, "PASSED"),
                ("AI_MERCHANT_AGENT", "SEARCH_CATALOG", "Searched catalog for Developer Workstation and Wireless Accessories.", "PERMITTED", None, None, "PASSED"),
                ("AI_MERCHANT_AGENT", "REVENUE_INTELLIGENCE_ANALYSIS", "Identified 82% co-occurrence between ProBook 15 and Precision Mouse.", "PERMITTED", None, None, "PASSED"),
                ("POLICY_ENGINE", "VALIDATE_OFFER_COMPLIANCE", "Proposed ₹501 discount (0.82%) on ₹61,000 basket within 10% policy limit.", "PERMITTED", 60499.0, "COMMERCIAL_GUARDRAILS", "PASSED"),
                ("APPROVAL_GATE", "HUMAN_APPROVAL_CONFIRMED", "Buyer explicitly approved ₹60,499.00 payment.", "APPROVED", 60499.0, "APPROVAL_GATE", "PASSED"),
                ("RAZORPAY_SYSTEM", "CREATE_RAZORPAY_ORDER", "Created Razorpay test order order_test_demo9912.", "ORDER_CREATED", 60499.0, None, "PASSED"),
                ("RAZORPAY_SYSTEM", "VERIFY_PAYMENT_SIGNATURE", "HMAC-SHA256 signature verified successfully.", "VERIFIED", 60499.0, None, "PASSED"),
                ("POLICY_ENGINE", "VALIDATE_DISCOUNT_GUARDRAIL", "Blocked unauthorized ₹20,000 discount request (33.3% > 10.0% max limit).", "BLOCKED", 20000.0, "MAX_DISCOUNT_LIMIT", "VIOLATION"),
            ]
            for idx, (actor, action, reason, decision, amt, pol_chk, pol_res) in enumerate(sample_logs):
                db.add(AuditLog(
                    id=f"aud_seed_{100 + idx}",
                    session_id="sess_seed_demo",
                    actor=actor,
                    intent="Shopping inquiry" if "BUYER" in actor else None,
                    action=action,
                    reason=reason,
                    decision=decision,
                    amount=amt,
                    policy_checked=pol_chk,
                    policy_result=pol_res,
                    final_result="CONFIRMED" if pol_res == "PASSED" else "BLOCKED",
                    created_at=datetime.utcnow() - timedelta(hours=12 - idx)
                ))

        db.commit()
        print("Database seeded successfully with realistic electronics demo catalog and transaction history.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
