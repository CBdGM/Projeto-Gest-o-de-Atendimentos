from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_migrate import Migrate

jwt = JWTManager()  

db = SQLAlchemy()

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app, origins=["http://localhost:5173"])

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-super-secret")   
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7) 

    jwt.init_app(app)

    db.init_app(app)
    migrate = Migrate(app, db)
    
    from app.models import cliente, sessao, pagamento

    from app.routes.clientes import clientes_bp
    app.register_blueprint(clientes_bp)
    
    from app.routes.sessoes import sessoes_bp
    app.register_blueprint(sessoes_bp)  
    
    from app.routes.pagamentos import pagamentos_bp
    app.register_blueprint(pagamentos_bp)
    
    from app.routes.recibos import recibos_bp
    app.register_blueprint(recibos_bp)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    return app