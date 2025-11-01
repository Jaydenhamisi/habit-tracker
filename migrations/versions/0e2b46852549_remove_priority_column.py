"""remove priority column

Revision ID: 0e2b46852549
Revises: 2e1d55e49665
Create Date: 2025-11-01 04:30:57.537750

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0e2b46852549'
down_revision: Union[str, Sequence[str], None] = '2e1d55e49665'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_column('habits', 'priority')


def downgrade():
    op.add_column('habits', sa.Column('priority', sa.Integer(), nullable=True))

