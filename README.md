nlp_toxicity_demo/
├── backend/                  # Contém a aplicação Flask e o modelo NLP
│   ├── model/                # Diretório para o modelo NLP treinado
│   ├── app.py                # Aplicação Flask principal
│   ├── requirements.txt      # Dependências Python para o backend
│   └── README.md             # Documentação específica do backend
└── frontend/                 # Contém a aplicação React
    ├── public/               # Arquivos estáticos públicos
    ├── src/                  # Código fonte da aplicação React
    │   ├── assets/           # Ativos estáticos como imagens
    │   ├── components/       # Componentes React reutilizáveis
    │   ├── App.css           # Estilos CSS para o componente principal
    │   ├── App.jsx           # Componente principal da aplicação React
    │   └── main.jsx          # Ponto de entrada da aplicação React
    ├── index.html            # Arquivo HTML principal
    ├── package.json          # Dependências e scripts do frontend
    ├── pnpm-lock.yaml        # Lock file para dependências
    ├── vite.config.js        # Configuração do Vite
    └── README.md             # Documentação específica do frontend