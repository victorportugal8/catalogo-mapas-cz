import { Skull, Plus, LogIn, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface HeaderProps{
  onNewMap: () => void
  onLogin: () => void
  onLogout: () => void
  user: User | null
}

export function Header({ onNewMap, onLogin, onLogout, user }: HeaderProps) {
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
        {user ? (
          <div className="flex items-center gap-3">
            <button onClick={onNewMap} className="bg-zombies-115 text-black font-bold px-4 py-2 rounded-md hover:bg-cyan-400 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Novo Mapa</span>
            </button>
            <button onClick={onLogout} className="bg-neutral-800 text-white p-2 rounded-md hover:bg-red-600 transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={onLogin} className="bg-neutral-800 text-white font-bold px-4 py-2 rounded-md hover:bg-neutral-700 transition-colors flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Login Admin
          </button>
        )}
      </div>
    </header>
  )
}