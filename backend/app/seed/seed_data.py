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
    {"name": "Accessories", "slug": "accessories", "description": "High-quality cables, mobile stands, adapters, and organizers"},
    {"name": "Peripherals", "slug": "peripherals", "description": "Ergonomic wireless mice and precision mouse pads"},
    {"name": "Audio", "slug": "audio", "description": "Stereo earphones and high-fidelity mobile audio"},
    {"name": "Protection", "slug": "protection", "description": "Shockproof phone covers and 9H tempered glass screen protectors"},
    {"name": "Laptops", "slug": "laptops", "description": "Developer workstations and ultrabooks"},
    {"name": "Monitors", "slug": "monitors", "description": "4K UHD professional displays and creator monitors"},
    {"name": "Cameras", "slug": "cameras", "description": "4K cinema cameras and studio gear"},
    {"name": "Keyboards", "slug": "keyboards", "description": "Mechanical and custom tactile keyboards"}
]

# Primary Demo Catalog: 10 Affordable Smart Accessories
SMART_ACCESSORIES = [
    {
        "id": "ACC_USB_01",
        "sku": "ACC-USB-01",
        "name": "USB Cable",
        "category": "Accessories",
        "description": "High-speed 60W USB-C braided charging and data sync cable (1.5m).",
        "cost_price": 80.0,
        "price": 120.0,
        "stock": 20,
        "low_stock_threshold": 5,
        "rating": 4.85,
        "image_url": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=600&q=80",
        "specs": {"length": "1.5 meters", "output": "60W Fast Charging", "connector": "USB-C to USB-C / Type-A", "durability": "10,000+ Bends Braided"},
        "compatible_product_ids": ["ACC_ADA_08", "ACC_COV_04", "ACC_EAR_03", "ACC_ORG_09"],
        "tags": ["cable", "usb", "charging", "type-c", "fast charging", "mobile accessories", "data cable", "usb cable"]
    },
    {
        "id": "ACC_MOU_02",
        "sku": "ACC-MOU-02",
        "name": "Wireless Mouse",
        "category": "Peripherals",
        "description": "Ergonomic 2.4GHz wireless mouse with silent clicks and optical precision tracking.",
        "cost_price": 250.0,
        "price": 350.0,
        "stock": 15,
        "low_stock_threshold": 4,
        "rating": 4.75,
        "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
        "specs": {"dpi": "1600 DPI", "connectivity": "2.4GHz USB Nano Receiver", "battery": "1x AA (Up to 12 months)", "buttons": "4 Silent Switches"},
        "compatible_product_ids": ["ACC_PAD_06", "ACC_USB_01"],
        "tags": ["mouse", "wireless", "peripherals", "office", "laptop accessory", "silent click", "wireless mouse"]
    },
    {
        "id": "ACC_EAR_03",
        "sku": "ACC-EAR-03",
        "name": "Earphones",
        "category": "Audio",
        "description": "In-ear stereo wired earphones with deep bass, inline microphone and 3.5mm gold-plated jack.",
        "cost_price": 150.0,
        "price": 220.0,
        "stock": 10,
        "low_stock_threshold": 3,
        "rating": 4.65,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
        "specs": {"driver": "10mm Dynamic Drivers", "jack": "3.5mm Gold-plated / Type-C compatible", "mic": "Inline HD Mic with call controls", "cable": "Tangle-free 1.2m"},
        "compatible_product_ids": ["ACC_USB_01", "ACC_COV_04", "ACC_STA_05"],
        "tags": ["earphones", "audio", "music", "headphone", "bass", "inline mic", "mobile accessories"]
    },
    {
        "id": "ACC_COV_04",
        "sku": "ACC-COV-04",
        "name": "Phone Cover",
        "category": "Protection",
        "description": "Shock-absorbing slim TPU phone cover with raised bezels for camera and screen protection.",
        "cost_price": 60.0,
        "price": 100.0,
        "stock": 25,
        "low_stock_threshold": 6,
        "rating": 4.55,
        "image_url": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
        "specs": {"material": "Flexible Shockproof TPU", "grip": "Anti-fingerprint Matte Finish", "protection": "Mil-Grade Drop Cushioning"},
        "compatible_product_ids": ["ACC_SCR_07", "ACC_USB_01", "ACC_STA_05"],
        "tags": ["phone cover", "case", "mobile case", "protection", "cover", "phone", "accessories"]
    },
    {
        "id": "ACC_STA_05",
        "sku": "ACC-STA-05",
        "name": "Mobile Stand",
        "category": "Accessories",
        "description": "Adjustable aluminum desktop mobile stand with anti-slip silicone cushions and cable slot.",
        "cost_price": 100.0,
        "price": 150.0,
        "stock": 12,
        "low_stock_threshold": 3,
        "rating": 4.70,
        "image_url": "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80",
        "specs": {"material": "Solid Aluminum Alloy", "angle": "270° Dual Hinge Adjustment", "compatibility": "Smartphones & Tablets up to 10-inch"},
        "compatible_product_ids": ["ACC_USB_01", "ACC_EAR_03", "ACC_HOL_10"],
        "tags": ["stand", "mobile stand", "desk accessory", "phone holder", "aluminum", "video call"]
    },
    {
        "id": "ACC_PAD_06",
        "sku": "ACC-PAD-06",
        "name": "Mouse Pad",
        "category": "Peripherals",
        "description": "Smooth micro-textured cloth gaming and office mouse pad with non-slip natural rubber base.",
        "cost_price": 40.0,
        "price": 80.0,
        "stock": 18,
        "low_stock_threshold": 5,
        "rating": 4.60,
        "image_url": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80",
        "specs": {"size": "260 x 210 x 3 mm", "surface": "Speed micro-weave fabric", "base": "Anti-skid rubber"},
        "compatible_product_ids": ["ACC_MOU_02", "ACC_ORG_09"],
        "tags": ["mouse pad", "pad", "desk", "peripherals", "rubber base", "office"]
    },
    {
        "id": "ACC_SCR_07",
        "sku": "ACC-SCR-07",
        "name": "Screen Protector",
        "category": "Protection",
        "description": "9H hardness tempered glass screen protector with oleophobic coating and bubble-free installation kit.",
        "cost_price": 50.0,
        "price": 100.0,
        "stock": 30,
        "low_stock_threshold": 8,
        "rating": 4.80,
        "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80",
        "specs": {"hardness": "9H Scratch Resistant", "clarity": "99.9% HD Transparency", "thickness": "0.33mm Ultra-thin"},
        "compatible_product_ids": ["ACC_COV_04", "ACC_USB_01"],
        "tags": ["screen protector", "tempered glass", "protection", "scratch guard", "mobile accessories"]
    },
    {
        "id": "ACC_ADA_08",
        "sku": "ACC-ADA-08",
        "name": "USB Adapter",
        "category": "Accessories",
        "description": "Compact OTG USB-C to USB 3.0 female adapter with 5Gbps high-speed data transmission.",
        "cost_price": 70.0,
        "price": 130.0,
        "stock": 15,
        "low_stock_threshold": 4,
        "rating": 4.65,
        "image_url": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
        "specs": {"transfer": "USB 3.0 up to 5Gbps", "casing": "Aluminum alloy casing", "plug": "Plug & Play OTG support"},
        "compatible_product_ids": ["ACC_USB_01", "ACC_MOU_02"],
        "tags": ["adapter", "usb adapter", "otg", "type-c", "converter", "data transfer"]
    },
    {
        "id": "ACC_ORG_09",
        "sku": "ACC-ORG-09",
        "name": "Cable Organizer",
        "category": "Accessories",
        "description": "Flexible multi-slot silicone cable clip management holder with strong 3M adhesive backing.",
        "cost_price": 30.0,
        "price": 60.0,
        "stock": 20,
        "low_stock_threshold": 5,
        "rating": 4.50,
        "image_url": "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80",
        "specs": {"slots": "5-channel cable organizer", "material": "Eco-friendly elastic silicone", "mounting": "Pre-applied 3M adhesive"},
        "compatible_product_ids": ["ACC_USB_01", "ACC_EAR_03"],
        "tags": ["cable organizer", "cable clip", "wire organizer", "desk cleanup", "silicone clip"]
    },
    {
        "id": "ACC_HOL_10",
        "sku": "ACC-HOL-10",
        "name": "Phone Holder",
        "category": "Accessories",
        "description": "360-degree rotational air-vent universal magnetic car phone holder mount with strong neodymium magnets.",
        "cost_price": 120.0,
        "price": 180.0,
        "stock": 10,
        "low_stock_threshold": 3,
        "rating": 4.70,
        "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
        "specs": {"rotation": "360-degree ball joint", "mounting": "Universal air vent clamp", "magnets": "4x Strong N52 neodymium magnets"},
        "compatible_product_ids": ["ACC_COV_04", "ACC_USB_01"],
        "tags": ["phone holder", "car mount", "magnetic holder", "phone stand", "accessories"]
    }
]

