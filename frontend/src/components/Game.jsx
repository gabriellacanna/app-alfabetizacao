import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function Game() {
  const [atividades, setAtividades] = useState([])
  const [nivelAtual, setNivelAtual] = useState(1)
  const [resposta, setResposta] = useState('')
  const [atividadeAtual, setAtividadeAtual] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [pontuacao, setPontuacao] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    carregarAtividades()
  }, [nivelAtual])

  const carregarAtividades = async () => {
    try {
      setCarregando(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/atividades/?nivel=${nivelAtual}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      if (!response.ok) throw new Error('Erro ao carregar atividades')
      const data = await response.json()
      setAtividades(data.atividades)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setCarregando(false)
    }
  }

  const verificarResposta = () => {
    const atividadeCorreta = atividades[atividadeAtual]
    if (resposta.toUpperCase() === atividadeCorreta.conteudo) {
      setFeedback('Muito bem! 🎉')
      setPontuacao(pontuacao + 10)
      setTimeout(() => {
        if (atividadeAtual < atividades.length - 1) {
          setAtividadeAtual(prev => prev + 1)
        } else {
          setNivelAtual(prev => prev + 1)
          setAtividadeAtual(0)
        }
        setResposta('')
        setFeedback('')
      }, 1500)
    } else {
      setFeedback('Tente novamente! 💪')
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Aprendendo ABC</h1>
          <div className="text-sm text-gray-600">
            Nível: {nivelAtual} | Pontos: {pontuacao}
          </div>
        </div>

        {atividades.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-gray-800 mb-4">
                {atividades[atividadeAtual]?.conteudo}
              </div>
              {atividades[atividadeAtual]?.dica && (
                <div className="text-sm text-gray-600">
                  Dica: {atividades[atividadeAtual].dica}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite sua resposta"
                className="w-full p-3 border rounded-lg text-center text-2xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              />

              <button
                onClick={verificarResposta}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
              >
                Verificar
              </button>

              {feedback && (
                <div className={`text-center text-xl ${
                  feedback.includes('bem') ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {feedback}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600">
            Não há atividades disponíveis para este nível.
          </div>
        )}
      </div>
    </div>
  )
}

export default Game
