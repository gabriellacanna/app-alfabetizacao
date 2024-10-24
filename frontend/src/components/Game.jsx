// src/components/Game.jsx

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LevelComplete from './LevelComplete'

function Game() {
  const [atividades, setAtividades] = useState([])
  const [nivelAtual, setNivelAtual] = useState(1)
  const [resposta, setResposta] = useState('')
  const [atividadeAtual, setAtividadeAtual] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [pontuacao, setPontuacao] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [showLevelComplete, setShowLevelComplete] = useState(false)
  const MAX_LEVEL = 4 // Número total de níveis
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
      setAtividades(data.atividades || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setCarregando(false)
    }
  }

  const verificarResposta = () => {
    if (!atividades[atividadeAtual]) return

    const atividadeCorreta = atividades[atividadeAtual]
    if (resposta.toUpperCase() === atividadeCorreta.conteudo) {
      setFeedback('Muito bem! 🎉')
      setPontuacao(pontuacao + 10)
      setTimeout(() => {
        if (atividadeAtual < atividades.length - 1) {
          setAtividadeAtual(prev => prev + 1)
        } else {
          setShowLevelComplete(true)
        }
        setResposta('')
        setFeedback('')
      }, 1500)
    } else {
      setFeedback('Tente novamente! 💪')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verificarResposta()
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

        {atividades.length === 0 ? (
          <div className="text-center">
            <h3 className="text-xl text-gray-800 mb-4">
              Parabéns! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              Você completou todas as atividades do nível {nivelAtual - 1}!
            </p>
            {nivelAtual > 1 && (
              <button
                onClick={() => {
                  setNivelAtual(prev => prev - 1)
                  setAtividadeAtual(0)
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Voltar ao nível anterior
              </button>
            )}
            {nivelAtual < MAX_LEVEL && (
              <button
                onClick={() => {
                  setNivelAtual(prev => prev + 1)
                  setAtividadeAtual(0)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ml-2"
              >
                Próximo nível
              </button>
            )}
          </div>
        ) : (
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
                onKeyPress={handleKeyPress}
                placeholder="Digite sua resposta"
                className="w-full p-3 border rounded-lg text-center text-2xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                autoFocus
              />

              <button
                onClick={verificarResposta}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
              >
                Verificar
              </button>

              {feedback && (
                <div
                  className={`text-center text-xl font-bold ${
                    feedback.includes('bem') ? 'text-green-600' : 'text-orange-600'
                  } animate-bounce`}
                >
                  {feedback}
                </div>
              )}
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              Atividade {atividadeAtual + 1} de {atividades.length}
            </div>
          </>
        )}
      </div>

      {showLevelComplete && (
        <LevelComplete
          nivel={nivelAtual}
          username={user.username}
          isLastLevel={nivelAtual === MAX_LEVEL}
          onContinue={() => {
            if (nivelAtual === MAX_LEVEL) {
              setNivelAtual(1)
            } else {
              setNivelAtual(prev => prev + 1)
            }
            setAtividadeAtual(0)
            setShowLevelComplete(false)
          }}
        />
      )}
    </div>
  )
}

export default Game