DEMO_PRODUCTS = [
    {
        "id": "P101",
        "name": "Apex ProBook 15 Developer Edition",
        "category": "Laptops",
        "description": "High-performance developer workstation with 14-core Intel Core i7, 32GB DDR5 RAM, and 1TB NVMe Gen4 SSD.",
        "price": 60000.0,
        "currency": "INR",
        "stock": 18,
        "low_stock_threshold": 5,
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
        "low_stock_threshold": 15,
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
        "description": "Weatherproof military-grade ballistic nylon laptop sleeve and briefcase with shock-absorbing foam padding.",
        "price": 1500.0,
        "currency": "INR",
        "stock": 42,
        "low_stock_threshold": 10,
        "rating": 4.60,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "material": "1680D Ballistic Cordura Nylon",
            "compatibility": "Fits laptops up to 16 inches",
            "features": "Waterproof zippers, luggage pass-through strap, hidden passport pocket",
            "dimensions": "40 x 28 x 6 cm"
        },
        "compatible_product_ids": ["P101"],
        "tags": ["bag", "case", "sleeve", "protection", "travel", "accessory"]
    },
    {
        "id": "P104",
        "name": "Apex KeyForge Mechanical Keyboard",
        "category": "Keyboards",
        "description": "75% compact hot-swappable mechanical keyboard with lubricated linear switches, RGB backlighting, and volume knob.",
        "price": 4500.0,
        "currency": "INR",
        "stock": 30,
        "low_stock_threshold": 8,
        "rating": 4.80,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "layout": "75% Compact (82 Keys + Rotary Encoder)",
            "switches": "Custom Pre-lubed Linear Red (45g actuation)",
            "keycaps": "Double-shot PBT Cherry Profile",
            "connectivity": "Tri-mode (USB-C, 2.4GHz Wireless, Bluetooth 5.0)"
        },
        "compatible_product_ids": ["P101", "P102", "P105"],
        "tags": ["keyboard", "mechanical", "typing", "coding", "rgb", "hot-swap"]
    },
    {
        "id": "P105",
        "name": "Apex 27-inch 4K UHD Monitor",
        "category": "Monitors",
        "description": "IPS HDR professional monitor with 99% DCI-P3 color gamut, USB-C 90W power delivery, and built-in KVM switch.",
        "price": 28000.0,
        "currency": "INR",
        "stock": 14,
        "low_stock_threshold": 4,
        "rating": 4.90,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "resolution": "3840 x 2160 (4K UHD) at 60Hz",
            "panel": "IPS Anti-glare, 400 nits, HDR400",
            "ports": "1x USB-C (90W PD, DP Alt), 2x HDMI 2.0, 1x DP 1.4, 4x USB 3.0",
            "stand": "Height, Tilt, Swivel, Pivot Adjustable"
        },
        "compatible_product_ids": ["P101", "P106", "P112"],
        "tags": ["monitor", "display", "screen", "4k", "hdr", "usb-c", "productivity"]
    },
    {
        "id": "P106",
        "name": "Apex Ultra-HD Webcam 4K",
        "category": "Accessories",
        "description": "4K streaming webcam with AI auto-framing, dual noise-canceling stereo microphones, and physical privacy shutter.",
        "price": 4000.0,
        "currency": "INR",
        "stock": 25,
        "low_stock_threshold": 5,
        "rating": 4.65,
        "image_url": "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "video": "4K@30fps / 1080p@60fps with Sony STARVIS Sensor",
            "fov": "Adjustable 65°, 78°, 90° Field of View",
            "microphone": "Dual Omnidirectional Noise-Canceling Mics",
            "mount": "Universal Monitor Clip + 1/4 inch Tripod Thread"
        },
        "compatible_product_ids": ["P101", "P105"],
        "tags": ["webcam", "camera", "video", "streaming", "conferencing", "4k"]
    },
    {
        "id": "P107",
        "name": "Apex 4K Cinema Camera",
        "category": "Cameras",
        "description": "Full-frame mirrorless digital cinema camera with 10-bit 4:2:2 internal recording, in-body stabilization, and dual native ISO.",
        "price": 80000.0,
        "currency": "INR",
        "stock": 8,
        "low_stock_threshold": 3,
        "rating": 4.95,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "sensor": "24.2 MP Full-Frame Exmor CMOS",
            "video_format": "4K 60p 10-bit 4:2:2 All-Intra, S-Log3, HLG",
            "stabilization": "5-axis 5.5-stop In-Body Image Stabilization",
            "mount": "Interchangeable Cinema E-Mount",
            "weight": "658g body only"
        },
        "compatible_product_ids": ["P108", "P109"],
        "tags": ["camera", "cinema", "video", "dslr", "4k", "creator", "content", "production"]
    },
    {
        "id": "P108",
        "name": "Apex Pro Carbon Tripod",
        "category": "Accessories",
        "description": "Professional 8-layer carbon fiber camera tripod with fluid video head, Arca-Swiss plate, and 12kg payload capacity.",
        "price": 3500.0,
        "currency": "INR",
        "stock": 35,
        "low_stock_threshold": 8,
        "rating": 4.70,
        "image_url": "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "material": "8x Toray Carbon Fiber",
            "max_height": "172 cm",
            "folded_length": "42 cm",
            "load_capacity": "12 kg",
            "head": "Fluid Damping Video Head with 360° Panning"
        },
        "compatible_product_ids": ["P107"],
        "tags": ["tripod", "stand", "stabilizer", "camera", "video", "carbon"]
    },
    {
        "id": "P109",
        "name": "Apex Studio Monitor Headphones",
        "category": "Audio",
        "description": "Closed-back professional studio monitor headphones with 50mm neodymium drivers and flat acoustic curve for mixing.",
        "price": 6500.0,
        "currency": "INR",
        "stock": 28,
        "low_stock_threshold": 6,
        "rating": 4.80,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "driver": "50mm Dynamic Neodymium Magnet",
            "frequency_response": "15 Hz - 28,000 Hz",
            "impedance": "38 Ohms",
            "cable": "Detachable 3m coiled cable + 1.2m straight cable"
        },
        "compatible_product_ids": ["P101", "P107"],
        "tags": ["audio", "headphone", "sound", "studio", "monitoring", "music", "creator"]
    },
    {
        "id": "P110",
        "name": "Apex Desk Mat XL Extended",
        "category": "Accessories",
        "description": "900x400mm waterproof micro-weave cloth gaming desk pad with stitched anti-fray edges and natural rubber grip.",
        "price": 600.0,
        "currency": "INR",
        "stock": 60,
        "low_stock_threshold": 15,
        "rating": 4.55,
        "image_url": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "size": "900 x 400 x 4 mm",
            "surface": "Spill-resistant Micro-textured Cloth",
            "base": "Non-slip Textured Natural Rubber",
            "edges": "Reinforced 360° Anti-fray Stitching"
        },
        "compatible_product_ids": ["P102", "P104"],
        "tags": ["mat", "pad", "mousepad", "desk", "accessory", "setup"]
    },
    {
        "id": "P111",
        "name": "Apex UltraBook 14 Thin & Light",
        "category": "Laptops",
        "description": "Ultra-portable aerospace aluminum laptop with Intel Core Ultra 7 processor, OLED 120Hz screen, and all-day 18-hour battery.",
        "price": 52000.0,
        "currency": "INR",
        "stock": 12,
        "low_stock_threshold": 3,
        "rating": 4.78,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "processor": "Intel Core Ultra 7 155H with NPU AI Boost",
            "memory": "16GB LPDDR5X 7467MHz",
            "storage": "512GB PCIe 4.0 NVMe SSD",
            "display": "14.0-inch 2.8K (2880x1800) OLED 120Hz 100% DCI-P3",
            "battery": "75Wh, 18 hours runtime",
            "weight": "1.19 kg"
        },
        "compatible_product_ids": ["P102", "P103", "P112"],
        "tags": ["laptop", "ultrabook", "portable", "lightweight", "oled", "intel", "battery"]
    },
    {
        "id": "P112",
        "name": "Apex 10-in-1 USB-C Hub Station",
        "category": "Accessories",
        "description": "Multiport docking station with dual 4K HDMI, 100W PD charging, Gigabit Ethernet, SD card reader, and USB 3.2 10Gbps.",
        "price": 2800.0,
        "currency": "INR",
        "stock": 40,
        "low_stock_threshold": 8,
        "rating": 4.70,
        "image_url": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "power": "100W USB-C Power Delivery Input",
            "ports": "2x HDMI 4K@60Hz, 1x Gigabit RJ45, 3x USB 3.2 10Gbps, SD/TF, 3.5mm Audio",
            "casing": "Anodized Aluminum Alloy"
        },
        "compatible_product_ids": ["P101", "P105", "P111"],
        "tags": ["hub", "dock", "thunderbolt", "usb-c", "adapter", "monitor", "lan"]
    },
    {
        "id": "P113",
        "name": "Apex ANC Wireless Earbuds",
        "category": "Audio",
        "description": "True wireless earbuds with 42dB hybrid active noise cancellation, transparency mode, and 36-hour total battery life.",
        "price": 3200.0,
        "currency": "INR",
        "stock": 50,
        "low_stock_threshold": 10,
        "rating": 4.60,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
        "specs": {
            "anc": "Hybrid ANC up to -42dB depth with 6 mics",
            "battery": "8 hours per bud + 28 hours via wireless charging case",
            "codecs": "LDAC, AAC, SBC with Hi-Res Wireless Certification",
            "waterproof": "IPX5 Sweat & Water Resistant"
        },
        "compatible_product_ids": ["P101"],
        "tags": ["earbuds", "audio", "anc", "wireless", "bluetooth", "music", "mobile"]
    }
]

