# MerchantPilot AI 2.0 — REST API Reference

All API routes are served under `/api` (with automatic fallback to root endpoints for reverse-proxy compatibility).

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/signup`
Creates a new customer or merchant account.
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "SecurePassword123!",
    "role": "customer",
    "store_name": null
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Account created successfully.",
    "token": "eyJhbGciOi...",
    "user": { "id": "usr_...", "name": "Alex Mercer", "email": "alex@example.com", "role": "customer" }
  }
  ```

### `POST /api/auth/signin`
Authenticates existing user and generates signed token.
- **Request Body**:
  ```json
  {
    "email": "merchant@merchantpilot.ai",
    "password": "Admin@123456"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "usr_demo_merchant", "role": "merchant", "merchant_id": "m_1001" }
  }
  ```

### `GET /api/auth/me`
Fetches authenticated user profile (Requires `Authorization: Bearer <token>`).

---

## 2. Customer Storefront & Cart (`/api/customer`)

### `GET /api/customer/cart`
Returns the customer's persistent database cart with computed totals and real-time stock.
- **Response `200 OK`**:
  ```json
  {
    "cart_id": "cart_123456",
    "total_items": 2,
    "subtotal": 61000.0,
    "currency": "INR",
    "items": [
      {
        "item_id": "ci_123",
        "product_id": "P101",
        "name": "Apex ProBook 15 Developer Edition",
        "unit_price": 60000.0,
        "quantity": 1,
        "total_price": 60000.0,
        "available_stock": 14
      }
    ]
  }
  ```

### `POST /api/customer/cart/items`
Adds product to cart. Rejects if quantity exceeds available stock or item is sold out.
- **Request**: `{ "product_id": "P101", "quantity": 1 }`

### `PUT /api/customer/cart/items/{item_id}`
Updates item quantity (quantity `0` removes item).

### `DELETE /api/customer/cart/items/{item_id}`
Removes specific item from cart.

### `DELETE /api/customer/cart`
Empties all items from cart.

### `GET /api/customer/orders`
Returns past purchases with payment status and delivery tracking.

---

## 3. Merchant Portal (`/api/merchant`)

### `GET /api/merchant/stats`
Computes real-time verified business metrics (Revenue, AOV, Orders, 7-day SQL revenue trend).

### `GET /api/merchant/products`
Lists products owned by the authenticated merchant. Supports filters: `search`, `category`, `stock_status` (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).

### `POST /api/merchant/products`
Creates a new product with custom SKU, stock threshold, and machine-readable specs.

### `POST /api/merchant/products/{product_id}/stock`
Updates available inventory with instantaneous threshold checking.
- **Request**: `{ "stock": 25 }`

### `PUT /api/merchant/orders/{order_id}/fulfillment`
Updates fulfillment status (`UNFULFILLED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

### `POST /api/merchant/ai-assistant`
Interprets natural language merchant business questions, running genuine SQL queries.
- **Request**: `{ "query": "Which products are low in stock?" }`
- **Response `200 OK`**:
  ```json
  {
    "intent": "LOW_STOCK_ALERT",
    "answer": "You have 2 product(s) requiring inventory attention...",
    "structured_table": { "title": "Inventory Attention List", "headers": [...], "rows": [...] }
  }
  ```

---

## 4. Razorpay Payments & Settlement (`/api/razorpay` & `/api/checkout`)

### `POST /api/checkout/create-order`
Validates catalog pricing server-side and registers order with Razorpay Test Mode in paise.
- **Request Body**:
  ```json
  {
    "customer_name": "Demo Buyer",
    "customer_email": "buyer@merchantpilot.ai",
    "items": [{ "product_id": "P101", "quantity": 1, "unit_price": 60000.0 }],
    "discount_amount": 501.0
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "order_id": "ord_db_12345",
    "razorpay_order_id": "order_MokTest123456",
    "amount_paise": 5949900,
    "amount_inr": 59499.0,
    "currency": "INR",
    "key_id": "rzp_test_..."
  }
  ```

### `POST /api/razorpay/verify-payment`
Cryptographically verifies `razorpay_signature` against `razorpay_order_id|razorpay_payment_id` using HMAC-SHA256. Transitions order to `PAID` and decrements stock idempotently.

### `POST /api/razorpay/webhook`
Asynchronous webhook listener verifying raw-body HMAC signature against `RAZORPAY_WEBHOOK_SECRET`. Handles `payment.captured`, `order.paid`, and `payment.failed` with duplicate event protection.

---

## 5. Revenue Intelligence & AI Agent (`/api/revenue` & `/api/agent`)

### `GET /api/revenue/insights`
Runs genuine Apriori market basket analysis over historical completed orders, computing Support, Confidence, and Lift metrics and synthesizing compliant bundle opportunities.

### `POST /api/agent/chat`
Autonomous customer shopping assistant accepting natural language inquiries and generating structured recommendations with policy evaluation tokens.
