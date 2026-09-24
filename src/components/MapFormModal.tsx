import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X } from 'lucide-react'

interface MapFormModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MapFormModal({ isOpen, onClose }: MapFormModalProps) {
    // Estados do formulário
    const [link, setLink] = useState('')
    const [nome, setNome] = useState('')
    const [status, setStatus] = useState('false') // Usando string pro select, convertemos no submit
    const [nota, setNota] = useState('')
    const [tags, setTags] = useState('')

    // Estados de UI
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    
    if (!isOpen) return null

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault() // Evita que a página recarregue
        setIsLoading(true)
        setError('')

        // Limpeza das tags: transforma "Challenge, Boss" em ['Challenge', 'Boss']
        const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

        // Prepara os dados para o Supabase
        const novoMapa = {
        link_workshop: link,
        nome: nome,
        status: status === 'true', // Converte a string do select para boolean
        nota: nota ? parseInt(nota) : null,
        tags: tagsArray,
        }

        // Envia para a tabela 'mapas'
        const { error: supabaseError } = await supabase
        .from('mapas')
        .insert([novoMapa])

        setIsLoading(false)

        if (supabaseError) {
        console.error(supabaseError)
        // Se o erro for de link duplicado (aquela restrição UNIQUE que criamos)
        if (supabaseError.code === '23505') {
            setError('Este link da Workshop já está cadastrado!')
        } else {
            setError('Erro ao salvar o mapa. Verifique os dados.')
        }
        return
        }

        // Se deu certo, limpa os campos e fecha o modal
        setLink('')
        setNome('')
        setStatus('false')
        setNota('')
        setTags('')
        onClose()
    }

    return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zombies-surface border border-neutral-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
        
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Adicionar Novo Mapa</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Exibe erro se houver */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Link da Steam Workshop *</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
              />
              <button type="button" className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
                Buscar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Nome do Mapa *</label>
            <input 
              type="text" 
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
              >
                <option value="false">Não Jogado</option>
                <option value="true">Jogado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Nota (1 a 5)</label>
              <input 
                type="number" 
                min="1" max="5"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ex: 5"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Tags (separadas por vírgula)</label>
            <input 
              type="text" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: Challenge, Easter Egg, Boss Fight"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-zombies-115 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? 'Salvando...' : 'Salvar Mapa'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}