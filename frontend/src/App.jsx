import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import ChatStats from './components/ChatStats.jsx';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const chatHistoryRef = useRef(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Verificar conexão com o backend ao carregar
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'test' }),
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const newMessage = { 
      id: Date.now(),
      text: message, 
      isUser: true, 
      isToxic: null, 
      score: 0,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatHistory((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setConnectionStatus('connected');

      setChatHistory((prev) => {
        return prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, isToxic: data.is_toxic, score: data.score }
            : msg
        );
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setConnectionStatus('error');
      
      setChatHistory((prev) => [...prev, { 
        id: Date.now(),
        text: 'Erro ao conectar com o servidor. Verifique se o backend está rodando em http://localhost:5000', 
        isUser: false, 
        isToxic: false, 
        score: 0,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }

    setMessage('');
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado ao backend';
      case 'error':
        return 'Erro na conexão';
      default:
        return 'Desconectado do backend';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🛡️ Detector de Toxicidade NLP</h1>
          <p className="subtitle">Demonstração de classificação de texto em tempo real</p>
          <div className="connection-status">
            {getConnectionStatusIcon()}
            <span className="connection-text">{getConnectionStatusText()}</span>
          </div>
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-header">
          <h3>Chat de Demonstração</h3>
          <Button 
            onClick={clearChat} 
            variant="outline" 
            size="sm"
            className="clear-button"
            disabled={chatHistory.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>

        <ChatStats chatHistory={chatHistory} />

        <div className="chat-history" ref={chatHistoryRef}>
          {chatHistory.length === 0 && (
            <div className="empty-state">
              <p>👋 Olá! Digite uma mensagem para testar o detector de toxicidade.</p>
              <div className="example-messages">
                <p><strong>Exemplos para testar:</strong></p>
                <div className="examples">
                  <span className="example safe">Que dia lindo hoje!</span>
                  <span className="example toxic">Você é um idiota</span>
                  <span className="example safe">Obrigado pela ajuda</span>
                </div>
              </div>
            </div>
          )}
          
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.isUser ? 'user-message' : 'system-message'} ${
                msg.isToxic === true ? 'toxic-message' : 
                msg.isToxic === false ? 'safe-message' : ''
              } ${msg.isError ? 'error-message' : ''}`}
            >
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.isUser && msg.isToxic !== null && (
                  <div className="message-analysis">
                    <div className="toxicity-indicator">
                      {msg.isToxic ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="toxicity-label">
                        {msg.isToxic ? 'Tóxico' : 'Seguro'}
                      </span>
                    </div>
                    <span className="toxicity-score">
                      Confiança: {(msg.score * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <span className="message-timestamp">{msg.timestamp}</span>
            </div>
          ))}
          
          {isLoading && (
            <div className="loading-message">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analisando mensagem...</span>
            </div>
          )}
        </div>

        <div className="chat-input">
          <div className="input-container">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem aqui... (Enter para enviar)"
              rows={1}
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!message.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="input-help">
            <span>💡 Dica: Mensagens tóxicas aparecerão em vermelho, mensagens seguras em azul</span>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>Desenvolvido para demonstração de modelo NLP de classificação de toxicidade</p>
      </footer>
    </div>
  );
}

export default App;