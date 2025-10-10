import React from 'react';
import { BarChart3, Shield, AlertTriangle, MessageCircle } from 'lucide-react';

const ChatStats = ({ chatHistory }) => {
  const userMessages = chatHistory.filter(msg => msg.isUser && msg.isToxic !== null);
  const toxicCount = userMessages.filter(msg => msg.isToxic).length;
  const safeCount = userMessages.filter(msg => !msg.isToxic).length;
  const totalMessages = userMessages.length;
  
  const toxicPercentage = totalMessages > 0 ? (toxicCount / totalMessages) * 100 : 0;
  const safePercentage = totalMessages > 0 ? (safeCount / totalMessages) * 100 : 0;

  if (totalMessages === 0) {
    return null;
  }

  return (
    <div className="chat-stats">
      <div className="stats-header">
        <BarChart3 className="w-5 h-5" />
        <h4>Estatísticas da Sessão</h4>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <div className="stat-content">
            <span className="stat-value">{totalMessages}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        
        <div className="stat-item">
          <Shield className="w-4 h-4 text-green-500" />
          <div className="stat-content">
            <span className="stat-value">{safeCount}</span>
            <span className="stat-label">Seguras</span>
          </div>
        </div>
        
        <div className="stat-item">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <div className="stat-content">
            <span className="stat-value">{toxicCount}</span>
            <span className="stat-label">Tóxicas</span>
          </div>
        </div>
      </div>
      
      <div className="stats-bar">
        <div className="stats-bar-track">
          <div 
            className="stats-bar-safe" 
            style={{ width: `${safePercentage}%` }}
          ></div>
          <div 
            className="stats-bar-toxic" 
            style={{ width: `${toxicPercentage}%` }}
          ></div>
        </div>
        <div className="stats-percentages">
          <span className="safe-percentage">{safePercentage.toFixed(1)}% Seguras</span>
          <span className="toxic-percentage">{toxicPercentage.toFixed(1)}% Tóxicas</span>
        </div>
      </div>
    </div>
  );
};

export default ChatStats;
