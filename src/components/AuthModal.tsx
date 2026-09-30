import { useState } from 'react'
import { X, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciais inválidas. Tente novamente.')
    } else {
      onClose() // Fecha o modal se o login der certo
    }
    
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zombies-surface border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LogIn className="w-5 h-5 text-zombies-115" />
            Acesso Restrito
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zombies-115 text-black font-bold px-4 py-2 rounded-md hover:bg-cyan-400 transition-colors disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}