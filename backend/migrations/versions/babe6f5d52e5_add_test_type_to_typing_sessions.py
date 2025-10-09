"""add_test_type_to_typing_sessions

Revision ID: babe6f5d52e5
Revises: b545a4fcf7fc
Create Date: 2025-10-09 15:43:17.043547

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'babe6f5d52e5'
down_revision: Union[str, Sequence[str], None] = 'b545a4fcf7fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('typing_sessions', sa.Column('test_type', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('typing_sessions', 'test_type')