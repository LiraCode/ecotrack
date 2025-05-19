'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function GoalCard({ goal, userProgress, onJoin, joined = false }) {
  const [loading, setLoading] = useState(false);
  
  const handleJoin = async () => {
    if (loading || joined) return;
    
    setLoading(true);
    await onJoin(goal._id);
    setLoading(false);
  };
  
  const daysLeft = Math.ceil((new Date(goal.validUntil) - new Date()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft <= 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{goal.title}</CardTitle>
          <Badge variant={isExpired ? "destructive" : "success"}>
            {isExpired ? "Expirado" : `${daysLeft} dias restantes`}
          </Badge>
        </div>
        <CardDescription>
          {goal.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pontos:</span>
            <span className="font-medium">{goal.points}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Meta:</span>
            <span className="font-medium">
              {goal.targetValue} {goal.targetType === 'weight' ? 'kg' : 'itens'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Período:</span>
            <span className="font-medium">
              {format(new Date(goal.initialDate), 'dd/MM/yyyy', { locale: ptBR })} - 
              {format(new Date(goal.validUntil), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
          
          {userProgress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso:</span>
                <span>{Math.round(userProgress.percentComplete)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${userProgress.percentComplete}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-xs text-muted-foreground">
                  {userProgress.currentValue} / {userProgress.targetValue} 
                  {goal.targetType === 'weight' ? ' kg' : ' itens'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {userProgress.earnedPoints} / {userProgress.totalPoints} pontos
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!joined && !isExpired ? (
          <Button 
            onClick={handleJoin} 
            disabled={loading || joined || isExpired}
            className="w-full"
          >
            {loading ? "Participando..." : "Participar"}
          </Button>
        ) : joined ? (
          <Button variant="outline" disabled className="w-full">
            <CheckCircle className="mr-2 h-4 w-4" />
            Participando
          </Button>
        ) : (
          <Button variant="outline" disabled className="w-full">
            <AlertCircle className="mr-2 h-4 w-4" />
            Meta expirada
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}