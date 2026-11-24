"""business_copilot_and_sales

Revision ID: 002_business_copilot_and_sales
Revises: 001_initial_schema_v2
Create Date: 2026-11-24 17:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_business_copilot_and_sales'
down_revision: Union[str, Sequence[str], None] = '001_initial_schema_v2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    # 1. Enhance Products Table
    if 'products' in existing_tables:
        prod_cols = [c['name'] for c in inspector.get_columns('products')]
        with op.batch_alter_table('products', schema=None) as batch_op:
            if 'cost_price' not in prod_cols:
                batch_op.add_column(sa.Column('cost_price', sa.Float(), nullable=False, server_default='0.0'))
            if 'sku' not in prod_cols:
                batch_op.add_column(sa.Column('sku', sa.String(length=100), nullable=True))

    # 2. Enhance Orders Table
    if 'orders' in existing_tables:
        order_cols = [c['name'] for c in inspector.get_columns('orders')]
        with op.batch_alter_table('orders', schema=None) as batch_op:
            if 'sales_channel' not in order_cols:
                batch_op.add_column(sa.Column('sales_channel', sa.String(length=30), nullable=False, server_default='ONLINE'))
            if 'payment_method' not in order_cols:
                batch_op.add_column(sa.Column('payment_method', sa.String(length=30), nullable=False, server_default='RAZORPAY'))
            if 'payment_reference' not in order_cols:
                batch_op.add_column(sa.Column('payment_reference', sa.String(length=100), nullable=True))
            if 'notes' not in order_cols:
                batch_op.add_column(sa.Column('notes', sa.String(length=500), nullable=True))

    # 3. Enhance OrderItems Table
    if 'order_items' in existing_tables:
        item_cols = [c['name'] for c in inspector.get_columns('order_items')]
        with op.batch_alter_table('order_items', schema=None) as batch_op:
            if 'unit_cost' not in item_cols:
                batch_op.add_column(sa.Column('unit_cost', sa.Float(), nullable=False, server_default='0.0'))

    # 4. Enhance Merchants Table
    if 'merchants' in existing_tables:
        m_cols = [c['name'] for c in inspector.get_columns('merchants')]
        with op.batch_alter_table('merchants', schema=None) as batch_op:
            if 'business_category' not in m_cols:
                batch_op.add_column(sa.Column('business_category', sa.String(length=100), nullable=False, server_default='General Retail'))
            if 'phone' not in m_cols:
                batch_op.add_column(sa.Column('phone', sa.String(length=30), nullable=True))
            if 'address' not in m_cols:
                batch_op.add_column(sa.Column('address', sa.String(length=300), nullable=True))
            if 'is_demo' not in m_cols:
                batch_op.add_column(sa.Column('is_demo', sa.Boolean(), nullable=False, server_default='0'))

    # 5. Import Records Table
    if 'import_records' not in existing_tables:
        op.create_table(
            'import_records',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('merchant_id', sa.String(length=50), sa.ForeignKey('merchants.id'), nullable=False),
            sa.Column('import_type', sa.String(length=50), nullable=False),
            sa.Column('filename', sa.String(length=255), nullable=False),
            sa.Column('file_hash', sa.String(length=64), nullable=True),
            sa.Column('records_count', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('status', sa.String(length=30), nullable=False, server_default='SUCCESS'),
            sa.Column('summary', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
        )
        op.create_index('ix_import_records_merchant_id', 'import_records', ['merchant_id'], unique=False)

    # 6. Stock Adjustments Table
    if 'stock_adjustments' not in existing_tables:
        op.create_table(
            'stock_adjustments',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('merchant_id', sa.String(length=50), sa.ForeignKey('merchants.id'), nullable=False),
            sa.Column('product_id', sa.String(length=50), sa.ForeignKey('products.id'), nullable=False),
            sa.Column('product_name', sa.String(length=150), nullable=False),
            sa.Column('adjustment_type', sa.String(length=30), nullable=False),
            sa.Column('quantity_delta', sa.Integer(), nullable=False),
            sa.Column('previous_stock', sa.Integer(), nullable=False),
            sa.Column('new_stock', sa.Integer(), nullable=False),
            sa.Column('reason', sa.String(length=255), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
        )
        op.create_index('ix_stock_adjustments_merchant_id', 'stock_adjustments', ['merchant_id'], unique=False)
        op.create_index('ix_stock_adjustments_product_id', 'stock_adjustments', ['product_id'], unique=False)

def downgrade() -> None:
    pass
