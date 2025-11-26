// Configuração da API
const config = {
  // Em desenvolvimento, usa localhost
  // Em produção, usa URL relativa
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api',
  
  ENDPOINTS: {
    TOXICITY_PREDICT: '/toxicity/predict',
    TOXICITY_BATCH: '/toxicity/batch_predict',
    TOXICITY_HEALTH: '/toxicity/health'
  }
}

export default config
