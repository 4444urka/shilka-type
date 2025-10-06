"""add_mode_and_language_to_typing_sessions

Revision ID: d6a8abb78788
Revises: dc960a61cd2b
Create Date: 2025-10-06 14:56:25.906430

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6a8abb78788'
down_revision: Union[str, Sequence[str], None] = 'dc960a61cd2b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Добавляем поля typing_mode и language в таблицу typing_sessions
    op.add_column('typing_sessions', sa.Column('typing_mode', sa.Text(), nullable=True))
    op.add_column('typing_sessions', sa.Column('language', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем поля typing_mode и language из таблицы typing_sessions
    op.drop_column('typing_sessions', 'language')
    op.drop_column('typing_sessions', 'typing_mode')