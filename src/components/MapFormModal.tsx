import { X } from 'lucide-react'

interface MapFormModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MapFormModal({ isOpen, onClose }: MapFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zombies-surface border border-neutral-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Adicionar Novo Mapa</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form className="p-4 space-y-4">
          
          {/* Link da Workshop */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Link da Steam Workshop
            </label>
            <div className="flex gap-2">
              <input 
                type="url" 
                placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
              />
              <button type="button" className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
                Buscar
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Coloque o link para buscar nome e imagem automaticamente.</p>
          </div>

          {/* Nome do Mapa */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Nome do Mapa</label>
            <input 
              type="text" 
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
            />
          </div>

          {/* Status e Nota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
              <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115">
                <option value="false">Não Jogado</option>
                <option value="true">Jogado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Nota (1 a 5)</label>
              <input 
                type="number" 
                min="1" max="5"
                placeholder="Ex: 5"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Tags (separadas por vírgula)</label>
            <input 
              type="text" 
              placeholder="Ex: Challenge, Easter Egg, Boss Fight"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
            />
          </div>

          {/* Botão de Salvar */}
          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-zombies-115 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded-md transition-colors"
            >
              Salvar Mapa
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}