import { useState } from 'react'
import { Header } from './components/Header'
import { Search } from 'lucide-react'
import { MapFormModal } from './components/MapFormModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <div className="min-h-screen bg-zombies-background">
      <Header onNewMap={() => setIsModalOpen(true)}/>
      <MapFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Barra de Ferramentas (Filtros e Busca) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold text-white">Meus Mapas</h2>
          
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

        {/* Grid de Mapas (Galeria) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* === CARD MOCK (Exemplo visual) === */}
          <div className="bg-zombies-surface rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-colors group cursor-pointer">
            {/* Imagem (Placeholder) */}
            <div className="aspect-video bg-neutral-900 relative">
              <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                Sem imagem original
              </div>
              {/* Badge de Status */}
              <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                Jogado
              </div>
            </div>
            
            {/* Informações */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-white mb-2 truncate group-hover:text-zombies-115 transition-colors">
                Leviathan
              </h3>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded border border-neutral-700">
                  Easter Egg
                </span>
                <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded border border-neutral-700">
                  Boss Fight
                </span>
              </div>
            </div>
          </div>
          {/* === FIM DO CARD MOCK === */}

        </div>
      </main>
    </div>
  )
}

export default App