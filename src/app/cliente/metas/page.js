'use client'
import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import MetasHeader from '../../../components/Metas/MetasHeader'
import RankingSection from '../../../components/Metas/RankingSection'
import MetasTabs from '../../../components/Metas/MetasTabs'
import DesafiosDisponiveis from '../../../components/Metas/DesafiosDisponiveis'
import { MetasProvider } from '@/context/metas/MetasContext'
import { useMetasContext } from '@/context/metas/MetasContext'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { getAuthToken } from '@/services/authService'
import AppLayout from '@/components/Layout/page'

const MetasPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AppLayout>
    <MetasProvider>
      <main className={`flex-1 p-1 mt-5 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} overflow-auto`}>
        <Container maxWidth="lg" className="space-y-8">
          <MetasContent />
        </Container>
      </main>
    </MetasProvider>
    </AppLayout>
  )
}

// Componente que utiliza o contexto
const MetasContent = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const {
    meusPontos,
    ranking,
    abaAtiva,
    setAbaAtiva,
    desafiosAtivos,
    desafiosConcluidos,
    desafiosExpirados,
    concluirDesafio,
    removerDesafio,
    atualizarProgresso,
    desafiosDisponiveis,
    participarDesafio,
    setMeusPontos,
    setRanking,
    setDesafiosAtivos,
    setDesafiosConcluidos,
    setDesafiosExpirados,
    setDesafiosDisponiveis
  } = useMetasContext()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obter token de autenticação
        const token = await getAuthToken()
        if (!token) {
          toast({
            title: "Erro de autenticação",
            description: "Você precisa estar logado para acessar as metas",
            variant: "destructive"
          })
          return
        }

        // Buscar metas ativas do usuário
        //console.log("Buscando scores ativos...")
        const scoresResponse = await fetch('/api/scores?status=active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!scoresResponse.ok) {
          throw new Error('Falha ao buscar metas ativas')
        }
        
        const scoresData = await scoresResponse.json()
        //console.log("Scores ativos recebidos:", scoresData)
        
        // Buscar metas concluídas
        //console.log("Buscando scores concluídos...")
        const completedScoresResponse = await fetch('/api/scores?status=completed', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!completedScoresResponse.ok) {
          throw new Error('Falha ao buscar metas concluídas')
        }
        
        const completedScoresData = await completedScoresResponse.json()
        //console.log("Scores concluídos recebidos:", completedScoresData)
        
        // Buscar metas expiradas
        //console.log("Buscando scores expirados...")
        const expiredScoresResponse = await fetch('/api/scores?status=expired', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!expiredScoresResponse.ok) {
          throw new Error('Falha ao buscar metas expiradas')
        }
        
        const expiredScoresData = await expiredScoresResponse.json()
        //console.log("Scores expirados recebidos:", expiredScoresData)
        
        // Buscar metas disponíveis (que o usuário ainda não participa)
        //console.log("Buscando metas disponíveis...")
        const availableGoalsResponse = await fetch('/api/goals?status=active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!availableGoalsResponse.ok) {
          throw new Error('Falha ao buscar metas disponíveis')
        }
        
        const availableGoalsData = await availableGoalsResponse.json()
        //console.log("Metas disponíveis recebidas:", availableGoalsData)
        
        // Buscar ranking
        //console.log("Buscando ranking...")
        const rankingResponse = await fetch("/api/scores/ranking", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!rankingResponse.ok) {
          throw new Error('Falha ao buscar ranking')
        }
        
        const rankingData = await rankingResponse.json()
        //console.log("Ranking recebido:", rankingData)
        
        // Verificar se os dados têm a estrutura esperada
        if (!rankingData.ranking || !Array.isArray(rankingData.ranking)) {
          console.error("Formato de ranking inválido:", rankingData)
          throw new Error('Formato de ranking inválido')
        }
        
        // Formatar dados para o formato esperado pelos componentes
        const ativos = Array.isArray(scoresData.scores) ? scoresData.scores.map(score => ({
          id: score._id,
          nome: score.goalId?.title || 'Meta sem título',
          descricao: score.goalId?.description || 'Sem descrição',
          dataInicio: new Date(score.goalId?.initialDate || Date.now()),
          dataTermino: new Date(score.goalId?.validUntil || Date.now()),
          progresso: score.currentValue || 0,
          total: score.goalId?.targetValue || 100,
          pontos: score.goalId?.points || 0,
          pontosGanhos: score.earnedPoints || 0
        })) : []
        
        const concluidos = Array.isArray(completedScoresData.scores) ? completedScoresData.scores.map(score => ({
          id: score._id,
          nome: score.goalId?.title || 'Meta sem título',
          descricao: score.goalId?.description || 'Sem descrição',
          dataInicio: new Date(score.goalId?.initialDate || Date.now()),
          dataTermino: new Date(score.goalId?.validUntil || Date.now()),
          progresso: score.currentValue || 0,
          total: score.goalId?.targetValue || 100,
          pontos: score.goalId?.points || 0,
          pontosGanhos: score.earnedPoints || 0
        })) : []
        
        const expirados = Array.isArray(expiredScoresData.scores) ? expiredScoresData.scores.map(score => ({
          id: score._id,
          nome: score.goalId?.title || 'Meta sem título',
          descricao: score.goalId?.description || 'Sem descrição',
          dataInicio: new Date(score.goalId?.initialDate || Date.now()),
          dataTermino: new Date(score.goalId?.validUntil || Date.now()),
          progresso: score.currentValue || 0,
          total: score.goalId?.targetValue || 100,
          pontos: score.goalId?.points || 0,
          pontosGanhos: score.earnedPoints || 0
        })) : []
        
        // Filtrar metas disponíveis (que o usuário ainda não participa)
        const participatingGoalIds = [
          ...(Array.isArray(scoresData.scores) ? scoresData.scores : []), 
          ...(Array.isArray(completedScoresData.scores) ? completedScoresData.scores : []), 
          ...(Array.isArray(expiredScoresData.scores) ? expiredScoresData.scores : [])
        ].map(score => score.goalId?._id).filter(Boolean)
        
        const disponiveis = Array.isArray(availableGoalsData.goals) ? availableGoalsData.goals
          .filter(goal => !participatingGoalIds.includes(goal._id))
          .map(goal => ({
            id: goal._id,
            nome: goal.title || 'Meta sem título',
            descricao: goal.description || 'Sem descrição',
            dataInicio: new Date(goal.initialDate || Date.now()),
            dataTermino: new Date(goal.validUntil || Date.now()),
            total: goal.targetValue || 100,
            pontos: goal.points || 0
          })) : []
        
        // Calcular pontos totais do usuário
        const totalPontos = concluidos.reduce((total, meta) => total + (meta.pontosGanhos || 0), 0)
        
        // Formatar ranking
        const formattedRanking = rankingData.ranking.map((item, index) => ({
          posicao: index + 1,
          nome: item.name || 'Usuário',
          pontos: item.totalPoints || 0,
          clientId: item.clientId || ''
        }))
        
        //console.log("Dados formatados:")
        //console.log("Ativos:", ativos)
        //console.log("Concluídos:", concluidos)
        //console.log("Expirados:", expirados)
        //console.log("Disponíveis:", disponiveis)
        //console.log("Ranking formatado:", formattedRanking)
        
        // Atualizar o estado do contexto
        setMeusPontos(totalPontos)
        setRanking(formattedRanking)
        setDesafiosAtivos(ativos)
        setDesafiosConcluidos(concluidos)
        setDesafiosExpirados(expirados)
        setDesafiosDisponiveis(disponiveis)
        
      } catch (error) {
        console.error('Erro ao buscar dados de metas:', error)
        toast({
          title: "Erro",
          description: `Falha ao carregar metas: ${error.message}`,
          variant: "destructive"
        })
      }
    }
    
    fetchData()
  }, [setDesafiosAtivos, setDesafiosConcluidos, setDesafiosDisponiveis, setDesafiosExpirados, setMeusPontos, setRanking, toast, user])

  // Verificar se os dados estão disponíveis
  //console.log("Renderizando componentes com os seguintes dados:")
  //console.log("Ranking:", ranking)
  //console.log("Desafios ativos:", desafiosAtivos)
  //console.log("Desafios concluídos:", desafiosConcluidos)
  //console.log("Desafios expirados:", desafiosExpirados)
  //console.log("Desafios disponíveis:", desafiosDisponiveis)

  return (
    <>
      <MetasHeader meusPontos={meusPontos} />
      <RankingSection ranking={ranking} />
      <MetasTabs 
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        desafiosAtivos={desafiosAtivos}
        desafiosConcluidos={desafiosConcluidos}
        desafiosExpirados={desafiosExpirados}
        removerDesafio={removerDesafio}
      />
      <DesafiosDisponiveis 
        desafiosDisponiveis={desafiosDisponiveis} 
        participarDesafio={participarDesafio} 
      />
    </>
  )
}

export default MetasPage