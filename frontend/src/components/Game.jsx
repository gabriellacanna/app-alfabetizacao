import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LevelComplete from './LevelComplete';

function Game() {
  const [atividades, setAtividades] = useState([]);
  const [nivelAtual, setNivelAtual] = useState(1);
  const [resposta, setResposta] = useState('');
  const [atividadeAtual, setAtividadeAtual] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [pontuacao, setPontuacao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const MAX_LEVEL = 4; // Número total de níveis
  const { user } = useAuth();

  useEffect(() => {
    carregarAtividades();
  }, [nivelAtual]);

  const carregarAtividades = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/atividades/?nivel=${nivelAtual}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar atividades');
      const data = await response.json();
      setAtividades(data.atividades || []);
      setAtividadeAtual(0); // Reseta a atividade atual ao carregar atividades
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setCarregando(false);
    }
  };

  const verificarResposta = () => {
    if (!atividades[atividadeAtual]) return;
    const atividadeCorreta = atividades[atividadeAtual];
    let respostaCorreta = false;

    switch (atividadeCorreta.tipo) {
      case 'letra':
        if (atividadeCorreta.conteudo.includes('_')) {
          // Para completar palavras (ex: "C _ S _")
          const palavrasValidas = {
            'C _ S _': ['CASA'],
            'P _ R _': ['PARA', 'PARE']
          };
          respostaCorreta = palavrasValidas[atividadeCorreta.conteudo]?.includes(resposta.toUpperCase());
        } else if (atividadeCorreta.conteudo.includes(',')) {
          // Para sequência de letras
          respostaCorreta = resposta.toUpperCase() === 'F'; // Para "A, B, C, D, E..." aceita próxima letra
        } else {
          respostaCorreta = resposta.toUpperCase() === atividadeCorreta.conteudo;
        }
        break;

      case 'palavra':
        if (atividadeCorreta.conteudo.startsWith('O que é')) {
          const respostasValidas = {
            'O que é uma maçã?': ['MACA', 'MAÇA', 'MAÇÃ', 'FRUTA'],
            'O que é uma bola?': ['BOLA', 'BOLINHA', 'BRINQUEDO'],
            'O que é um cachorro?': ['CAO', 'CÃO', 'CACHORRO', 'ANIMAL'],
            'O que é uma escola?': ['ESCOLA', 'COLEGIO', 'COLÉGIO'],
            'O que é um livro?': ['LIVRO', 'LEITURA', 'HISTORIA', 'HISTÓRIA']
          };
          respostaCorreta = respostasValidas[atividadeCorreta.conteudo]?.includes(resposta.toUpperCase());
        } else if (atividadeCorreta.conteudo === 'O gato está no telhado.') {
          const respostasValidas = ['TELHADO', 'ESTA NO TELHADO', 'ESTÁ NO TELHADO'];
          respostaCorreta = respostasValidas.includes(resposta.toUpperCase());
        }
        break;

      case 'silaba':
        const silabasParaPalavras = {
          'MA e SÃO': 'MANSÃO',
          'CA e SA': 'CASA',
          'BA e LA': 'BALA',
          'PA e RA': 'PARA'
        };
        respostaCorreta = resposta.toUpperCase() === silabasParaPalavras[atividadeCorreta.conteudo];
        break;

      case 'frase':
        if (atividadeCorreta.conteudo.includes('___')) {
          const respostaLimpa = resposta.trim().toUpperCase();
          if (atividadeCorreta.conteudo === 'Eu vejo um ___.') {
            const animaisValidos = [
             // Mamíferos domésticos
             'GATO', 'GATINHO', 'GATINHA', 'FELINO',
             'CACHORRO', 'CÃO', 'CADELA', 'CACHORRINHO', 'CACHORRINHA', 'DOGUINHO', 'CANINO',
             'COELHO', 'COELHINHO', 'COELHINHA', 'LEBRE',
             'HAMSTER', 'PORQUINHO DA INDIA',
          
             // Mamíferos da fazenda
             'BOI', 'VACA', 'BEZERRO', 'BEZERRA', 'TOURO', 'NOVILHO', 'NOVILHA',
             'CAVALO', 'ÉGUA', 'POTRO', 'POTRA', 'PÔNEI',
             'PORCO', 'PORCA', 'LEITÃO', 'LEITOA', 'PORQUINHO',
             'OVELHA', 'CARNEIRO', 'CORDEIRO', 'CORDEIRA',
             'CABRA', 'BODE', 'CABRITINHO', 'CABRITINHA',
             'BURRO', 'MULA', 'JUMENTO',
             
             // Aves comuns
             'PASSARO', 'PÁSSARO', 'PASSARINHO', 'PASSARINHA', 'AVE',
             'GALINHA', 'GALO', 'FRANGO', 'FRANGA', 'PINTINHO',
             'PATO', 'PATA', 'PATINHO', 'PATINHA',
             'POMBO', 'POMBA', 'POMBINHO', 'POMBINHA',
             'PERIQUITO', 'PAPAGAIO', 'CALOPSITA', 'ARARA',
             'CANARIO', 'CANÁRIO', 'SABIÁ',
             
             // Peixes
             'PEIXE', 'PEIXINHO', 'DOURADO', 'BETA', 'KINGUIO', 'GOLDFISH',
             
             // Répteis e Anfíbios
             'TARTARUGA', 'JABUTI', 'CAGADO', 'CÁGADO',
             'LAGARTO', 'LAGARTIXA', 'IGUANA',
             'COBRA', 'SERPENTE',
             'SAPO', 'RÃ', 'PERERECA',
          
             // Insetos
             'BORBOLETA', 'FORMIGA', 'JOANINHA', 'GRILO', 'CIGARRA', 'ABELHA',
             
             // Animais selvagens comuns
             'LEÃO', 'TIGRE', 'URSO', 'LOBO', 'RAPOSA', 'MACACO',
             'GIRAFA', 'ELEFANTE', 'ZEBRA', 'HIPOPÓTAMO', 'RINOCERONTE',
             'JACARÉ', 'CROCODILO', 'GORILA', 'CHIMPANZÉ',
             
             // Animais brasileiros
             'TUCANO', 'ARARA', 'ONÇA', 'TAMANDUÁ', 'CAPIVARA', 'TATU', 
             'QUATI', 'ANTA', 'BOTO', 'MICO', 'SAGUI', 'PREGUIÇA'
           ];
            respostaCorreta = animaisValidos.includes(respostaLimpa);
          } else if (atividadeCorreta.conteudo === 'Hoje eu fui ao ___.') {
            const lugaresValidos = ['PARQUE', 'SHOPPING', 'MERCADO', 'CINEMA', 'ZOOLOGICO', 'ZOOLÓGICO', 'ESCOLA', 'PARQUINHO', 'QUADRA DE FUTEBOL', 'MEU QUARTO', 'QUARTO', 'BANHEIRO', 'COZINHA', 'CARRO'];
            respostaCorreta = lugaresValidos.includes(respostaLimpa);
          }
        }
        break;

      default:
        respostaCorreta = resposta.toUpperCase() === atividadeCorreta.conteudo;
    }

    if (respostaCorreta) {
      setFeedback('Muito bem!');
      setPontuacao(pontuacao + 10);
      setTimeout(() => {
        if (atividadeAtual < atividades.length - 1) {
          setAtividadeAtual((prev) => prev + 1);
        } else {
          setShowLevelComplete(true);
        }
        setResposta('');
        setFeedback('');
      }, 1500);
    } else {
      setFeedback('Tente novamente!');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verificarResposta();
    }
  };

  const renderAtividade = (atividade) => {
    if (!atividade) return null;

    let conteudoFormatado = atividade.conteudo;
    let tamanhoFonte = 'text-6xl';

    if (atividade.tipo === 'palavra' && atividade.conteudo.startsWith('O que é')) {
      tamanhoFonte = 'text-3xl';
    } else if (atividade.tipo === 'frase' || atividade.tipo === 'silaba') {
      tamanhoFonte = 'text-3xl';
    } else if (atividade.tipo === 'letra' && atividade.conteudo.includes(',')) {
      tamanhoFonte = 'text-4xl';
    }

    return (
      <div className={`font-bold text-gray-800 mb-4 ${tamanhoFonte}`}>
        {conteudoFormatado}
      </div>
    );
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
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
            <h3 className="text-xl text-gray-800 mb-4">Parabéns!</h3>
            <p className="text-gray-600 mb-4">
              Você completou todas as atividades do nível {nivelAtual - 1}!
            </p>
            {nivelAtual > 1 && (
              <button
                onClick={() => {
                  setNivelAtual((prev) => prev - 1);
                  setAtividadeAtual(0);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Voltar ao nível anterior
              </button>
            )}
            {nivelAtual < MAX_LEVEL && (
              <button
                onClick={() => {
                  setNivelAtual((prev) => prev + 1);
                  setAtividadeAtual(0);
                  setShowLevelComplete(false);
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
              {renderAtividade(atividades[atividadeAtual])}
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
            setAtividadeAtual(0);
            if (nivelAtual === MAX_LEVEL) {
              setNivelAtual(1);
            } else {
              setNivelAtual((prev) => prev + 1);
            }
            setShowLevelComplete(false);
          }}
        />
      )}
    </div>
  );
}

export default Game;
