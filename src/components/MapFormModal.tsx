import { useState } from 'react'
import { X, Loader2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Mapa } from '../types'

interface MapFormModalProps {
  isOpen: boolean
  onClose: () => void
  mapaParaEditar?: Mapa | null // Pode receber um mapa para edição
}

export function MapFormModal({ isOpen, onClose, mapaParaEditar }: MapFormModalProps) {
  // Inicializamos os valores DIRETAMENTE pegando do mapaParaEditar (se existir)
  const [link, setLink] = useState(mapaParaEditar?.link_workshop || '')
  const [nome, setNome] = useState(mapaParaEditar?.nome || '')
  const [status, setStatus] = useState(mapaParaEditar?.status || 'nao_jogado')
  const [nota, setNota] = useState(mapaParaEditar?.nota ? String(mapaParaEditar.nota) : '')
  const [tags, setTags] = useState(mapaParaEditar?.tags ? mapaParaEditar.tags.join(', ') : '')
  const [imagemUrl, setImagemUrl] = useState(mapaParaEditar?.imagem_url || '')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingSteam, setIsSearchingSteam] = useState(false)
  const [error, setError] = useState('')

  // O useEffect que existia aqui foi totalmente apagado!

  if (!isOpen) return null

  const handleSteamSearch = async () => {
    if (!link.includes('steamcommunity.com/sharedfiles/filedetails/?id=')) {
      setError('Por favor, insira um link válido da Steam Workshop.')
      return
    }

    setIsSearchingSteam(true)
    setError('')

    try {
      const { data, error } = await supabase.functions.invoke('steam-scraper', {
        body: { url: link }
      })

      if (error) throw error

      if (data.title) setNome(data.title)
      if (data.image) setImagemUrl(data.image)
      
      if (!data.title && !data.image) {
        setError('Página não encontrada ou mapa privado na Steam.')
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao buscar dados na Steam pela Edge Function.')
    } finally {
      setIsSearchingSteam(false)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const dadosMapa = {
      link_workshop: link,
      nome: nome,
      status: status,
      nota: nota ? parseInt(nota) : null,
      tags: tagsArray,
      imagem_url: imagemUrl,
    }

    // Removemos o 'let' e o if/else longo.
    // Usamos um ternário (?) para decidir qual chamada fazer diretamente em uma 'const'.
    const { error: supabaseError } = mapaParaEditar
      ? await supabase.from('mapas').update(dadosMapa).eq('id', mapaParaEditar.id)
      : await supabase.from('mapas').insert([dadosMapa])

    setIsLoading(false)

    if (supabaseError) {
      if (supabaseError.code === '23505') {
        setError('Este link da Workshop já está cadastrado!')
      } else {
        setError('Erro ao salvar o mapa. Verifique os dados.')
      }
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zombies-surface border border-neutral-800 rounded-lg w-full max-w-lg shadow-2xl my-8">
        
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          {/* NOVO: Muda o título se estiver editando */}
          <h2 className="text-lg font-bold text-white">
            {mapaParaEditar ? 'Editar Mapa' : 'Adicionar Novo Mapa'}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* O formulário continua idêntico daqui para baixo */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="w-full h-40 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center overflow-hidden relative">
            {imagemUrl ? (
              <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-neutral-600">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">Sem imagem</span>
              </div>
            )}
            {isSearchingSteam && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-zombies-115 animate-spin" />
              </div>
            )}
          </div>

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
              <button 
                type="button" 
                onClick={handleSteamSearch}
                disabled={isSearchingSteam || !link}
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSearchingSteam ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
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
                <option value="nao_jogado">Não Jogado</option>
                <option value="jogado">Jogado</option>
                <option value="finalizado">Finalizado</option>
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
              {/* Muda o texto do botão */}
              {isLoading ? 'Salvando...' : (mapaParaEditar ? 'Atualizar Mapa' : 'Salvar Mapa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}