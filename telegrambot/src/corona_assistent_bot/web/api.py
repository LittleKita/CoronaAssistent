from http import HTTPStatus

from flask import Blueprint, request

from ..model import ReceivedMessage
from . import db

bp = Blueprint('api', __name__)


@bp.route('/message', methods=['POST'])
def receive_message():
    db.session.add(ReceivedMessage(text=request.json['text']))
    db.session.commit()
    return '', HTTPStatus.NO_CONTENT
