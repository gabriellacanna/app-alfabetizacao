from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Carregar variáveis de ambiente
load_dotenv()

# Modelos Pydantic
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    created_at: datetime

class ProgressUpdate(BaseModel):
    nivel: int
    pontuacao: int

class Atividade(BaseModel):
    tipo: str
    conteudo: str
    dica: Optional[str] = None
    nivel: int
    audio_url: Optional[str] = None

app = FastAPI(
    title="API de Alfabetização",
    description="API para aplicativo de alfabetização com sistema de autenticação",
    version="1.0.0",
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações JWT
SECRET_KEY = os.getenv("SECRET_KEY", "sua-chave-secreta-aqui")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Conexão MongoDB
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URL)
db = client.alfabetizacao

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Funções auxiliares
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user

async def inicializar_dados_padrao():
    try:
        print("🚀 Inicializando dados padrão...")

        atividades_exemplo = [
            {"_id": 1, "tipo": "letra", "conteudo": "A", "dica": "Qual é o som que essa letra faz?", "nivel": 1},
            {"_id": 2, "tipo": "letra", "conteudo": "B", "dica": "Qual é o som que essa letra faz?", "nivel": 1},
            {"_id": 3, "tipo": "letra", "conteudo": "C", "dica": "Qual é o som que essa letra faz?", "nivel": 1},
            {"_id": 4, "tipo": "letra", "conteudo": "D", "dica": "Qual é o som que essa letra faz?", "nivel": 1},
            {"_id": 5, "tipo": "letra", "conteudo": "E", "dica": "Qual é o som que essa letra faz?", "nivel": 1},

            {"_id": 6, "tipo": "letra", "conteudo": "C _ S _", "dica": "Qual palavra pode ser formada aqui?", "nivel": 2},
            {"_id": 7, "tipo": "letra", "conteudo": "P _ R _", "dica": "Qual palavra pode ser formada aqui?", "nivel": 2},
            {"_id": 8, "tipo": "palavra", "conteudo": "O que é uma maçã?", "dica": "É uma fruta vermelha ou verde, doce e saudável.", "nivel": 2},
            {"_id": 9, "tipo": "palavra", "conteudo": "O que é uma bola?", "dica": "É redonda e usamos para jogar.", "nivel": 2},
            {"_id": 10, "tipo": "palavra", "conteudo": "O que é um cachorro?", "dica": "É um animal que ladra.", "nivel": 2},

            {"_id": 11, "tipo": "silaba", "conteudo": "MA e SÃO", "dica": "O que você forma ao juntar essas sílabas?", "nivel": 3},
            {"_id": 12, "tipo": "silaba", "conteudo": "CA e SA", "dica": "O que você forma ao juntar essas sílabas?", "nivel": 3},
            {"_id": 13, "tipo": "silaba", "conteudo": "BA e LA", "dica": "O que você forma ao juntar essas sílabas?", "nivel": 3},
            {"_id": 14, "tipo": "silaba", "conteudo": "PA e RA", "dica": "O que você forma ao juntar essas sílabas?", "nivel": 3},
            {"_id": 15, "tipo": "palavra", "conteudo": "O gato está no telhado.", "dica": "Onde está o gato?", "nivel": 3},

            {"_id": 16, "tipo": "frase", "conteudo": "Eu vejo um ___.", "dica": "Complete a frase com um animal que você gosta.", "nivel": 4},
            {"_id": 17, "tipo": "frase", "conteudo": "Hoje eu fui ao ___.", "dica": "Complete a frase com um lugar que você visitou.", "nivel": 4},
            {"_id": 18, "tipo": "palavra", "conteudo": "O que é uma escola?", "dica": "É onde aprendemos.", "nivel": 4},
            {"_id": 19, "tipo": "palavra", "conteudo": "O que é um livro?", "dica": "É onde encontramos histórias.", "nivel": 4},
            {"_id": 20, "tipo": "letra", "conteudo": "A, B, C, D, E...", "dica": "Complete sua cartela com essas letras.", "nivel": 4},
        ]

        for atividade in atividades_exemplo:
            # Atualiza ou insere a atividade
            db.atividades.update_one(
                {"_id": atividade["_id"]},  # Filtra pela chave única
                {"$set": atividade},        # Atualiza ou insere
                upsert=True                 # Cria um novo documento se não existir
            )

        print(f"✅ {len(atividades_exemplo)} atividades atualizadas com sucesso!")

    except Exception as e:
        print(f"❌ Erro ao inicializar dados: {str(e)}")
        raise e

# Evento de inicialização do FastAPI
@app.on_event("startup")
async def startup_event():
    print("🚀 Iniciando servidor...")
    try:
        # Teste a conexão com o MongoDB
        client.admin.command('ping')
        print("✅ Conectado ao MongoDB com sucesso!")
        
        # Inicializa os dados padrão
        await inicializar_dados_padrao()
        
    except Exception as e:
        print(f"❌ Erro na inicialização: {str(e)}")
        raise e

# Rotas
@app.get("/", tags=["Root"])
async def read_root():
    return {
        "message": "Bem-vindo à API de Alfabetização",
        "docs": "/docs",
        "endpoints": {
            "autenticação": ["/register", "/token"],
            "atividades": ["/atividades", "/inicializar-dados"],
            "usuário": ["/user/progress"]
        }
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    try:
        client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@app.post("/register", tags=["Autenticação"])
async def register(user: UserCreate):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email já registrado")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "progress": []
    }
    
    try:
        result = db.users.insert_one(user_data)
        return {
            "message": "Usuário criado com sucesso",
            "username": user.username,
            "email": user.email
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar usuário: {str(e)}"
        )

@app.post("/token", tags=["Autenticação"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"email": form_data.username})
    if not user or not bcrypt.checkpw(form_data.password.encode('utf-8'), user["password"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    access_token = create_access_token({"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/atividades/", tags=["Atividades"])
async def listar_atividades(nivel: int = 1):
    try:
        atividades = list(db.atividades.find({"nivel": nivel}, {"_id": 0}))
        return {
            "nivel": nivel,
            "total": len(atividades),
            "atividades": atividades
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar atividades: {str(e)}"
        )

@app.get("/user/progress", tags=["Usuário"])
async def get_progress(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "progress": current_user.get("progress", [])
    }

@app.post("/user/progress", tags=["Usuário"])
async def update_progress(
    progress: ProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        db.users.update_one(
            {"email": current_user["email"]},
            {"$push": {"progress": {
                "nivel": progress.nivel,
                "pontuacao": progress.pontuacao,
                "data": datetime.utcnow()
            }}}
        )
        return {"message": "Progresso atualizado com sucesso"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao atualizar progresso: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
