# 🧠 Gestão de Atendimentos – Psicologia & Rolfing

Sistema completo para gestão de sessões de atendimentos terapêuticos (psicologia e rolfing), com controle de agendamentos, pagamentos e geração de recibos personalizados.

---

<pre>

### 📁 Estrutura do Projeto

```
ProjetoMEBG/
├── backend/        # API em Flask + SQLAlchemy + JWT
├── frontend/       # Interface em React + Vite + MUI
├── .gitignore
├── README.md
```
</pre>

---

## 🧰 Tecnologias utilizadas

### Backend
- [Flask](https://flask.palletsprojects.com/)
- [Flask SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Flask-Migrate](https://flask-migrate.readthedocs.io/)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- PostgreSQL
- Python 3.10+

### Frontend
- [React](https://reactjs.org/) com [Vite](https://vitejs.dev/)
- [Material UI (MUI)](https://mui.com/)
- TypeScript

---

## 🚀 Como rodar o projeto

<pre>

### 🔹 1. Clonar o repositório

```
git clone https://github.com/CBdGM/Projeto-Gest-o-de-Atendimentos.git
cd Projeto-Gest-o-de-Atendimentos
```
</pre>

<pre>

### 🔹 2. Backend

```
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt```
</pre>

<pre>

### ⚙️ Criar o arquivo .env:
```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/atendimentos
JWT_SECRET_KEY=sua_chave_secreta
APP_USERNAME=admin
APP_PASSWORD=admin123
</pre>

### 📦 Aplicar as migrações:
flask db upgrade

### ▶️ Rodar o backend:
python run.py

### 🔹 3. Frontend
cd frontend
npm install
npm run dev
