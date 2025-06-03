from app import create_app, db
# from flask_migrate import upgrade
from flask import jsonify

app = create_app()

# with app.app_context():
#     upgrade()

@app.route("/")
def home():
    return jsonify({"mensagem": "API online!"})

if __name__ == "__main__":
    app.run(debug=True)