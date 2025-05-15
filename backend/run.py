from app import create_app, db
from flask import jsonify

app = create_app()

@app.route("/")
def home():
    return jsonify({"mensagem": "API online!"})

if __name__ == "__main__":
    with app.app_context():
        db.drop_all()
        db.create_all()
    app.run(debug=True)