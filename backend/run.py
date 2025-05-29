from app import create_app, db
from flask import jsonify

app = create_app()

@app.route("/")
def home():
    return jsonify({"mensagem": "API online!"})

if __name__ == "__main__":
    app.run(debug=True)