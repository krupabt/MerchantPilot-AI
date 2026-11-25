import sqlite3

mapping = {
    'ACC_USB_01': '/images/products/acc_usb_01.webp',
    'ACC_MOU_02': '/images/products/acc_mou_02.webp',
    'ACC_EAR_03': '/images/products/acc_ear_03.webp',
    'ACC_COV_04': '/images/products/acc_cov_04.webp',
    'ACC_STA_05': '/images/products/acc_sta_05.webp',
    'ACC_PAD_06': '/images/products/acc_pad_06.webp',
    'ACC_SCR_07': '/images/products/acc_scr_07.webp',
    'ACC_ADA_08': '/images/products/acc_ada_08.webp',
    'ACC_ORG_09': '/images/products/acc_org_09.webp',
    'ACC_HOL_10': '/images/products/acc_hol_10.webp',
    'ACC_CHG_11': '/images/products/acc_chg_11.webp',
    'ACC_LED_12': '/images/products/acc_led_12.webp',
    'ACC_CLN_13': '/images/products/acc_cln_13.webp',
    'ACC_AUX_14': '/images/products/acc_aux_14.webp',
    'ACC_HUB_15': '/images/products/acc_hub_15.webp'
}

conn = sqlite3.connect('merchantpilot.db')
c = conn.cursor()
for pid, url in mapping.items():
    c.execute('UPDATE products SET image_url = ? WHERE id = ?', (url, pid))
conn.commit()

c.execute("SELECT id, name, image_url FROM products WHERE id LIKE 'ACC%'")
for row in c.fetchall():
    print(row)
conn.close()
print("Updated all 15 product image_urls in merchantpilot.db!")
