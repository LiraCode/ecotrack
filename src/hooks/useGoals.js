'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllGoals } from '@/services/goalService';
import { getUserScores, joinGoal as joinGoalService, getRanking } from '@/services/scoreService';

export const useGoals = () => {
  const { user } = useAuth();
  const [activeGoals, setActiveGoals] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [userRankingPosition, setUserRankingPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Carregar dados
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Carregar metas ativas
      const goalsResult = await getAllGoals();
      if (!goalsResult.success) {
        throw new Error(goalsResult.error);
      }
      
      // Filtrar apenas metas ativas
      const active = goalsResult.goals.filter(goal => goal.status === 'active');
      setActiveGoals(active);
      
      // Carregar scores do usuário
      const scoresResult = await getUserScores();
      if (!scoresResult.success) {
        throw new Error(scoresResult.error);
      }
      
      setUserScores(scoresResult.scores);
      
      // Carregar ranking
      const rankingResult = await getRanking(20);
      if (!rankingResult.success) {
        throw new Error(rankingResult.error);
      }
      
      setRanking(rankingResult.ranking);
      
      // Encontrar posição do usuário no ranking
      const userPosition = rankingResult.ranking.findIndex(item => 
        item.userId === user._id
      );
      
      if (userPosition !== -1) {
        setUserRankingPosition(userPosition + 1);
      } else {
        setUserRankingPosition(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Carregar dados quando o usuário mudar
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);
  
  // Participar de uma meta
  const joinGoal = async (goalId) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    try {
      const result = await joinGoalService(goalId);
      
      if (result.success) {
        // Recarregar dados após participar
        await loadData();
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao participar da meta:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Calcular progresso do usuário em uma meta
  const calculateProgress = (goalId) => {
    const score = userScores.find(s => s.goalId._id === goalId);
    
    if (!score) return null;
    
    const goal = score.goalId;
    const percentComplete = (score.currentValue / goal.targetValue) * 100;
    
    return {
      currentValue: score.currentValue,
      targetValue: goal.targetValue,
      percentComplete: Math.min(percentComplete, 100),
      earnedPoints: score.earnedPoints,
      totalPoints: goal.points,
      status: score.status
    };
  };
  
  // Atualizar dados
  const refreshData = () => {
    loadData();
  };
  
  return {
    activeGoals,
    userScores,
    ranking,
    userRankingPosition,
    loading,
    error,
    joinGoal,
    calculateProgress,
    refreshData
  };
};