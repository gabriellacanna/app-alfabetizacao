// src/components/LevelComplete.jsx
function LevelComplete({ nivel, username, onContinue, isLastLevel }) {
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
   }
 ];

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
     <div className="bg-white rounded-xl p-8 max-w-md w-full">
       <div className="text-center">
         {isLastLevel ? (
           <>
             <h2 className="text-2xl font-bold text-purple-600 mb-4">
               🎉 Parabéns, {username}! 🎉
             </h2>
             <p className="mb-6">
               Você completou todos os níveis! Continue praticando com estes recursos:
             </p>
             <div className="space-y-4 mb-6">
               {recursos.map((recurso) => (
                 
                   key={recurso.nome}
                   href={recurso.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="block p-4 border rounded-lg hover:bg-purple-50 transition"
                 >
                   <h3 className="font-bold text-purple-600">{recurso.nome}</h3>
                   <p className="text-sm text-gray-600">{recurso.descricao}</p>
                 </a>
               ))}
             </div>
           </>
         ) : (
           <>
             <h2 className="text-2xl font-bold text-purple-600 mb-4">
               🎉 Parabéns! 🎉
             </h2>
             <p className="mb-6">
               Você completou o nível {nivel}! Pronto para o próximo desafio?
             </p>
           </>
         )}

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
