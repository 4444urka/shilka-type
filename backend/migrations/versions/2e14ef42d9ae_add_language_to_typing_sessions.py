"""add_language_to_typing_sessions

Revision ID: 2e14ef42d9ae
Revises: 2b5ef20e4017
Create Date: 2025-10-06 04:38:54.805996

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e14ef42d9ae'
down_revision: Union[str, Sequence[str], None] = '2b5ef20e4017'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
