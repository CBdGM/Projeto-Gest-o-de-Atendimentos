from flask import Flask, request, make_response
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

    @app.before_request
    def handle_options_request():
        if request.method == 'OPTIONS':
            response = make_response()
            response.status_code = 204
            return response

    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

    db.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    # Importações dos models para o Flask-Migrate funcionar corretamente
    from app.models import cliente, sessao, pagamento

    # Registra rotas
    from app.routes.clientes import clientes_bp
    from app.routes.sessoes import sessoes_bp
    from app.routes.pagamentos import pagamentos_bp
    from app.routes.recibos import recibos_bp
    from app.routes.auth import auth_bp

    app.register_blueprint(clientes_bp)
    app.register_blueprint(sessoes_bp)
    app.register_blueprint(pagamentos_bp)
    app.register_blueprint(recibos_bp)
    app.register_blueprint(auth_bp)

    # Importação e registro do comando CLI (feita após init_app para evitar ciclo)
    from app.cli import renovar_sessoes_command
    app.cli.add_command(renovar_sessoes_command)

    return app