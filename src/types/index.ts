export interface Mapa {
  id: string
  nome: string
  link_workshop: string
  status: boolean
  nota: number | null
  imagem_url: string | null
  tags: string[]
  created_at: string
}