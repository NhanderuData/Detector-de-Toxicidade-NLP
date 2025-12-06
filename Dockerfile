FROM python:3.12

WORKDIR /app

# Copia o requirements da raiz do projeto
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copia a pasta src inteira mantendo a estrutura
COPY Detector-de-Toxicidade-NLP/toxicity_backend/src ./src

EXPOSE 5000

# Roda o arquivo dentro da pasta src
CMD ["python", "src/main.py"]
