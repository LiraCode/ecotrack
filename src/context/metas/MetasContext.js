'use client'
import React, { createContext, useState, useContext, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { checkExpiredScores } from '@/services/scoreService'
import { getAuthToken } from '@/services/authService'

const MetasContext = createContext()

export const MetasProvider = ({ children }) => {
  const { toast } = useToast()
  const [meusPontos, setMeusPontos] = useState(0)
  const [ranking, setRanking] = useState([])
  const [desafiosAtivos, setDesafiosAtivos] = useState([])
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([])
  const [desafiosExpirados, setDesafiosExpirados] = useState([])
  const [desafiosDisponiveis, setDesafiosDisponiveis] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('andamento')
  const [pendingAlert, setPendingAlert] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Verificar scores expirados ao carregar
  useEffect(() => {
    const verifyExpiredScores = async () => {
      try {
        const result = await checkExpiredScores()
        if (result.success && result.expiredCount > 0) {
          toast({
            title: "Metas expiradas",
            description: `${result.expiredCount} meta(s) expirou(aram) e foi(ram) movida(s) para a aba "Expirados"`,
            variant: "warning"
          })
        }
      } catch (error) {
        console.error("Erro ao verificar scores expirados:", error)
      }
    }

    verifyExpiredScores()
  }, [toast])

  // Função para participar de um desafio
  const participarDesafio = async (desafioId) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Não foi possível obter o token de autenticação")
      }
      
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goalId: desafioId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao participar do desafio')
      }
      
      const data = await response.json()
      
      // Atualizar listas de desafios
      const desafio = desafiosDisponiveis.find(d => d.id === desafioId)
      if (desafio) {
        // Adicionar aos desafios ativos com o ID do score retornado pela API
        setDesafiosAtivos(prev => [...prev, {
          ...desafio,
          id: data.score._id,
          goalId: desafioId,
          progresso: 0,
          pontosGanhos: 0
        }])
        
        // Remover dos desafios disponíveis
        setDesafiosDisponiveis(prev => prev.filter(d => d.id !== desafioId))
        
        toast({
          title: "Sucesso!",
          description: `Você está participando do desafio "${desafio.nome}"`,
          variant: "success"
        })
      }
      
      return data
    } catch (error) {
      console.error("Erro ao participar do desafio:", error)
      toast({
        title: "Erro",
        description: `Falha ao participar do desafio: ${error.message}`,
        variant: "destructive"
      })
      throw error
    }
  }

  // Função para concluir um desafio
  const concluirDesafio = async (desafioId) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Não foi possível obter o token de autenticação")
      }
      
      const response = await fetch(`/api/scores/${desafioId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao concluir o desafio')
      }
      
      const data = await response.json()
      
      // Atualizar listas de desafios
      const desafio = desafiosAtivos.find(d => d.id === desafioId)
      if (desafio) {
        // Adicionar aos desafios concluídos
        setDesafiosConcluidos(prev => [...prev, {
          ...desafio,
          pontosGanhos: data.earnedPoints || desafio.pontos
        }])
        
        // Remover dos desafios ativos
        setDesafiosAtivos(prev => prev.filter(d => d.id !== desafioId))
        
        // Atualizar pontos totais
        setMeusPontos(prev => prev + (data.earnedPoints || desafio.pontos))
        
        toast({
          title: "Parabéns!",
          description: `Você concluiu o desafio "${desafio.nome}" e ganhou ${data.earnedPoints || desafio.pontos} pontos!`,
          variant: "success"
        })
      }
      
      return data
    } catch (error) {
      console.error("Erro ao concluir desafio:", error)
      toast({
        title: "Erro",
        description: `Falha ao concluir o desafio: ${error.message}`,
        variant: "destructive"
      })
      throw error
    }
  }

  // Função para remover um desafio
  const removerDesafio = async (desafioId) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Não foi possível obter o token de autenticação")
      }
      
      const response = await fetch(`/api/scores/${desafioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao remover o desafio')
      }
      
      // Remover o desafio da lista apropriada
      setDesafiosAtivos(prev => prev.filter(d => d.id !== desafioId))
      setDesafiosConcluidos(prev => prev.filter(d => d.id !== desafioId))
      setDesafiosExpirados(prev => prev.filter(d => d.id !== desafioId))
      
      // Incrementar o refreshTrigger para forçar o recarregamento dos dados
      setRefreshTrigger(prev => prev + 1)
      
      toast({
        title: "Desafio removido",
        description: "O desafio foi removido da sua lista",
        variant: "success"
      })
      
      return true
    } catch (error) {
      console.error("Erro ao remover desafio:", error)
      toast({
        title: "Erro",
        description: `Falha ao remover o desafio: ${error.message}`,
        variant: "destructive"
      })
      throw error
    }
  }

  // Função para atualizar o progresso de um desafio
  const atualizarProgresso = async (desafioId, novoProgresso) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Não foi possível obter o token de autenticação")
      }
      
      const response = await fetch(`/api/scores/${desafioId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress: novoProgresso })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao atualizar o progresso')
      }
      
      const data = await response.json()
      
      // Atualizar o progresso no estado
      setDesafiosAtivos(prev => prev.map(d => 
        d.id === desafioId ? { ...d, progresso: novoProgresso } : d
      ))
      
      toast({
        title: "Progresso atualizado",
        description: "O progresso do desafio foi atualizado com sucesso",
        variant: "success"
      })
      
      return data
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error)
      toast({
        title: "Erro",
        description: `Falha ao atualizar o progresso: ${error.message}`,
        variant: "destructive"
      })
      throw error
    }
  }

  return (
    <MetasContext.Provider value={{
      meusPontos,
      ranking,
      abaAtiva,
      setAbaAtiva,
      desafiosAtivos,
      desafiosConcluidos,
      desafiosExpirados,
      desafiosDisponiveis,
      concluirDesafio,
      removerDesafio,
      atualizarProgresso,
      participarDesafio,
      setMeusPontos,
      setRanking,
      setDesafiosAtivos,
      setDesafiosConcluidos,
      setDesafiosExpirados,
      setDesafiosDisponiveis,
      refreshTrigger
    }}>
      {children}
    </MetasContext.Provider>
  )
}
export const useMetasContext = () => {
  const context = useContext(MetasContext)
  if (!context) {
    throw new Error('useMetasContext must be used within a MetasProvider')
  }
  return context
}

export { MetasContext }