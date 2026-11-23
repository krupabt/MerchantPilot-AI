"""initial_schema_v2

Revision ID: 001_initial_schema_v2
Revises: 
Create Date: 2026-11-23 16:11:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema_v2'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    # 1. Categories Table
    if 'categories' not in existing_tables:
        op.create_table(
            'categories',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('slug', sa.String(length=100), nullable=False),
            sa.Column('description', sa.String(length=255), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
        )
        op.create_index('ix_categories_name', 'categories', ['name'], unique=True)
        op.create_index('ix_categories_slug', 'categories', ['slug'], unique=True)

    # 2. Carts Table
    if 'carts' not in existing_tables:
        op.create_table(
            'carts',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('customer_id', sa.String(length=50), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('session_id', sa.String(length=100), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
        )
        op.create_index('ix_carts_customer_id', 'carts', ['customer_id'], unique=False)
        op.create_index('ix_carts_session_id', 'carts', ['session_id'], unique=False)

    # 3. Cart Items Table
    if 'cart_items' not in existing_tables:
        op.create_table(
            'cart_items',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('cart_id', sa.String(length=50), sa.ForeignKey('carts.id'), nullable=False),
            sa.Column('product_id', sa.String(length=50), sa.ForeignKey('products.id'), nullable=False),
            sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('unit_price', sa.Float(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
        )
        op.create_index('ix_cart_items_cart_id', 'cart_items', ['cart_id'], unique=False)
        op.create_index('ix_cart_items_product_id', 'cart_items', ['product_id'], unique=False)

    # 4. Enhance Products Table
    if 'products' in existing_tables:
        prod_cols = [c['name'] for c in inspector.get_columns('products')]
        with op.batch_alter_table('products', schema=None) as batch_op:
            if 'category_id' not in prod_cols:
                batch_op.add_column(sa.Column('category_id', sa.String(length=50), nullable=True))
            if 'low_stock_threshold' not in prod_cols:
                batch_op.add_column(sa.Column('low_stock_threshold', sa.Integer(), nullable=False, server_default='5'))
            if 'updated_at' not in prod_cols:
                batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))

    # 5. Enhance Orders Table
    if 'orders' in existing_tables:
        order_cols = [c['name'] for c in inspector.get_columns('orders')]
        with op.batch_alter_table('orders', schema=None) as batch_op:
            if 'customer_name' not in order_cols:
                batch_op.add_column(sa.Column('customer_name', sa.String(length=100), nullable=True))
            if 'customer_email' not in order_cols:
                batch_op.add_column(sa.Column('customer_email', sa.String(length=100), nullable=True))
            if 'customer_phone' not in order_cols:
                batch_op.add_column(sa.Column('customer_phone', sa.String(length=20), nullable=True))
            if 'fulfillment_status' not in order_cols:
                batch_op.add_column(sa.Column('fulfillment_status', sa.String(length=30), nullable=True, server_default='UNFULFILLED'))

    # 6. Enhance Payments Table
    if 'payments' in existing_tables:
        pay_cols = [c['name'] for c in inspector.get_columns('payments')]
        with op.batch_alter_table('payments', schema=None) as batch_op:
            if 'webhook_payload' not in pay_cols:
                batch_op.add_column(sa.Column('webhook_payload', sa.JSON(), nullable=True))

    # 7. Enhance Users Table
    if 'users' in existing_tables:
        user_cols = [c['name'] for c in inspector.get_columns('users')]
        with op.batch_alter_table('users', schema=None) as batch_op:
            if 'merchant_id' not in user_cols:
                batch_op.add_column(sa.Column('merchant_id', sa.String(length=50), nullable=True))
            if 'updated_at' not in user_cols:
                batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))

def downgrade() -> None:
    pass
