import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Ranking = ({ isOpen, onClose, pontuacaoAtual }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      carregarRanking();
    }
  }, [isOpen]);

  const carregarRanking = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ranking`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setRanking(data.ranking);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
          🏆 Ranking de Jogadores
        </h2>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sua pontuação atual: {pontuacaoAtual}
              </h3>
            </div>

            <div className="space-y-2">
              {ranking.map((jogador, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    jogador.username === user.username
                      ? 'bg-purple-100 border-2 border-purple-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-bold text-lg text-gray-700 mr-3">
                        {index + 1}º
                      </span>
                      <span className="text-gray-800">{jogador.username}</span>
                    </div>
                    <span className="font-semibold text-purple-600">
                      {jogador.pontuacao_total} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ranking;