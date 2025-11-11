"""add_user_role

Revision ID: f914bde40774
Revises: ce6fb8c41f17
Create Date: 2025-11-06 23:35:21.244841

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f914bde40774'
down_revision: Union[str, Sequence[str], None] = 'ce6fb8c41f17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Добавляем колонку role в таблицу users
    op.add_column('users', sa.Column('role', sa.String(), nullable=False, server_default='user'))
    
    # Создаём индекс для быстрого поиска по роли
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем индекс
    op.drop_index(op.f('ix_users_role'), table_name='users')
    
    # Удаляем колонку role
    op.drop_column('users', 'role')
