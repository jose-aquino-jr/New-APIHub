'use client';

console.log('ConcluirWrapper carregado');

import BotaoConcluir from './BotaoConcluir';

interface Props {
  cursoId: string;
  moduloId: string;
  blocoId: string;
  proximaAulaUrl: string;
}

export default function ConcluirWrapper(props: Props) {
  return <BotaoConcluir {...props} />;
}
