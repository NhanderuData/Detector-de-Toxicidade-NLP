from flask import Blueprint, request, jsonify
import joblib
import os
import pandas as pd
from flask_cors import cross_origin
import re
import string
from sklearn.preprocessing import FunctionTransformer
import nltk

# Definir as funções de limpeza 
def remove_urls(text):
    return re.sub(r'http\S+', '', text)

def remove_mentions(text):
    return re.sub(r'@\w+', '', text)

def remove_emojis(text):
    emoji_pattern = re.compile("[\U00010001-\U0001F64F\U0001F680-\U0001F6FF\u2600-\u26FF\u2700-\u27BF]", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)

def remove_special_chars(text):
    # A função original removeu todas as pontuações
    allowed_chars = set(string.ascii_letters + "áéíóúãõàâêôç ")
    return ''.join(c for c in text if c in allowed_chars)

def clean_text(text):
    if not isinstance(text, str):
        return '' 
    
    text = text.lower().strip() 
    text = remove_urls(text)
    text = remove_mentions(text)
    text = remove_emojis(text)
    text = re.sub(r'\s+', ' ', text) 
    
    return text

def aplicar_clean_text(X):
    return X.apply(clean_text)

# Baixar stopwords 
try:
    nltk.data.find('corpora/stopwords')
except LookupError: 
    print("Recurso 'stopwords' não encontrado. Baixando...")
    nltk.download('stopwords', quiet=True)

toxicity_bp = Blueprint('toxicity', __name__)

import sys
sys.modules['__main__'] = sys.modules[__name__]

# Carregar o modelo 
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'modelo_toxicidade.joblib')
try:
    modelo = joblib.load(MODEL_PATH)
    print("Modelo do usuário carregado com sucesso em toxicity.py!")
except Exception as e:
    print(f"Erro ao carregar modelo do usuário em toxicity.py: {e}")
    modelo = None

@toxicity_bp.route('/predict', methods=['POST'])
@cross_origin()
def predict_toxicity():
    try:
        if modelo is None:
            return jsonify({'error': 'Modelo não carregado', 'success': False}), 500
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Campo "text" é obrigatório', 'success': False}), 400
        
        text = data['text']
        
        if not text or not text.strip():
            return jsonify({'error': 'Texto não pode estar vazio', 'success': False}), 400
        
        text_series = pd.Series([text])
        prediction = modelo.predict(text_series)[0]
        probability = modelo.predict_proba(text_series)[0]
        
        toxic_probability = float(probability[1])
        
        result = {
            'text': text,
            'is_toxic': bool(prediction),
            'toxic_probability': toxic_probability,
            'confidence': max(float(probability[0]), float(probability[1])),
            'success': True
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}', 'success': False}), 500

@toxicity_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': modelo is not None,
        'success': True
    })