def seed_database(db: Session = None):
    """
    Seeds database with realistic electronics merchant, categories, products,
    active policies, customer profiles, and 60+ realistic historical transactions.
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
                name="Smart Accessories Store",
                email="admin@smartaccessories.com",
                business_category="Electronics & Mobile Accessories",
                phone="+91 98765 43210",
                address="Shop 14, MG Road Tech Plaza, Bangalore, KA",
                currency="INR",
                is_demo=True,
                created_at=datetime.utcnow() - timedelta(days=180)
            )
            db.add(merchant)
            db.flush()
        else:
            merchant.name = "Smart Accessories Store"
            merchant.business_category = "Electronics & Mobile Accessories"
            merchant.phone = "+91 98765 43210"
            merchant.address = "Shop 14, MG Road Tech Plaza, Bangalore, KA"
            merchant.is_demo = True
            db.flush()

        # 2. Seed Product Categories
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
            cat_map[c_data["name"]] = cat

        # 3. Seed Default Policy
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

        # 4. Seed Products (Smart Accessories + Demo Catalog)
        all_prods = SMART_ACCESSORIES + DEMO_PRODUCTS
        for prod_data in all_prods:
            existing = db.query(Product).filter(Product.id == prod_data["id"]).first()
            cat_obj = cat_map.get(prod_data["category"])
            cat_id = cat_obj.id if cat_obj else None
            cost = prod_data.get("cost_price", round(prod_data["price"] * 0.65, 2))
            sku = prod_data.get("sku", f"SKU-{prod_data['id']}")
            if not existing:
                prod = Product(
                    id=prod_data["id"],
                    merchant_id="m_1001",
                    category_id=cat_id,
                    name=prod_data["name"],
                    category=prod_data["category"],
                    description=prod_data["description"],
                    price=prod_data["price"],
                    cost_price=cost,
                    sku=sku,
                    currency=prod_data.get("currency", "INR"),
                    stock=prod_data["stock"],
                    low_stock_threshold=prod_data.get("low_stock_threshold", 5),
                    rating=prod_data.get("rating", 4.8),
                    image_url=prod_data["image_url"],
                    specs=prod_data.get("specs", {}),
                    compatible_product_ids=prod_data.get("compatible_product_ids", []),
                    tags=prod_data.get("tags", []),
                    is_active=True,
                    created_at=datetime.utcnow() - timedelta(days=120)
                )
                db.add(prod)
            else:
                existing.category_id = cat_id
                existing.category = prod_data["category"]
                existing.name = prod_data["name"]
                existing.price = prod_data["price"]
                existing.cost_price = cost
                existing.sku = sku
                existing.stock = prod_data["stock"]
                existing.low_stock_threshold = prod_data.get("low_stock_threshold", 5)
                existing.image_url = prod_data["image_url"]
                existing.specs = prod_data.get("specs", {})
                existing.compatible_product_ids = prod_data.get("compatible_product_ids", [])
                existing.tags = prod_data.get("tags", [])
        db.flush()

        # 5. Seed Demo Users (Merchant and Customer)
        merchant_user = db.query(User).filter(User.email == "merchant@merchantpilot.ai").first()
        if not merchant_user:
            merchant_user = User(
                id="usr_demo_merchant",
                name="Demo Merchant",
                email="merchant@merchantpilot.ai",
                password_hash=hash_password("Admin@123456"),
                role="merchant",
                merchant_id="m_1001",
                created_at=datetime.utcnow() - timedelta(days=90)
            )
            db.add(merchant_user)
            db.flush()
        else:
            if not merchant_user.merchant_id:
                merchant_user.merchant_id = "m_1001"
                db.flush()

        customer_user = db.query(User).filter(User.email == "customer@merchantpilot.ai").first()
        if not customer_user:
            customer_user = User(
                id="usr_demo_customer",
                name="Demo Customer",
                email="customer@merchantpilot.ai",
                password_hash=hash_password("Customer@123456"),
                role="customer",
                created_at=datetime.utcnow() - timedelta(days=60)
            )
            db.add(customer_user)
            db.flush()

        # 6. Seed Customers (for legacy test compatibility)
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

        # 7. Seed Realistic Historical Order Baskets (Smart Accessories & Demo Catalog)
        has_acc_orders = db.query(OrderItem).filter(OrderItem.product_id == "ACC_USB_01").count() > 0
        if not has_acc_orders:
            all_prods_lookup = {p["id"]: p for p in SMART_ACCESSORIES + DEMO_PRODUCTS}

            basket_templates = [
                # Smart Accessories Frequent Patterns:
                # Pattern 1: USB Cable (₹120) + Phone Cover (₹100) -> ₹220, discount ₹20 -> ₹200 (18 orders)
                (["ACC_USB_01", "ACC_COV_04"], 20.0, "Cable & Cover Combo", True, True, 18),
                # Pattern 2: Earphones (₹220) + USB Cable (₹120) -> ₹340, discount ₹30 -> ₹310 (14 orders)
                (["ACC_EAR_03", "ACC_USB_01"], 30.0, "Commuter Audio Bundle", True, True, 14),
                # Pattern 3: Wireless Mouse (₹350) + Mouse Pad (₹80) -> ₹430, discount ₹30 -> ₹400 (12 orders)
                (["ACC_MOU_02", "ACC_PAD_06"], 30.0, "Ergonomic Desk Duo", True, True, 12),
                # Pattern 4: Phone Cover (₹100) + Screen Protector (₹100) -> ₹200, discount ₹20 -> ₹180 (15 orders)
                (["ACC_COV_04", "ACC_SCR_07"], 20.0, "360 Full Phone Shield", True, True, 15),
                # Pattern 5: Mobile Stand (₹150) + USB Cable (₹120) + Earphones (₹220) -> ₹490, discount ₹40 -> ₹450 (10 orders)
                (["ACC_STA_05", "ACC_USB_01", "ACC_EAR_03"], 40.0, "Work & Call Trio", True, True, 10),
                # Accessories Singles:
                (["ACC_USB_01"], 0.0, None, False, False, 8),
                (["ACC_MOU_02"], 0.0, None, False, False, 6),
                (["ACC_EAR_03"], 0.0, None, False, False, 5),
                (["ACC_COV_04"], 0.0, None, False, False, 7),
                (["ACC_STA_05"], 0.0, None, False, False, 4),
                (["ACC_PAD_06"], 0.0, None, False, False, 5),
                (["ACC_SCR_07"], 0.0, None, False, False, 6),
                (["ACC_ADA_08"], 0.0, None, False, False, 5),
                (["ACC_ORG_09"], 0.0, None, False, False, 6),
                (["ACC_HOL_10"], 0.0, None, False, False, 4),
                # Legacy Patterns for backward test compatibility:
                (["P101", "P102"], 501.0, "Developer Starter Kit", True, True, 10),
                (["P101", "P103"], 300.0, "Mobile Pro Bundle", True, True, 5),
                (["P107", "P108"], 1501.0, "Content Creator Pro Kit", True, True, 6),
                (["P105", "P106"], 1001.0, "Ergonomic WFH Workstation", True, True, 4),
                (["P104", "P102", "P110"], 450.0, "Tactile Desk Master Bundle", True, True, 4),
                (["P101"], 0.0, None, False, False, 3),
            ]

            order_counter = 5000
            for item_ids, discount, b_name, is_ai, is_bundle, freq in basket_templates:
                for f in range(freq):
                    order_counter += 1
                    ord_id = f"ord_seed_{order_counter}"
                    days_ago = random.randint(1, 45)
                    ord_date = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(1, 23), minutes=random.randint(1, 59))
                    
                    subtotal = sum(all_prods_lookup[pid]["price"] for pid in item_ids)
                    final_amt = max(0.0, subtotal - discount)
                    cust = random.choice(customers)
                    
                    order_rec = Order(
                        id=ord_id,
                        merchant_id="m_1001",
                        customer_id=customer_user.id,
                        customer_name=cust[1],
                        customer_email=cust[2],
                        customer_phone=cust[3],
                        session_id=f"sess_seed_{order_counter}" if is_ai else None,
                        subtotal_amount=round(subtotal, 2),
                        discount_amount=round(discount, 2),
                        final_amount=round(final_amt, 2),
                        currency="INR",
                        status="PAID",
                        fulfillment_status="DELIVERED",
                        is_ai_assisted=is_ai,
                        is_bundle=is_bundle,
                        bundle_name=b_name,
                        sales_channel="ONLINE",
                        payment_method="RAZORPAY",
                        policy_approval_token=f"appr_seed_{order_counter}" if discount > 0 else None,
                        created_at=ord_date,
                        updated_at=ord_date
                    )
                    db.add(order_rec)

                    for pid in item_ids:
                        p_info = all_prods_lookup[pid]
                        cost_val = p_info.get("cost_price", round(p_info["price"] * 0.65, 2))
                        item_rec = OrderItem(
                            id=f"item_seed_{order_counter}_{pid}",
                            order_id=ord_id,
                            product_id=pid,
                            product_name=p_info["name"],
                            quantity=1,
                            unit_price=p_info["price"],
                            unit_cost=cost_val,
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

        # 8. Seed Sample Audit Trail Logs
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
        print("Database seeded successfully with realistic electronics demo catalog, categories, users, and transaction history.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
