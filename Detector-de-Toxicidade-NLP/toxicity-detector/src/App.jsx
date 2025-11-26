import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
// ADICIONADO: Importei Gavel (martelo) e Ban
import { AlertTriangle, CheckCircle, MessageSquare, Trash2, Send, Trophy, Shield, Activity, Gavel, Ban } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- MOCK DATA ---
// ADICIONADO: Campo isBanned: false inicial
const initialRankingData = [
  { id: 1, username: "Maria clara", score: 98, level: "Crítico", isBanned: false },
  { id: 2, username: "Jõao alberto", score: 85, level: "Alto", isBanned: false },
  { id: 3, username: "Rafael Rainer", score: 72, level: "Médio", isBanned: false },
  { id: 4, username: "Anon_123", score: 45, level: "Baixo", isBanned: false },
  { id: 5, username: "BeeSideTest", score: 12, level: "Seguro", isBanned: false },
]

function App() {
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // ADICIONADO: Estado para gerenciar os usuários e permitir o banimento visual
  const [users, setUsers] = useState(initialRankingData)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ADICIONADO: Função para banir usuário (Front-end only)
  const handleBanUser = (userId) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        return { ...user, isBanned: true }
      }
      return user
    }))
  }

  const analyzeMessage = async (text) => {
    // Simulação da API
    try {
      return new Promise(resolve => setTimeout(() => {
        const isToxic = Math.random() > 0.5;
        resolve({
          is_toxic: isToxic,
          toxic_probability: isToxic ? 0.7 + (Math.random() * 0.25) : 0.1,
          confidence: 0.95
        })
      }, 1000));
    } catch (error) {
      console.error('Erro ao analisar mensagem:', error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const analysisResult = await analyzeMessage(currentMessage)

      const newMessage = {
        id: Date.now(),
        text: currentMessage,
        timestamp: new Date(),
        isToxic: analysisResult.is_toxic,
        toxicProbability: analysisResult.toxic_probability,
        confidence: analysisResult.confidence
      }

      setMessages(prev => [...prev, newMessage])
      setCurrentMessage('')
    } catch (err) {
      setError('Erro ao analisar a mensagem. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getToxicityBadge = (isToxic, probability) => {
    if (!isToxic) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">
          <CheckCircle className="w-3 h-3 mr-1" />
          Seguro
        </Badge>
      )
    }

    const variant = probability > 0.7 ? "destructive" : "secondary"
    const bgColor = probability > 0.7 ? "bg-red-500/20" : "bg-orange-500/20"
    const textColor = probability > 0.7 ? "text-red-400" : "text-orange-400"
    const borderColor = probability > 0.7 ? "border-red-500/50" : "border-orange-500/50"

    return (
      <Badge variant={variant} className={`${bgColor} ${textColor} ${borderColor} border`}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        Tóxico ({Math.round(probability * 100)}%)
      </Badge>
    )
  }

  return (
    <div className="min-h-screen p-4 font-sans text-foreground bg-background">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 shadow-none border-none bg-transparent">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-5xl font-black text-primary tracking-tight leading-none">
                Beeside
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground mt-2">
                Monitoramento e classificação de conteúdo em tempo real
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* ESTATÍSTICAS */}
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
            {/* Cards de estatísticas (sem alterações na lógica) */}
            <Card className="border-primary/30 shadow-sm hover:border-primary transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Analisado</p>
                        <p className="text-3xl font-bold text-foreground">{messages.length}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/30 shadow-sm hover:border-green-500/50 transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Mensagens Seguras</p>
                        <p className="text-3xl font-bold text-green-500">{messages.filter(m => !m.isToxic).length}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/30 shadow-sm hover:border-red-500/50 transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Mensagens Tóxicas</p>
                        <p className="text-3xl font-bold text-red-500">{messages.filter(m => m.isToxic).length}</p>
                    </div>
                </CardContent>
            </Card>

             <Card className="border-primary/30 shadow-sm hover:border-primary transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Taxa de Segurança</p>
                        <p className="text-3xl font-bold text-primary">
                            {messages.length > 0
                                ? Math.round((messages.filter(m => !m.isToxic).length / messages.length) * 100)
                                : 100}%
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Coluna da Esquerda: CHAT */}
          <div className="lg:col-span-2 h-full">
            <Card className="flex flex-col shadow-lg border-primary/20 h-full min-h-[600px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-primary/10 bg-card rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <CardTitle className="text-xl text-foreground">Chat em Tempo Real</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 bg-background/50">
                {/* Area de mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px] lg:max-h-[calc(100vh-400px)] min-h-[400px] scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-xl shadow-sm border transition-all duration-300 ${
                          message.isToxic
                            ? 'bg-red-950/30 border-l-4 border-l-red-500 border-y-red-500/20 border-r-red-500/20'
                            : 'bg-card border-l-4 border-l-primary border-y-primary/10 border-r-primary/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {formatTime(message.timestamp)}
                          </span>
                          {getToxicityBadge(message.isToxic, message.toxicProbability)}
                        </div>
                        <p className={`text-foreground leading-relaxed ${message.isToxic ? 'font-medium' : ''}`}>
                          {message.text}
                        </p>
                        {message.isToxic && (
                            <div className="mt-3 pt-2 border-t border-red-500/20 flex items-center gap-2 text-xs text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Conteúdo potencialmente ofensivo</span>
                            </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[300px]">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium text-foreground">O chat está vazio</p>
                      <p className="text-sm">Envie uma mensagem para testar a IA</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-card border-t border-primary/10 rounded-b-xl">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 text-red-400 text-sm bg-red-950/50 border border-red-500/30 p-2.5 rounded-md flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem aqui..."
                      className="flex-1 min-h-[50px] max-h-[120px] resize-none border-primary/30 focus:border-primary focus:ring-primary bg-background focus:bg-card transition-all text-foreground placeholder:text-muted-foreground"
                      rows={1}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="h-auto px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita: RANKING e INFO */}
          <div className="space-y-6 flex flex-col h-full">

            {/* RANKING CARD */}
            <Card className="shadow-lg border-primary/20 overflow-hidden flex-1 bg-card">
                <CardHeader className="bg-primary/10 pb-4 border-b border-primary/20">
                    <CardTitle className="text-lg flex items-center justify-between text-primary">
                          <div className="flex items-center gap-2">
                               Usuarios Toxicos
                          </div>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        Gerenciamento e índice de detecção
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-primary/10">
                        {/* MUDANÇA: Agora usa o estado 'users' em vez de mockRankingData */}
                        {users.map((user, index) => (
                            <div 
                                key={user.id} 
                                // MUDANÇA: Aplica opacidade e filtro grayscale se estiver banido
                                className={`p-4 flex items-center gap-3 transition-all duration-300 ${user.isBanned ? 'bg-black/40 grayscale opacity-50' : 'hover:bg-primary/5'}`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border
                                    ${index === 0 ? 'bg-primary text-primary-foreground border-primary' :
                                      index === 1 ? 'bg-muted text-foreground border-muted-foreground/20' :
                                      index === 2 ? 'bg-muted/50 text-muted-foreground border-muted-foreground/10' : 'bg-transparent text-muted-foreground border-transparent'}
                                `}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-medium text-sm ${user.isBanned ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                            {user.username}
                                        </span>
                                        <span className={`text-xs font-bold ${user.score > 80 ? 'text-red-400' : 'text-primary'}`}>
                                            {user.score}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${user.score > 80 ? 'bg-red-500' : user.score > 50 ? 'bg-primary' : 'bg-green-500'}`}
                                            style={{ width: `${user.score}%` }}
                                        />
                                    </div>
                                </div>
                                
                                {/* MUDANÇA: Botão de Banir */}
                                <div className="ml-2">
                                    {user.isBanned ? (
                                        <Badge variant="destructive" className="bg-red-900/50 text-red-500 border-red-900 text-[10px] px-2 py-0.5 h-6">
                                            <Ban className="w-3 h-3 mr-1" />
                                            BANIDO
                                        </Badge>
                                    ) : (
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                            onClick={() => handleBanUser(user.id)}
                                            title="Banir Usuário"
                                        >
                                            <Gavel className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Como Funciona */}
            <Card className="shadow-lg border-primary/20 bg-muted/50 text-foreground">
              <CardContent className="p-6">
                 <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    Como Funciona
                 </h3>
                 <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex gap-2">
                        <span className="text-primary">•</span>
                        <p>O ranking utiliza dados locais para demonstração.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-primary">•</span>
                        <p>Use o ícone de martelo para banir usuários tóxicos da lista (apenas visualmente).</p>
                    </div>
                 </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

export default App