import os
import io
import urllib.request
from PIL import Image, ImageOps, ImageDraw, ImageFont

OUTPUT_DIR = os.path.join("frontend", "public", "images", "products")
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGET_SIZE = (600, 600)

SOURCES = {
    "acc_usb_01.webp": (
        "ACC_USB_01",
        "USB Cable",
        "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_mou_02.webp": (
        "ACC_MOU_02",
        "Wireless Mouse",
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_ear_03.webp": (
        "ACC_EAR_03",
        "Earphones",
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_cov_04.webp": (
        "ACC_COV_04",
        "Phone Cover",
        "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_sta_05.webp": (
        "ACC_STA_05",
        "Mobile Stand",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_pad_06.webp": (
        "ACC_PAD_06",
        "Mouse Pad",
        "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_scr_07.webp": (
        "ACC_SCR_07",
        "Screen Protector",
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_ada_08.webp": (
        "ACC_ADA_08",
        "USB Adapter",
        "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_org_09.webp": (
        "ACC_ORG_09",
        "Cable Organizer",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_hol_10.webp": (
        "ACC_HOL_10",
        "Phone Holder",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_chg_11.webp": (
        "ACC_CHG_11",
        "Wall Charger",
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_led_12.webp": (
        "ACC_LED_12",
        "USB LED Light",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_cln_13.webp": (
        "ACC_CLN_13",
        "Cleaning Kit",
        "https://upload.wikimedia.org/wikipedia/commons/4/48/Lens-cleaner-kit-30.jpg"
    ),
    "acc_aux_14.webp": (
        "ACC_AUX_14",
        "AUX Cable",
        "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=800&q=80"
    ),
    "acc_hub_15.webp": (
        "ACC_HUB_15",
        "USB Hub",
        "https://upload.wikimedia.org/wikipedia/commons/0/04/2023_Hub_USB_2.0.jpg"
    ),
}

def process_and_save_image(raw_bytes: bytes, out_path: str):
    img = Image.open(io.BytesIO(raw_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    
    # Fit into 600x600 with high quality and neutral light background (#FAF9F6)
    img.thumbnail(TARGET_SIZE, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", TARGET_SIZE, (250, 249, 246))
    offset = ((TARGET_SIZE[0] - img.size[0]) // 2, (TARGET_SIZE[1] - img.size[1]) // 2)
    canvas.paste(img, offset)
    
    canvas.save(out_path, "WEBP", quality=88)

def create_placeholder(out_path: str):
    canvas = Image.new("RGB", TARGET_SIZE, (244, 245, 247))
    draw = ImageDraw.Draw(canvas)
    # Draw simple camera / box silhouette
    cx, cy = 300, 280
    draw.rectangle([cx - 60, cy - 40, cx + 60, cy + 50], outline=(180, 185, 190), width=3)
    draw.ellipse([cx - 25, cy - 20, cx + 25, cy + 30], outline=(180, 185, 190), width=3)
    draw.text((cx - 85, cy + 80), "Product Image Unavailable", fill=(130, 135, 140))
    canvas.save(out_path, "WEBP", quality=85)

print("Starting image optimization pipeline...")
for filename, (pid, name, url) in SOURCES.items():
    out_file = os.path.join(OUTPUT_DIR, filename)
    print(f"Downloading & optimizing {pid} ({name})...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            process_and_save_image(data, out_file)
            size_kb = os.path.getsize(out_file) / 1024
            print(f"  ✓ Saved {filename} ({size_kb:.1f} KB)")
    except Exception as e:
        print(f"  ✗ Failed {filename}: {e}")

placeholder_path = os.path.join(OUTPUT_DIR, "placeholder.webp")
create_placeholder(placeholder_path)
print("  ✓ Created placeholder.webp")
print(f"Done! {len(os.listdir(OUTPUT_DIR))} assets in {OUTPUT_DIR}")
