import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { MapFormModal } from './components/MapFormModal'
import { Search, Loader2, Trash2, Edit2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import type { Mapa } from './types/'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mapas, setMapas] = useState<Mapa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapaEditando, setMapaEditando] = useState<Mapa | null>(null)

  // Gerenciamento do estado de busca
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filtragem de mapas com base na busca
  const mapasFiltrados = mapas.filter((mapa) => {
    const termoBusca = searchQuery.toLowerCase()
    const nomeBate = mapa.nome.toLowerCase().includes(termoBusca)
    const tagBate = mapa.tags?.some(tag => tag.toLowerCase().includes(termoBusca))
    
    return nomeBate || tagBate
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            Meus Mapas
            <span className="text-sm bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">
              {mapas.length}
            </span>
          </h2>
          
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar mapa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-md leading-5 bg-zombies-surface text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-zombies-115 focus:ring-1 focus:ring-zombies-115 transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-zombies-115 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mapasFiltrados.map((mapa) => (
              <div key={mapa.id} className="bg-zombies-surface rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-colors group cursor-pointer flex flex-col">
                
                <div className="aspect-video bg-neutral-900 relative">
                  {mapa.imagem_url ? (
                    <img 
                      src={mapa.imagem_url} 
                      alt={`Capa do mapa ${mapa.nome}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm">
                      Sem imagem
                    </div>
                  )}
                  
                  {/* Container flex no canto superior direito para agrupar o botão e a badge */}
                  <div className="absolute top-2 right-2 flex gap-2 items-center">
                    
                    {/* Botão de Editar */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setMapaEditando(mapa);
                        setIsModalOpen(true);
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

                    {/* Badge de Status (Já existia, só movemos para dentro desta div flex) */}
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                      mapa.status 
                        ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                        : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
                    }`}>
                      {mapa.status ? 'Jogado' : 'Não Jogado'}
                    </div>
                    
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-zombies-115 transition-colors" title={mapa.nome}>
                    {mapa.nome}
                  </h3>
                  
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