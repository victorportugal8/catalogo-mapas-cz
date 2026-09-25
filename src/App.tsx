import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { MapFormModal } from './components/MapFormModal'
import { Search, Trash2, Edit2, Star } from 'lucide-react'
import { supabase } from './lib/supabase'
import type { Mapa } from './types/'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mapas, setMapas] = useState<Mapa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapaEditando, setMapaEditando] = useState<Mapa | null>(null)

  // Gerenciamento do estado de busca
  const [searchQuery, setSearchQuery] = useState('')

  // Estados para os filtros
  const [statusFilter, setStatusFilter] = useState('todos') // 'todos', 'jogado', 'nao-jogado'
  const [tagFilter, setTagFilter] = useState('todas') // 'todas' ou o nome da tag
  const [sortFilter, setSortFilter] = useState('az') // 'az' ou 'za'

  // Função pura: apenas vai no Supabase e devolve os dados (não mexe nos states)
  const obterMapasDoBanco = async () => {
    const { data, error } = await supabase
      .from('mapas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar mapas:', error)
      return []
    }
    return data || []
  }

  // useEffect seguro: avisa ao linter que o estado só muda no callback (.then)
  useEffect(() => {
    obterMapasDoBanco().then((dados) => {
      setMapas(dados)
      setIsLoading(false)
    })
  }, [])

  // Extrai todas as tags únicas de todos os mapas cadastrados
  const todasAsTags = Array.from(
    new Set(mapas.flatMap((mapa) => mapa.tags || []))
  ).sort()

  // Atualização após fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsLoading(true) // Mostra o spinner de novo enquanto busca
    
    obterMapasDoBanco().then((dados) => {
      setMapas(dados)
      setIsLoading(false)
    })
  }

  const handleDeleteMapa = async (id: string, nome: string) => {
    // Confirmação nativa do navegador para evitar cliques acidentais
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o mapa "${nome}"?`)
    if (!confirmacao) return

    // Deleta do Supabase
    const { error } = await supabase
      .from('mapas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar mapa:', error)
      alert('Erro ao excluir o mapa.')
      return;
    }

    // Atualiza a lista na tela imediatamente removendo o mapa excluído
    setMapas(mapas.filter(mapa => mapa.id !== id))
  }

  const handleToggleStatus = async (id: string, statusAtual: string) => {
    // Define qual é o próximo status no ciclo
    let proximoStatus = 'nao_jogado'
    if (statusAtual === 'nao_jogado') proximoStatus = 'jogado'
    else if (statusAtual === 'jogado') proximoStatus = 'finalizado'
    else if (statusAtual === 'finalizado') proximoStatus = 'nao_jogado'

    // Atualiza a tela imediatamente (Optimistic UI)
    setMapas(mapasAnteriores => 
      mapasAnteriores.map(mapa => 
        mapa.id === id ? { ...mapa, status: proximoStatus } : mapa
      )
    )

    // Atualiza no banco de dados silenciosamente
    const { error } = await supabase
      .from('mapas')
      .update({ status: proximoStatus })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar o status no banco de dados.')
    }
  }

  // Filtra os mapas combinando busca de texto, status e tags
  const mapasFiltrados = mapas.filter((mapa) => {
    // Filtro de Texto (Nome ou Tag)
    const termoBusca = searchQuery.toLowerCase()
    const nomeBate = mapa.nome.toLowerCase().includes(termoBusca)
    const tagBate = mapa.tags?.some(tag => tag.toLowerCase().includes(termoBusca))
    const passaBuscaTexto = nomeBate || tagBate

    // Filtro de Status
    let passaStatus = true
    if (statusFilter !== 'todos') {
      if (statusFilter === 'nao_jogado') {
        // Abrange a string nova, o booleano antigo (false) e valores vazios (null/undefined)
        passaStatus = mapa.status === 'nao_jogado' || !mapa.status
      } else {
        passaStatus = mapa.status === statusFilter
      }
    }

    // Filtro de Tag (Dropdown)
    let passaTag = true
    if (tagFilter !== 'todas') {
      passaTag = mapa.tags?.includes(tagFilter) || false
    }

    // O mapa só aparece se passar nos três testes
    return passaBuscaTexto && passaStatus && passaTag
  }).sort((a, b) => {
      // NOVO: Lógica de Ordenação
      if (sortFilter === 'recentes') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortFilter === 'antigos') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortFilter === 'az') {
        return a.nome.localeCompare(b.nome)
      }
      if (sortFilter === 'za') {
        return b.nome.localeCompare(a.nome)
      }
      if (sortFilter === 'maior-nota') {
        return (b.nota || 0) - (a.nota || 0)
      }
      if (sortFilter === 'menor-nota') {
        // Se o mapa não tem nota, jogamos para o final da lista para não atrapalhar
        if (!a.nota) return 1
        if (!b.nota) return -1
        return a.nota - b.nota
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-zombies-background">
      <Header onNewMap={() => { setMapaEditando(null); setIsModalOpen(true); }} />

      <MapFormModal 
        key={isModalOpen ? (mapaEditando ? mapaEditando.id : 'novo-mapa') : 'fechado'}
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        mapaParaEditar={mapaEditando}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2 whitespace-nowrap">
            Meus Mapas
            {/* Atualizado para mostrar mapasFiltrados.length */}
            <span className="text-sm bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">
              {mapasFiltrados.length}
            </span>
          </h2>
          
          {/* Container de Filtros e Busca */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto lg:justify-end">

            {/* Dropdown de Ordenação */}
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="bg-zombies-surface border border-neutral-700 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-zombies-115 text-sm cursor-pointer"
            >
              <option value="az">Ordem Alfabética (A-Z)</option>
              <option value="za">Ordem Alfabética (Z-A)</option>
              <option value="maior-nota">Maior Nota</option>
              <option value="menor-nota">Menor Nota</option>
              <option value="recentes">Mais Recentes</option>
              <option value="antigos">Mais Antigos</option>
            </select>
            
            {/* Filtro de Tags */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-zombies-surface border border-neutral-700 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-zombies-115 text-sm"
            >
              <option value="todas">Todas as Tags</option>
              {todasAsTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {/* Filtro de Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zombies-surface border border-neutral-700 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-zombies-115 text-sm"
            >
              <option value="todos">Todos os Status</option>
              <option value="jogado">Jogados</option>
              <option value="nao_jogado">Não Jogados</option>
              <option value="finalizado">Finalizados</option>
            </select>

            {/* Busca por Texto */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-md leading-5 bg-zombies-surface text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-zombies-115 focus:ring-1 focus:ring-zombies-115 transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* Estado de Carregamento (Skeleton) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Cria 8 esqueletos para preencher bem a tela de quem usa PC */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-zombies-surface rounded-lg overflow-hidden border border-neutral-800 flex flex-col animate-pulse">
                
                {/* Skeleton da Imagem */}
                <div className="aspect-video bg-neutral-800/50"></div>
                
                {/* Skeleton do Conteúdo (Textos e Tags) */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  {/* Título */}
                  <div className="h-6 bg-neutral-700/50 rounded w-3/4"></div>
                  
                  {/* Espaço das estrelas */}
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div key={star} className="w-4 h-4 bg-neutral-800/80 rounded-sm"></div>
                    ))}
                  </div>
                  
                  {/* Tags na parte inferior */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <div className="h-6 w-16 bg-neutral-800/80 rounded"></div>
                    <div className="h-6 w-24 bg-neutral-800/80 rounded"></div>
                    <div className="h-6 w-20 bg-neutral-800/80 rounded"></div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mapasFiltrados.map((mapa) => (
              <div key={mapa.id} className="bg-zombies-surface rounded-lg overflow-hidden border border-neutral-800 transition-all duration-300 hover:-translate-y-1 hover:border-zombies-115 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] group cursor-pointer flex flex-col">
                <div className="aspect-video bg-neutral-900 relative group/image overflow-hidden">
                  {mapa.imagem_url ? (
                    <img 
                      src={mapa.imagem_url} 
                      alt={`Capa do mapa ${mapa.nome}`} 
                      // Transição de escala (zoom sutil) na imagem
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm">
                      Sem imagem
                    </div>
                  )}

                  {/* Gradiente de Proteção (vai escurecer suavemente o topo da imagem) */}
                  <div className="absolute top-0 inset-x-0 h-24 bg-linear-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-0" />
                  
                  {/* Container flex no canto superior direito para agrupar o botão e a badge */}
                  <div className="absolute top-2 right-2 flex gap-2 items-center z-10">
                    
                    {/* Botão de Editar */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        setMapaEditando(mapa)
                        setIsModalOpen(true)
                      }}
                      className="bg-black/60 hover:bg-blue-600 text-neutral-400 hover:text-white p-1.5 rounded transition-all backdrop-blur-sm border border-neutral-700/50 hover:border-blue-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      title="Editar mapa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Botão de Excluir */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault(); // Evita conflitos de clique
                        handleDeleteMapa(mapa.id, mapa.nome);
                      }}
                      className="bg-black/60 hover:bg-red-600 text-neutral-400 hover:text-white p-1.5 rounded transition-all backdrop-blur-sm border border-neutral-700/50 hover:border-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      title="Excluir mapa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Badge de Status Interativa */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        handleToggleStatus(mapa.id, mapa.status)
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${
                        mapa.status === 'finalizado' 
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/40' 
                          : mapa.status === 'jogado' 
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/40' 
                          : 'bg-neutral-800/80 hover:bg-neutral-700/90 text-neutral-400 border-neutral-600'
                      }`}
                      title="Clique para alterar o status"
                    >
                      {mapa.status === 'finalizado' ? 'Finalizado' : mapa.status === 'jogado' ? 'Jogado' : 'Não Jogado'}
                    </button>
                    
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-zombies-115 transition-colors" title={mapa.nome}>
                    {mapa.nome}
                  </h3>

                  {/* Sistema visual de estrelas (Só exibe se o mapa tiver nota) */}
                  {mapa.nota ? (
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${
                            mapa.nota && mapa.nota >= star 
                              ? 'text-yellow-500 fill-yellow-500' // Estrela preenchida
                              : 'text-neutral-700'                // Estrela vazia
                          }`} 
                        />
                      ))}
                    </div>
                  ) : (
                    /* Espaçador para manter o layout alinhado quando não tem nota */
                    <div className="h-4 mb-3"></div>
                  )}
                  
                  {mapa.tags && mapa.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {mapa.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded border border-neutral-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {!isLoading && mapasFiltrados.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-500">
                <p className="text-lg">Nenhum mapa encontrado.</p>
                {searchQuery ? (
                  <p className="text-sm">Tente outro termo de busca.</p>
                ) : (
                  <p className="text-sm">Clique em "Novo Mapa" para começar seu acervo.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App