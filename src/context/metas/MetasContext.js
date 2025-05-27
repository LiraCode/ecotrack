'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'

const MetasContext = createContext({
  desafiosAtivos: [],
  desafiosConcluidos: [],
  desafiosExpirados: [],
  desafiosDisponiveis: [],
  meusPontos: 0,
  ranking: [],
  loading: true,
  abaAtiva: 'andamento',
  setAbaAtiva: () => {},
  participarDesafio: async () => {},
  removerDesafio: async () => {},
  atualizarProgresso: async () => {},
  concluirDesafio: async () => {}
})

export const useMetasContext = () => useContext(MetasContext)

export const MetasProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast()
  
  // Estado para armazenar os dados
  const [meusPontos, setMeusPontos] = useState(0)
  const [ranking, setRanking] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('andamento')
  const [desafiosAtivos, setDesafiosAtivos] = useState([])
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([])
  const [desafiosExpirados, setDesafiosExpirados] = useState([])
  const [desafiosDisponiveis, setDesafiosDisponiveis] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Função para buscar os desafios do usuário
  const fetchUserChallenges = useCallback(async () => {
    if (!user?.accessToken) return;

    try {
      setLoading(true);
      
      // Verificar se é um usuário admin
      const adminResponse = await fetch('/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      const isAdmin = adminResponse.ok;
      
      // Se for admin, não buscar pontos nem ranking
      if (isAdmin) {
        setMeusPontos(0);
        setRanking([]);
        return;
      }
      
      // Buscar scores (desafios) do usuário
      const scoresResponse = await fetch('/api/scores', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (!scoresResponse.ok) {
        throw new Error('Falha ao buscar scores');
      }
      
      const scoresData = await scoresResponse.json();
      
      console.log('Scores recebidos:', scoresData.scores);
      
      // Separar os desafios por status
      const ativos = scoresData.scores.filter(score => score.status === 'active') || [];
      const concluidos = scoresData.scores.filter(score => score.status === 'completed') || [];
      const expirados = scoresData.scores.filter(score => score.status === 'expired') || [];
      
      console.log('Desafios separados:', {
        ativos: ativos.length,
        concluidos: concluidos.length,
        expirados: expirados.length
      });
      
      // Atualizar estados
      setDesafiosAtivos(ativos);
      setDesafiosConcluidos(concluidos);
      setDesafiosExpirados(expirados);
      
      // Buscar desafios disponíveis
      const goalsResponse = await fetch('/api/goals?status=active', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (!goalsResponse.ok) {
        throw new Error('Falha ao buscar metas disponíveis');
      }
      
      const goalsData = await goalsResponse.json();
      
      // Filtrar metas que o usuário ainda não participa
      const activeScoreIds = [...ativos, ...concluidos, ...expirados].map(score => score.goalId._id);
      const availableGoals = goalsData.goals.filter(goal => 
        !activeScoreIds.includes(goal._id)
      );
      
      console.log('Metas disponíveis:', {
        total: goalsData.goals.length,
        disponiveis: availableGoals.length
      });
      
      setDesafiosDisponiveis(availableGoals);
      
      // Buscar pontuação do usuário
      const pointsResponse = await fetch('/api/scores/points', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        console.log('Pontos recebidos:', pointsData);
        setMeusPontos(pointsData.points || 0);
      } else {
        console.error('Erro ao buscar pontos:', await pointsResponse.text());
      }
      
      // Buscar ranking
      const rankingResponse = await fetch('/api/scores/ranking', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (rankingResponse.ok) {
        const rankingData = await rankingResponse.json();
        console.log('Dados do ranking:', rankingData);
        setRanking(rankingData.ranking || []);
      } else {
        console.error('Erro ao buscar ranking:', await rankingResponse.text());
      }
      
    } catch (error) {
      console.error('Erro ao buscar desafios:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar seus desafios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Carregar dados quando o componente montar ou quando houver refresh
  useEffect(() => {
    fetchUserChallenges();
  }, [fetchUserChallenges, refreshTrigger]);

  const participarDesafio = async (goalId) => {
    try {
      if (!user?.accessToken) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para participar de desafios",
          variant: "destructive"
        });
        return false;
      }
    
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goalId })
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.message || "Não foi possível participar deste desafio.",
          variant: "destructive"
        });
        return false;
      }
    
      toast({
        title: "Sucesso!",
        description: "Você está participando deste desafio agora.",
        variant: "success"
      });
    
      refreshData();
      return true;
    } catch (error) {
      console.error("Erro ao participar do desafio:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao participar do desafio.",
        variant: "destructive"
      });
      return false;
    }
  };

  const removerDesafio = async (scoreId) => {
    try {
      if (!user?.accessToken) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para remover desafios",
          variant: "destructive"
        });
        return false;
      }
    
      const response = await fetch(`/api/scores/${scoreId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.message || "Não foi possível remover este desafio.",
          variant: "destructive"
        });
        return false;
      }
    
      toast({
        title: "Sucesso!",
        description: "Desafio removido com sucesso.",
        variant: "success"
      });
    
      refreshData();
      return true;
    } catch (error) {
      console.error("Erro ao remover desafio:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o desafio.",
        variant: "destructive"
      });
      return false;
    }
  };

  const atualizarProgresso = useCallback(async (scoreId, wasteId, quantidade) => {
    try {
      if (!user?.accessToken) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para atualizar o progresso",
          variant: "destructive"
        });
        return false;
      }

      const response = await fetch(`/api/scores/${scoreId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          wasteId,
          quantity: quantidade
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar progresso');
      }

      toast({
        title: "Sucesso!",
        description: "Progresso atualizado com sucesso",
      });

      refreshData();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar progresso",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, refreshData]);

  const concluirDesafio = useCallback(async (scoreId) => {
    try {
      if (!user?.accessToken) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para concluir desafios",
          variant: "destructive"
        });
        return false;
      }

      const response = await fetch(`/api/scores/${scoreId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao concluir desafio');
      }

      // Atualizar estados localmente
      setDesafiosAtivos(prev => prev.filter(d => d._id !== scoreId));
      setDesafiosConcluidos(prev => [...prev, data.score]);

      toast({
        title: "Parabéns!",
        description: `Desafio concluído com sucesso! Você ganhou ${data.earnedPoints || 0} pontos.`,
      });

      // Atualizar pontuação
      setMeusPontos(prev => prev + (data.earnedPoints || 0));

      // Forçar atualização dos dados
      await fetchUserChallenges();
      
      return true;
    } catch (error) {
      console.error('Erro ao concluir desafio:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao concluir desafio",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchUserChallenges]);

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
      loading,
      participarDesafio,
      removerDesafio,
      atualizarProgresso,
      concluirDesafio
    }}>
      {children}
    </MetasContext.Provider>
  );
};