import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [atividades, setAtividades] = useState([])
  const [nivelAtual, setNivelAtual] = useState(1)
  const [resposta, setResposta] = useState('')
  const [atividadeAtual, setAtividadeAtual] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [pontuacao, setPontuacao] = useState(0)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const inicializarDados = async () => {
      try {
        console.log('Inicializando dados...')
        const response = await fetch(`${API_URL}/inicializar-dados`)
        if (!response.ok) throw new Error('Erro ao inicializar dados')
        await carregarAtividades()
      } catch (error) {
        console.error('Erro na inicialização:', error)
        setErro('Erro ao inicializar os dados')
      }
    }

    const carregarAtividades = async () => {
      try {
        console.log('Carregando atividades...')
        console.log('URL da API:', API_URL)
        setCarregando(true)
        const response = await fetch(`${API_URL}/atividades/?nivel=${nivelAtual}`)
        if (!response.ok) throw new Error('Erro ao carregar atividades')
        const data = await response.json()
        console.log('Dados recebidos:', data)
        if (data.length === 0) {
          setErro('Nenhuma atividade disponível para este nível')
        } else {
          setAtividades(data)
          setErro(null)
        }
      } catch (error) {
        console.error('Erro ao carregar:', error)
        setErro('Não foi possível carregar as atividades')
      } finally {
        setCarregando(false)
      }
    }

    inicializarDados()
  }, [nivelAtual])

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
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-8 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-8 flex flex-col items-center justify-center">
        <div className="text-xl text-red-600 mb-4">{erro}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Aprendendo ABC</h1>
          <div className="text-sm text-gray-600">
            Nível: {nivelAtual} | Pontos: {pontuacao}
          </div>
        </div>

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
            className="w-full p-3 border rounded-lg text-center text-2xl"
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
      </div>
    </div>
  )
}

export default App
