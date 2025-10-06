"""add_mode_to_typing_sessions

Revision ID: 2b5ef20e4017
Revises: b545a4fcf7fc
Create Date: 2025-10-06 04:38:07.747847

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b5ef20e4017'
down_revision: Union[str, Sequence[str], None] = 'b545a4fcf7fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
