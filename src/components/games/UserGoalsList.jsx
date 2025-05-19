import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar } from 'lucide-react';

export default function UserGoalsList({ userScores }) {
  if (!userScores || userScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Metas</CardTitle>
          <CardDescription>Você ainda não está participando de nenhuma meta</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Metas</CardTitle>
        <CardDescription>Acompanhe seu progresso nas metas que você está participando</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userScores.map((score) => (
            <div key={score._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{score.goalId.title}</h3>
                <Badge 
                  variant={
                    score.status === 'completed' ? "success" : 
                    score.status === 'active' ? "outline" : 
                    score.status === 'expired' ? "destructive" : 
                    "secondary"
                  }
                >
                  {score.status === 'completed' ? "Concluída" : 
                   score.status === 'active' ? "Em andamento" : 
                   score.status === 'expired' ? "Expirada" : 
                   "Inativa"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{score.earnedPoints} / {score.goalId.points} pontos</span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Até {new Date(score.goalId.validUntil).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>
                  {Math.round((score.currentValue / score.goalId.targetValue) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${Math.min((score.currentValue / score.goalId.targetValue) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-xs mt-1">
                {score.currentValue} de {score.goalId.targetValue} 
                {score.goalId.targetType === 'weight' ? 'kg' : ' unidades'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}