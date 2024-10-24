// src/components/LevelComplete.jsx
const LevelComplete = ({ nivel, username, onContinue, isLastLevel }) => {
  const recursos = [
    {
      nome: "Escola Games",
      url: "https://www.escolagames.com.br/",
      descricao: "Jogos educativos gratuitos"
    },
    {
      nome: "Smart Kids",
      url: "https://www.smartkids.com.br/",
      descricao: "Atividades educativas online"
    },
    {
      nome: "Portal do Professor",
      url: "http://portaldoprofessor.mec.gov.br/",
      descricao: "Recursos educacionais do MEC"
    },
    {
      nome: "CEALE",
      url: "http://www.ceale.fae.ufmg.br/jogosdealphabetizacao",
      descricao: "Jogos de Alfabetização"
    },
    {
      nome: "Nova Escola",
      url: "https://novaescola.org.br",
      descricao: "Atividades e planos de aula"
    }
  ];

  const renderRecurso = (recurso) => (
    <a
      key={recurso.nome}
      href={recurso.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border rounded-lg hover:bg-purple-50 transition"
    >
      <h3 className="font-bold text-purple-600">{recurso.nome}</h3>
      <p className="text-sm text-gray-600">{recurso.descricao}</p>
    </a>
  );

  const renderUltimoNivel = () => (
    <>
      <h2 className="text-2xl font-bold text-purple-600 mb-4">
        🎉 Parabéns, {username}! 🎉
      </h2>
      <p className="mb-6">
        Você completou todos os níveis! Continue praticando com estes recursos:
      </p>
      <div className="space-y-4 mb-6">
        {recursos.map(renderRecurso)}
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Lembre-se: A prática leva à perfeição! Continue estudando com ajuda de um adulto.
      </p>
    </>
  );

  const renderNivelNormal = () => (
    <>
      <h2 className="text-2xl font-bold text-purple-600 mb-4">
        🎉 Parabéns! 🎉
      </h2>
      <p className="mb-6">
        Você completou o nível {nivel}! Pronto para o próximo desafio?
      </p>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <div className="text-center">
          {isLastLevel ? renderUltimoNivel() : renderNivelNormal()}
          <button
            onClick={onContinue}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            {isLastLevel ? "Recomeçar" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
