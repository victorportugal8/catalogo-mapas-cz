import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { MapFormModal } from './components/MapFormModal'
import { Search, Loader2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import type { Mapa } from './types/'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapas, setMapas] = useState<Mapa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Função pura: apenas vai no Supabase e devolve os dados (não mexe nos states)
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

  // 2. useEffect seguro: avisa ao linter que o estado só muda no callback (.then)
  useEffect(() => {
    obterMapasDoBanco().then((dados) => {
      setMapas(dados)
      setIsLoading(false)
    });
  }, []);

  // 3. Atualização após fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsLoading(true) // Mostra o spinner de novo enquanto busca
    
    obterMapasDoBanco().then((dados) => {
      setMapas(dados)
      setIsLoading(false)
    })
  }

  return (
    <div className="min-h-screen bg-zombies-background">
      <Header onNewMap={() => setIsModalOpen(true)} />

      <MapFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
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
            {mapas.map((mapa) => (
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
                  
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                    mapa.status 
                      ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                      : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
                  }`}>
                    {mapa.status ? 'Jogado' : 'Não Jogado'}
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
            
            {!isLoading && mapas.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-500">
                <p className="text-lg">Nenhum mapa encontrado.</p>
                <p className="text-sm">Clique em "Novo Mapa" para começar seu acervo.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App