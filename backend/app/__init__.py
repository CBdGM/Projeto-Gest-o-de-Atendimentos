from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
from datetime import timedelta
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

    CORS(app,
         resources={r"/*": {"origins": "http://localhost:5173"}},
         supports_credentials=True,
         expose_headers=["Content-Type", "Authorization"],
         allow_headers=["Content-Type", "Authorization"]
    )

    db.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    # Modelos
    from app.models import cliente, sessao, pagamento

    # Rotas
    from app.routes.clientes import clientes_bp
    from app.routes.sessoes import sessoes_bp
    from app.routes.pagamentos import pagamentos_bp
    from app.routes.recibo import recibos_bp
    from app.routes.auth import auth_bp

    app.register_blueprint(clientes_bp)
    app.register_blueprint(sessoes_bp)
    app.register_blueprint(pagamentos_bp)
    app.register_blueprint(recibos_bp)
    app.register_blueprint(auth_bp)

    # CLI (importa após init do app e db)
    from app.cli import renovar_sessoes_command
    app.cli.add_command(renovar_sessoes_command)

    return app