# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///alfabetizacao.db'
db = SQLAlchemy(app)

# Modelos
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(200))
    progresso = db.relationship('Progresso', backref='usuario', lazy=True)

class Atividade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(50), nullable=False)  # 'letra', 'silaba', 'palavra'
    conteudo = db.Column(db.String(200), nullable=False)
    nivel = db.Column(db.Integer, nullable=False)
    audio_url = db.Column(db.String(200))

class Progresso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    atividade_id = db.Column(db.Integer, db.ForeignKey('atividade.id'), nullable=False)
    completado = db.Column(db.Boolean, default=False)
    pontuacao = db.Column(db.Integer, default=0)

# Rotas da API
@app.route('/api/registro', methods=['POST'])
def registro():
    dados = request.json
    if Usuario.query.filter_by(email=dados['email']).first():
        return jsonify({'erro': 'Email já cadastrado'}), 400
    
    usuario = Usuario(
        nome=dados['nome'],
        email=dados['email'],
        senha_hash=generate_password_hash(dados['senha'])
    )
    db.session.add(usuario)
    db.session.commit()
    return jsonify({'mensagem': 'Usuário registrado com sucesso'})

@app.route('/api/login', methods=['POST'])
def login():
    dados = request.json
    usuario = Usuario.query.filter_by(email=dados['email']).first()
    if usuario and check_password_hash(usuario.senha_hash, dados['senha']):
        return jsonify({
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email
        })
    return jsonify({'erro': 'Credenciais inválidas'}), 401

@app.route('/api/atividades', methods=['GET'])
def obter_atividades():
    nivel = request.args.get('nivel', 1, type=int)
    atividades = Atividade.query.filter_by(nivel=nivel).all()
    return jsonify([{
        'id': a.id,
        'tipo': a.tipo,
        'conteudo': a.conteudo,
        'nivel': a.nivel,
        'audio_url': a.audio_url
    } for a in atividades])

@app.route('/api/progresso', methods=['POST'])
def registrar_progresso():
    dados = request.json
    progresso = Progresso(
        usuario_id=dados['usuario_id'],
        atividade_id=dados['atividade_id'],
        completado=dados['completado'],
        pontuacao=dados['pontuacao']
    )
    db.session.add(progresso)
    db.session.commit()
    return jsonify({'mensagem': 'Progresso registrado com sucesso'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)