import logging
import os

from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker
from telegram.ext import CommandHandler, Filters, MessageHandler, Updater

from .model import ReceivedMessage, SubscribedChat, TableBase

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)

logger = logging.getLogger(__name__)

Session = sessionmaker()


def subscribe(update, context):
    session = Session()
    session.merge(SubscribedChat(chat_id=update.message.chat.id))
    session.commit()
    update.message.reply_text('You have been subscribed to receive messages.')


def unsubscribe(update, context):
    session = Session()
    stmt = (
        delete(SubscribedChat)
        .where(SubscribedChat.chat_id == update.message.chat.id)
    )
    session.execute(stmt)
    session.commit()
    update.message.reply_text('You have been unsubscribed.')


def error(update, context):
    logger.warning("Update '%s' caused error '%s'", update, context.error)


def run_bot():

    updater = Updater(os.environ['TELEGRAM_BOT_TOKEN'], use_context=True)

    engine = create_engine(os.environ['DATABASE_URL'])
    Session.configure(bind=engine)

    TableBase.metadata.create_all(bind=engine, checkfirst=True)

    def callback(context):
        session = Session()
        for message in session.query(ReceivedMessage):
            for chat_id, in session.query(SubscribedChat.chat_id):
                context.bot.send_message(chat_id, message.text)
            session.delete(message)
        session.commit()

    updater.job_queue.run_repeating(callback, interval=5, first=0)

    dp = updater.dispatcher

    dp.add_handler(CommandHandler('subscribe', subscribe))
    dp.add_handler(CommandHandler('unsubscribe', unsubscribe))

    dp.add_error_handler(error)

    # Start the Bot
    updater.start_polling()
    updater.idle()
