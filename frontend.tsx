import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const AtividadeAlfabetizacao = () => {
  const [usuario, setUsuario] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [atividadeAtual, setAtividadeAtual] = useState(0);
  const [resposta, setResposta] = useState('');
  const [feedback, setFeedback] = useState('');
  const [pontuacao, setPontuacao] = useState(0);
  const [nivelAtual, setNivelAtual] = useState(1);

  // Simulação do login (em produção, conectaria com o backend)
  const fazerLogin = () => {
    setUsuario({
      id: 1,
      nome: 'Aluno Exemplo',
      email: 'aluno@exemplo.com'
    });
  };

  useEffect(() => {
    // Em produção, buscaria do backend
    setAtividades([
      { id: 1, tipo: 'letra', conteudo: 'A', audio_url: '/audio/a.mp3' },
      { id: 2, tipo: 'silaba', conteudo: 'BA', audio_url: '/audio/ba.mp3' },
      { id: 3, tipo: 'palavra', conteudo: 'BOLA', audio_url: '/audio/bola.mp3' },
    ]);
  }, [nivelAtual]);

  const verificarResposta = () => {
    const atividadeCorreta = atividades[atividadeAtual];
    if (resposta.toUpperCase() === atividadeCorreta.conteudo) {
      setFeedback('Correto!');
      setPontuacao(pontuacao + 10);
      setTimeout(() => {
        if (atividadeAtual < atividades.length - 1) {
          setAtividadeAtual(atividadeAtual + 1);
        } else {
          setNivelAtual(nivelAtual + 1);
          setAtividadeAtual(0);
        }
        setResposta('');
        setFeedback('');
      }, 1500);
    } else {
      setFeedback('Tente novamente!');
    }
  };

  if (!usuario) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Bem-vindo à Plataforma de Alfabetização</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fazerLogin} className="w-full">
            Entrar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Olá, {usuario.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg mb-4">Pontuação: {pontuacao} | Nível: {nivelAtual}</div>
        </CardContent>
      </Card>

      {atividades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {atividades[atividadeAtual].tipo === 'letra' && 'Que letra é esta?'}
              {atividades[atividadeAtual].tipo === 'silaba' && 'Que sílaba é esta?'}
              {atividades[atividadeAtual].tipo === 'palavra' && 'Que palavra é esta?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <span className="text-6xl font-bold">
                {atividades[atividadeAtual].conteudo}
              </span>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite sua resposta..."
                className="text-center text-2xl"
              />

              <Button
                onClick={verificarResposta}
                className="w-full"
                size="lg"
              >
                Verificar
              </Button>

              {feedback && (
                <div className={`flex items-center justify-center gap-2 ${
                  feedback === 'Correto!' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {feedback === 'Correto!' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                  <span className="text-lg">{feedback}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AtividadeAlfabetizacao;