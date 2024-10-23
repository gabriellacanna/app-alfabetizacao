from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(
    title="API de Alfabetização",
    description="API para aplicativo de alfabetização com sistema de autenticação",
    version="1.0.0",
)

# [Suas configurações anteriores de CORS e MongoDB permanecem as mesmas]

# Rotas
@app.get("/", tags=["Root"])
async def read_root():
    """
    Rota raiz que retorna informações básicas sobre a API
    """
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
    """
    Verifica a saúde da API e a conexão com o banco de dados
    """
    try:
        # Teste a conexão com o banco
        db.command('ping')
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

@app.get("/atividades/", tags=["Atividades"])
async def listar_atividades(nivel: int = 1):
    """
    Lista todas as atividades de um determinado nível
    """
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

@app.post("/register", tags=["Autenticação"])
async def register(user: UserCreate):
    """
    Registra um novo usuário
    """
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

# [Mantenha suas outras rotas como estavam]

# Manipulador de erros global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "path": request.url.path
        }
    )
