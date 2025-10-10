from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import pandas as pd
import sys

# Adicionar o diretório atual ao path para importar text_utils
sys.path.append(os.path.dirname(__file__))
from text_utils import clean_text, aplicar_clean_text

# Inicializa a aplicação Flask
app = Flask(__name__)
CORS(app)

# Caminho do modelo
MODEL_PATH = os.path.join(os.path.dirname(__file__), "modelo_toxicidade.joblib")

try:
    model = joblib.load(MODEL_PATH)
    print("✅ Modelo carregado com sucesso!")
except Exception as e:
    print(f"⚠️ Erro ao carregar o modelo: {e}")
    model = None

# --- Rota principal de predição ---
@app.route('/predict', methods=['POST'])
def predict():
    """Recebe um texto, analisa se é tóxico e retorna o resultado."""
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    text = data.get('text', '').strip()
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # --- Predição real ---
    if model is not None:
        try:
            # Criar uma Series do pandas para o texto (como esperado pelo modelo)
            text_series = pd.Series([text])
            
            # Fazer a predição usando o modelo carregado
            pred = model.predict(text_series)[0]
            is_toxic = bool(pred)

            # Probabilidade da predição (se disponível)
            try:
                proba = model.predict_proba(text_series)[0][1]
            except:
                proba = 1.0 if is_toxic else 0.0

        except Exception as e:
            return jsonify({'error': f'Erro na predição: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Modelo não carregado.'}), 500

    # --- Retorno JSON ---
    return jsonify({
        'text': text,
        'is_toxic': is_toxic,
        'score': round(float(proba), 4)
    })

# --- Rota de teste ---
@app.route('/test', methods=['GET'])
def test():
    """Rota de teste para verificar se o servidor está funcionando."""
    return jsonify({
        'status': 'OK',
        'message': 'Servidor de detecção de toxicidade funcionando!',
        'model_loaded': model is not None
    })

# --- Executa o servidor Flask ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
