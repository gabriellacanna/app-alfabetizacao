from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="API de Alfabetização")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão MongoDB
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
try:
    client = MongoClient(MONGODB_URL)
    # Teste a conexão
    client.admin.command('ping')
    print("✅ Conectado ao MongoDB com sucesso!")
except Exception as e:
    print(f"❌ Erro ao conectar ao MongoDB: {e}")
    raise

db = client.alfabetizacao

# Modelos
class Atividade(BaseModel):
    tipo: str
    conteudo: str
    dica: Optional[str] = None
    nivel: int
    audio_url: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "tipo": "letra",
                "conteudo": "A",
                "dica": "Como em ABELHA",
                "nivel": 1,
                "audio_url": None
            }
        }

# Rotas
@app.get("/")
def read_root() -> Dict[str, str]:
    return {"message": "API de Alfabetização"}

@app.get("/atividades/")
def listar_atividades(nivel: int = 1) -> List[Dict[str, Any]]:
    try:
        atividades = list(db.atividades.find({"nivel": nivel}, {"_id": 0}))
        if not atividades:
            return []
        return atividades
    except Exception as e:
        print(f"Erro ao listar atividades: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inicializar-dados")
@app.post("/inicializar-dados")
def inicializar_dados() -> Dict[str, Any]:
    try:
        # Limpa dados existentes
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
                "dica": "Como em IGREJA",
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
            # Nível 3 - Sílabas Simples
            {
                "tipo": "silaba",
                "conteudo": "BA",
                "dica": "Como em BALA",
                "nivel": 3,
            },
            {
                "tipo": "silaba",
                "conteudo": "CA",
                "dica": "Como em CASA",
                "nivel": 3,
            },
            {
                "tipo": "silaba",
                "conteudo": "DA",
                "dica": "Como em DADO",
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
            }
        ]

        resultado = db.atividades.insert_many(atividades_exemplo)
        return {
            "message": "Dados inicializados com sucesso",
            "total_atividades": len(atividades_exemplo)
        }
    except Exception as e:
        print(f"Erro ao inicializar dados: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check() -> Dict[str, str]:
    try:
        client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
