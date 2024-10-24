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
        print("Inicializando dados padrão...")
        
        # Clear the existing atividades collection
        db.atividades.delete_many({})

        atividades_exemplo = [
            # Nível 1 - Vogais
            {
                "tipo": "letra",
                "conteudo": "A",
                "dica": "Como em ABELHA",
                "nivel": 1,
            },
            {
                "tipo": "letra",
                "conteudo": "E",
                "dica": "Como em ELEFANTE",
                "nivel": 1,
            },
            {
                "tipo": "letra",
                "conteudo": "I",
                "dica": "Como em ÍNDIO",
                "nivel": 1,
            },
            {
                "tipo": "letra",
                "conteudo": "O",
                "dica": "Como em OVO",
                "nivel": 1,
            },
            {
                "tipo": "letra",
                "conteudo": "U",
                "dica": "Como em UVA",
                "nivel": 1,
            },
            # Nível 2 - Consoantes Simples
            {
                "tipo": "letra",
                "conteudo": "B",
                "dica": "Como em BOLA",
                "nivel": 2,
            },
            {
                "tipo": "letra",
                "conteudo": "C",
                "dica": "Como em CASA",
                "nivel": 2,
            },
            {
                "tipo": "letra",
                "conteudo": "D",
                "dica": "Como em DADO",
                "nivel": 2,
            },
            {
                "tipo": "letra",
                "conteudo": "F",
                "dica": "Como em FADA",
                "nivel": 2,
            },
            {
                "tipo": "letra",
                "conteudo": "G",
                "dica": "Como em GATO",
                "nivel": 2,
            },
            # Nível 3 - Sílabas Simples
            {
                "tipo": "silaba",
                "conteudo": "BA",
                "dica": "Como em BALA",
                "nivel": 3,
            },
            {
                "tipo": "silaba",
                "conteudo": "BE",
                "dica": "Como em BEBÊ",
                "nivel": 3,
            },
            {
                "tipo": "silaba",
                "conteudo": "BI",
                "dica": "Como em BICO",
                "nivel": 3,
            },
            {
                "tipo": "silaba",
                "conteudo": "BO",
                "dica": "Como em BOLA",
                "nivel": 3,
            },
            {
                "tipo": "silaba",
                "conteudo": "BU",
                "dica": "Como em BURRO",
                "nivel": 3,
            },
            # Nível 4 - Palavras Simples
            {
                "tipo": "palavra",
                "conteudo": "BOLA",
                "dica": "Objeto redondo que quica",
                "nivel": 4,
            },
            {
                "tipo": "palavra",
                "conteudo": "CASA",
                "dica": "Lugar onde moramos",
                "nivel": 4,
            },
            {
                "tipo": "palavra",
                "conteudo": "DADO",
                "dica": "Objeto com números para jogos",
                "nivel": 4,
            },
            {
                "tipo": "palavra",
                "conteudo": "FADA",
                "dica": "Ser mágico com varinha",
                "nivel": 4,
            },
            {
                "tipo": "palavra",
                "conteudo": "GATO",
                "dica": "Animal que faz miau",
                "nivel": 4,
            }
        ]

        db.atividades.insert_many(atividades_exemplo)
        print(f"✅ {len(atividades_exemplo)} atividades inicializadas com sucesso!")

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
