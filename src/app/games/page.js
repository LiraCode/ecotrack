'use client';
import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import GoalCard from '@/components/games/GoalCard';
import RankingTable from '@/components/games/RankingTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function GamesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('goals');
  const {
    activeGoals,
    userScores,
    ranking,
    userRankingPosition,
    loading,
    error,
    joinGoal,
    calculateProgress
  } = useGoals();

  const handleJoinGoal = async (goalId) => {
    const result = await joinGoal(goalId);
    
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Você está participando desta meta agora.",
        variant: "success",
      });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Não foi possível participar desta meta.",
        variant: "destructive",
      });
    }
  };

  // Verificar se o usuário está participando de uma meta
  const isParticipatingInGoal = (goalId) => {
    return userScores.some(score => 
      score.goalId._id === goalId && 
      ['active', 'completed'].includes(score.status)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">EcoGames - Desafios e Recompensas</h1>
      
      <Tabs defaultValue="goals" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="goals">Metas Ativas</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="goals">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Suas Metas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Participe das metas abaixo para ganhar pontos e subir no ranking. 
                  Quanto mais você reciclar, mais pontos acumula!
                </p>
                
                {activeGoals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Não há metas ativas no momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeGoals.map((goal) => (
                      <GoalCard
                        key={goal._id}
                        goal={goal}
                        userProgress={calculateProgress(goal._id)}
                        onJoin={handleJoinGoal}
                        isParticipating={isParticipatingInGoal(goal._id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Confira os participantes com melhor desempenho nas metas de reciclagem.
              </p>
              
              {ranking.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Ainda não há participantes no ranking.</p>
                </div>
              ) : (
                <>
                  <RankingTable ranking={ranking} />
                  
                  {userRankingPosition && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-md">
                      <p className="text-center">
                        Sua posição atual: <span className="font-bold">{userRankingPosition}º lugar</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}