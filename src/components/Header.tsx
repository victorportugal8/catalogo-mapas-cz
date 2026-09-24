import { Skull, Plus } from 'lucide-react'

interface HeaderProps{
  onNewMap: () => void
}

export function Header({ onNewMap }: HeaderProps) {
  return (
    <header className="bg-zombies-surface border-b border-neutral-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo e Título */}
        <div className="flex items-center gap-3">
          <Skull className="text-zombies-accent w-8 h-8" />
          <h1 className="text-xl font-bold tracking-wider text-white uppercase">
            Catálogo <span className="text-zombies-115">Custom Zombies</span>
          </h1>
        </div>

        {/* Botão de Ação */}
        <button onClick={onNewMap} className="bg-zombies-accent hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 cursor-pointer">
          <Plus className="w-5 h-5" />
          Novo Mapa
        </button>
        
      </div>
    </header>
  )
}