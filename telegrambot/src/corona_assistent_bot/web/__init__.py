import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from ..model import TableBase

db = SQLAlchemy(model_class=TableBase)


def create_app():
    app = Flask(__name__)

    @app.route('/')
    def home():
        return 'You may POST to /message'

    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    from .api import bp as api_bp
    app.register_blueprint(api_bp)

    return app
