from sqlalchemy import BigInteger, Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base

TableBase = declarative_base()


class ReceivedMessage(TableBase):
    __tablename__ = 'received_message'

    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)


class SubscribedChat(TableBase):
    __tablename__ = 'subscribed_chat'

    # This is the chat ID from telegram
    chat_id = Column(BigInteger, primary_key=True, autoincrement=False)
