from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Inicializa a aplicação Flask
app = Flask(__name__)

# Habilita o CORS para permitir que o frontend acesse a API
CORS(app)

# --- Carrega o modelo de Machine Learning ---
# Certifique-se de que o arquivo 'modelo_toxicidade.joblib' está na mesma pasta.
try:
    modelo = joblib.load("modelo_toxicidade.joblib")
    print("✅ Modelo carregado com sucesso!")
except Exception as e:
    print(f"⚠️ Erro ao carregar o modelo: {e}")
    modelo = None


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
    if modelo is not None:
        try:
            # Faz a previsão usando o modelo carregado
            pred = modelo.predict([text])[0]
            
            # Se for um modelo binário (0 = não tóxico, 1 = tóxico)
            is_toxic = bool(pred)
            
            # Opcional: probabilidade da predição (se o modelo permitir)
            if hasattr(modelo.named_steps['lr'], "predict_proba"):
                proba = modelo.named_steps['lr'].predict_proba([text])[0][1]
            else:
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


# --- Executa o servidor Flask ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
