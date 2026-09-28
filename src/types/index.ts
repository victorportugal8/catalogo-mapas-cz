export interface Mapa {
  id: string
  nome: string
  link_workshop: string
  status: string
  nota: number | null
  imagem_url: string | null
  tags: string[]
  created_at: string
}

export interface Historico {
  id: string;
  mapa_id: string;
  data_partida: string;
  jogadores: string | null;
  round_alcancado: number | null;
  resultado: string | null;
  observacoes: string | null;
  created_at: string;
}