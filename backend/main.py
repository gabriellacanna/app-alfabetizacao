from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI()

# Configurações JWT
SECRET_KEY = os.getenv("SECRET_KEY", "sua-chave-secreta-aqui")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Configuração CORS e MongoDB (mantido como estava)
# ... [seu código anterior de CORS e MongoDB]

# Modelos
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
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    user = db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401)
    return user

# Rotas de autenticação
@app.post("/register")
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
    
    result = db.users.insert_one(user_data)
    return {
        "message": "Usuário criado com sucesso",
        "username": user.username
    }

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"email": form_data.username})
    if not user or not bcrypt.checkpw(form_data.password.encode('utf-8'), user["password"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    access_token = create_access_token({"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Rotas protegidas
@app.get("/user/progress")
async def get_progress(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "progress": current_user.get("progress", [])
    }

@app.post("/user/progress")
async def update_progress(
    progress: dict,
    current_user: dict = Depends(get_current_user)
):
    db.users.update_one(
        {"email": current_user["email"]},
        {"$push": {"progress": {
            "nivel": progress["nivel"],
            "pontuacao": progress["pontuacao"],
            "data": datetime.utcnow()
        }}}
    )
    return {"message": "Progresso atualizado"}

# [Manter suas rotas anteriores de atividades]
