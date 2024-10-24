// src/components/HomePage.jsx
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6 text-center">
          Bem-vindo ao Alfabetizar com Amor
        </h1>

        <div className="typography typography-purple mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700 font-medium">
              ⚠️ Atenção: Esta atividade deve ser realizada com o acompanhamento de um adulto
              que saiba ler. O aprendizado é mais efetivo quando feito com orientação adequada.
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Como funciona?</h2>
          <ul className="space-y-2 mb-6">
            <li>Atividades divididas em níveis progressivos</li>
            <li>Começamos com vogais e avançamos até palavras completas</li>
            <li>Feedback imediato para cada resposta</li>
            <li>Acompanhamento do progresso</li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">Para começar:</h2>
          <div className="flex gap-4 justify-center mb-8">
            <Link
              to="/register"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Criar Conta
            </Link>
            <Link
              to="/login"
              className="bg-white text-purple-600 border-2 border-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition"
            >
              Entrar
            </Link>
          </div>

          <div className="text-sm text-gray-600 text-center">
            <p>
              Recomendamos que as atividades sejam realizadas em um ambiente tranquilo e
              sem distrações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
