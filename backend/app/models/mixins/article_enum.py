import enum


class ArticleStatus(enum.Enum):
    pending = "pending"
    accept = "accept"
    rejected = "rejected"
