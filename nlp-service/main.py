from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Carga el modelo de análisis de sentimientos una sola vez al iniciar
# Modelo multilingüe (soporta español)
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment"
)

class NotaRequest(BaseModel):
    texto: str

class SentimentResponse(BaseModel):
    label: str
    score: float
    estrellas: int  # 1-5

@app.post("/analizar", response_model=SentimentResponse)
def analizar_sentimiento(nota: NotaRequest):
    resultado = sentiment_analyzer(nota.texto[:512])[0]
    # El modelo devuelve "1 star" a "5 stars"
    estrellas = int(resultado["label"].split()[0])
    return SentimentResponse(
        label=resultado["label"],
        score=round(resultado["score"], 4),
        estrellas=estrellas
    )

@app.get("/health")
def health():
    return {"status": "ok"}