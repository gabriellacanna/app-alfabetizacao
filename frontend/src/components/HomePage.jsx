import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <article className="prose prose-slate lg:prose-lg mx-auto">
          <h1 className="text-3xl font-bold text-purple-600 text-center">
            Bem-vindo ao Alfabetizar com Amor
          </h1>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-yellow-700 font-medium !my-0">
              ⚠️ Atenção: Esta atividade deve ser realizada com o acompanhamento de um adulto
              que saiba ler. O aprendizado é mais efetivo quando feito com orientação adequada.
            </p>
          </div>

          <h2>Como funciona?</h2>
          <ul>
            <li>Atividades divididas em níveis progressivos</li>
            <li>Começamos com vogais e avançamos até palavras completas</li>
            <li>Feedback imediato para cada resposta</li>
            <li>Acompanhamento do progresso</li>
          </ul>

          <h2>Para começar:</h2>
          <div className="flex gap-4 justify-center not-prose">
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

          <div className="text-sm text-gray-600 text-center mt-8">
            <p>
              Recomendamos que as atividades sejam realizadas em um ambiente tranquilo e
              sem distrações.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default HomePage;
