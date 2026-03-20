export interface Estacao {
  id: string;
  nome: string;
  codigo: string;
  cidade: string;
}

export function stationFilter(estacoes: Estacao[], termo: string): Estacao[] {
  if (!termo.trim()) return estacoes;
  
  const termoFormatado = termo.toLowerCase().trim();
  return estacoes.filter(estacao => 
    estacao.nome.toLowerCase().includes(termoFormatado) || 
    estacao.codigo.toLowerCase().includes(termoFormatado)
  );
}