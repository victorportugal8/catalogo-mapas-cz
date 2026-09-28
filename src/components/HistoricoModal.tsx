import { useState, useEffect, useCallback } from 'react'
import { X, Save, History as HistoryIcon, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Mapa, Historico } from '../types'

interface HistoricoModalProps {
  isOpen: boolean
  onClose: () => void
  mapa: Mapa | null
}

export function HistoricoModal({ isOpen, onClose, mapa }: HistoricoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados da lista de histórico
  const [historicoLista, setHistoricoLista] = useState<Historico[]>([])
  const [isLoadingLista, setIsLoadingLista] = useState(true)
  
  // Estados do formulário
  const [dataPartida, setDataPartida] = useState(new Date().toISOString().split('T')[0])
  const [jogadores, setJogadores] = useState('')
  const [roundAlcancado, setRoundAlcancado] = useState('')
  const [resultado, setResultado] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Busca o histórico sempre que o modal abrir
  const carregarHistorico = useCallback(async () =>{
    if (!mapa) return
    const { data, error } = await supabase
      .from('historico')
      .select('*')
      .eq('mapa_id', mapa.id)
      .order('data_partida', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (!error && data) setHistoricoLista(data)
    
    setIsLoadingLista(false)
  }, [mapa]) // só recria a função caso o mapa mude

  useEffect(() => {
    const carregarDadosExternos = async () => {
      if (isOpen) await carregarHistorico()
    }
    carregarDadosExternos()
  }, [isOpen, carregarHistorico])

  // Deleta um registro específico
  const handleDeleteRegistro = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir esse registro do histórico?")) return

    const { error } = await supabase.from('historico').delete().eq('id', id)
    if (!error) setHistoricoLista(prev => prev.filter(item => item.id !== id))
  }

  if (!isOpen || !mapa) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const novoRegistro = {
      mapa_id: mapa.id,
      data_partida: dataPartida,
      jogadores: jogadores || null,
      round_alcancado: roundAlcancado ? parseInt(roundAlcancado) : null,
      resultado: resultado || null,
      observacoes: observacoes || null,
    }

    const { error } = await supabase.from('historico').insert([novoRegistro])

    setIsSubmitting(false)

    if (error) {
      console.error('Erro ao salvar histórico:', error)
      alert('Erro ao registrar a partida.')
    } else {
      // Limpa os campos após salvar
      setJogadores('')
      setRoundAlcancado('')
      setResultado('')
      setObservacoes('')
      // Atualiza a lista exibida na tela
      carregarHistorico()
      // Quando tiver a lista de histórico neste modal, vai atualizá-la aqui.
      // Por enquanto, apenas fecha e avisa que deu certo.
      alert('Partida registrada com sucesso!')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zombies-surface border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800 sticky top-0 bg-zombies-surface z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-zombies-115" />
              Diário de Sobrevivência
            </h2>
            <p className="text-sm text-neutral-400 mt-1">Registrando partida em: <span className="text-zombies-115 font-semibold">{mapa.nome}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Corpo do Modal (Formulário) */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Data da Partida */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Data da Partida</label>
                <input 
                  type="date"
                  required
                  value={dataPartida}
                  onChange={(e) => setDataPartida(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115"
                />
              </div>

              {/* Round Alcançado */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Round Alcançado</label>
                <input 
                  type="number"
                  min="1"
                  placeholder="Ex: 35"
                  value={roundAlcancado}
                  onChange={(e) => setRoundAlcancado(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115 placeholder-neutral-600"
                />
              </div>
            </div>

            {/* Jogadores (Campo de texto simples) */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Esquadrão (Jogadores)</label>
              <input 
                type="text"
                placeholder="Ex: Eu, Gabriel, Lucas"
                value={jogadores}
                onChange={(e) => setJogadores(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115 placeholder-neutral-600"
              />
            </div>

            {/* Resultado */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Resultado da Missão</label>
              <input 
                type="text"
                placeholder="Ex: Game Over, Easter Egg Completo, Crash no servidor..."
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115 placeholder-neutral-600"
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Observações (Opcional)</label>
              <textarea 
                rows={3}
                placeholder="Detalhes da partida, táticas usadas, onde morreram..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zombies-115 placeholder-neutral-600 resize-none"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-zombies-115 text-black font-bold px-6 py-2 rounded-md hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Registrar Partida
                  </>
                )}
              </button>
            </div>
          </form>
          {/* Linha do Tempo / Lista de Partidas */}
          <div className="mt-8 pt-8 border-t-2 border-dashed border-neutral-800">
            <h3 className="text-lg font-bold text-white mb-4">Partidas Anteriores</h3>
            
            {isLoadingLista ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-zombies-115 animate-spin" />
              </div>
            ) : historicoLista.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 bg-neutral-900/50 rounded-lg border border-neutral-800">
                Nenhuma partida registrada para este mapa ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {historicoLista.map((registro) => (
                  <div key={registro.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4 justify-between group hover:border-neutral-700 transition-colors">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-neutral-400 font-mono">
                          {new Date(registro.data_partida).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                        {registro.round_alcancado && (
                          <span className="bg-zombies-115/10 text-zombies-115 text-xs px-2 py-0.5 rounded font-bold">
                            Round {registro.round_alcancado}
                          </span>
                        )}
                      </div>
                      
                      {registro.resultado && (
                        <p className="text-white font-medium text-lg mb-1">{registro.resultado}</p>
                      )}
                      
                      {registro.jogadores && (
                        <p className="text-sm text-neutral-300">
                          <span className="text-neutral-500 mr-1">Esquadrão:</span> 
                          {registro.jogadores}
                        </p>
                      )}
                      
                      {registro.observacoes && (
                        <p className="text-sm text-neutral-400 mt-2 italic bg-black/20 p-2 rounded border-l-2 border-neutral-700">
                          "{registro.observacoes}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-start sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteRegistro(registro.id)}
                        className="text-neutral-500 hover:text-red-500 p-2 rounded hover:bg-neutral-800 transition-colors"
                        title="Excluir registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}