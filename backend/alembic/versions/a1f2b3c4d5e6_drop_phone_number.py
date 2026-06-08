"""drop phone_number from user_info

Revision ID: a1f2b3c4d5e6
Revises: 375394b74b04
Create Date: 2026-06-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1f2b3c4d5e6'
down_revision: Union[str, None] = '375394b74b04'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(op.f('ix_user_info_phone_number'), table_name='user_info')
    op.drop_column('user_info', 'phone_number')


def downgrade() -> None:
    op.add_column(
        'user_info',
        sa.Column('phone_number', sa.String(), nullable=False),
    )
    op.create_index(
        op.f('ix_user_info_phone_number'),
        'user_info',
        ['phone_number'],
        unique=True,
    )
