"""add tracking fields to order_tracking

Revision ID: 66082365e523
Revises: 
Create Date: 2026-05-23 09:00:49.579849

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '66082365e523'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "order_tracking",
        sa.Column("tracking_id", sa.String(100), nullable=True)
    )

    op.add_column(
        "order_tracking",
        sa.Column("carrier_name", sa.String(100), nullable=True)
    )

    op.add_column(
        "order_tracking",
        sa.Column("tracking_url", sa.String(500), nullable=True)
    )


def downgrade():
    op.drop_column("order_tracking", "tracking_id")
    op.drop_column("order_tracking", "carrier_name")
    op.drop_column("order_tracking", "tracking_url")