# MerchantPilot AI 2.0 — Relational Database Schema

MerchantPilot AI 2.0 uses SQLAlchemy with explicit naming conventions and Alembic migration versioning. It supports PostgreSQL for production persistence and SQLite for local zero-config development.

---

## 1. Entity-Relationship Diagram

```
 +------------------+           +------------------+
 |      users       | 1       * |    merchants     |
 |------------------|-----------|------------------|
 | id (PK)          |           | id (PK)          |
 | email (Unique)   |           | name             |
 | password_hash    |           | email            |
 | role             |           | currency         |
 | merchant_id (FK) |           | created_at       |
 +------------------+           +------------------+
        | 1                              | 1
        |                                |
        | 1                              | *
 +------------------+           +------------------+
 |      carts       |           |     products     |
 |------------------|           |------------------|
 | id (PK)          |           | id (PK)          |
 | customer_id (FK) |           | merchant_id (FK) |
 | session_id       |           | category_id (FK) |
 | updated_at       |           | name             |
 +------------------+           | price            |
        | 1                     | stock            |
        |                       | low_stock_thresh |
        | *                     | is_active        |
 +------------------+           +------------------+
 |    cart_items    |                    | 1
 |------------------|                    |
 | id (PK)          |                    |
 | cart_id (FK)     |                    |
 | product_id (FK)  |                    |
 | quantity         |                    |
 | unit_price       |                    |
 +------------------+                    |
                                         |
 +------------------+ 1         * +------------------+
 |      orders      |-------------|   order_items    |
 |------------------|             |------------------|
 | id (PK)          |             | id (PK)          |
 | merchant_id (FK) |             | order_id (FK)    |
 | customer_id (FK) |             | product_id (FK)  |
 | subtotal_amount  |             | quantity         |
 | discount_amount  |             | unit_price       |
 | final_amount     |             | total_price      |
 | status           |             +------------------+
 | fulfillment_stat |
 +------------------+
        | 1
        |
        | 1
 +------------------+
 |     payments     |
 |------------------|
 | id (PK)          |
 | order_id (FK)    |
 | rzp_order_id     |
 | rzp_payment_id   |
 | verification_stat|
 | status           |
 +------------------+
```

---

## 2. Table Specifications

### 2.1 `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | User identifier (`usr_...`) |
| `name` | VARCHAR(100) | NOT NULL | Full name of user |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL, INDEX | Login email address |
| `password_hash` | VARCHAR(255) | NOT NULL | PBKDF2-HMAC-SHA256 hashed password with salt |
| `role` | VARCHAR(20) | DEFAULT 'customer', INDEX | Role: `customer`, `merchant`, `admin` |
| `merchant_id` | VARCHAR(50) | FOREIGN KEY -> `merchants.id`, NULLABLE | Associated merchant store ID (for merchants) |
| `phone` | VARCHAR(20) | NULLABLE | Contact telephone |
| `shipping_address`| TEXT | NULLABLE | Saved delivery address |
| `created_at` | DATETIME | DEFAULT utcnow | Account creation timestamp |

### 2.2 `merchants`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Merchant ID (`m_1001`) |
| `name` | VARCHAR(100) | NOT NULL | Store / brand business name |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | Primary merchant contact email |
| `currency` | VARCHAR(10) | DEFAULT 'INR' | Default store currency |
| `created_at` | DATETIME | DEFAULT utcnow | Onboarding timestamp |

### 2.3 `products`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Product SKU (`P101`, `P102`) |
| `merchant_id` | VARCHAR(50) | FOREIGN KEY -> `merchants.id`, INDEX | Owning merchant |
| `category_id` | VARCHAR(50) | FOREIGN KEY -> `categories.id`, NULLABLE | Associated category |
| `name` | VARCHAR(150) | NOT NULL, INDEX | Product title |
| `category` | VARCHAR(100) | NOT NULL, INDEX | Primary category string |
| `description` | TEXT | NULLABLE | Specification & marketing copy |
| `price` | FLOAT | NOT NULL | Unit price in INR |
| `stock` | INTEGER | DEFAULT 0, NOT NULL | Real-time available inventory |
| `low_stock_threshold`| INTEGER | DEFAULT 5 | Low-stock alert boundary |
| `specs` | JSON | DEFAULT {} | Machine-readable hardware specs |
| `compatible_product_ids`| JSON | DEFAULT [] | Graph of compatible accessories |
| `tags` | JSON | DEFAULT [] | Search and classification tags |
| `is_active` | BOOLEAN | DEFAULT TRUE, INDEX | Storefront visibility flag |
| `created_at` | DATETIME | DEFAULT utcnow | Product creation timestamp |
| `updated_at` | DATETIME | DEFAULT utcnow | Last modification timestamp |

### 2.4 `carts` & `cart_items`
- **`carts`**: Persistent shopping session linked to authenticated `customer_id` (`User`).
- **`cart_items`**: Line items referencing `product_id`, `quantity`, and `unit_price`.

### 2.5 `orders` & `order_items`
- **`orders`**: Full checkout transaction containing `subtotal_amount`, `discount_amount`, `final_amount`, `status` (`PENDING`, `PAID`, `CANCELLED`, `FAILED`), and `fulfillment_status` (`UNFULFILLED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **`order_items`**: Immutable line items captured at the time of purchase (`product_name`, `quantity`, `unit_price`, `total_price`).

### 2.6 `payments`
- Captures Razorpay reference identifiers: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
- `verification_status`: `VERIFIED_HMAC`, `VERIFIED_WEBHOOK`, `VERIFIED_DEMO`, `UNVERIFIED`, `VERIFICATION_FAILED`.

### 2.7 `policies`
- Encodes deterministic commercial guardrails: `max_discount_percentage` (10%), `max_discount_amount` (₹6,000), `max_transaction_amount` (₹100,000), and whitelist of approved AI agent actions.

### 2.8 `audit_logs`
- Append-only immutable ledger capturing every decision trace, actor, action, timestamp, and result.

---

## 3. Migrations
Database schema versioning is managed via Alembic:
```bash
alembic upgrade head
```
Migration file: `alembic/versions/001_initial_schema_v2.py`.
