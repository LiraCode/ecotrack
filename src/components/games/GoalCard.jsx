import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function GoalCard({ goal, userProgress, onJoin, isParticipating }) {
  // Calcular dias restantes
  const calculateDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(goal.validUntil);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{goal.title}</CardTitle>
          <Badge variant={daysRemaining > 7 ? "outline" : "destructive"}>
            {daysRemaining} dias restantes
          </Badge>
        </div>
        <CardDescription>{goal.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">{goal.points} pontos</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span>
              {new Date(goal.initialDate).toLocaleDateString()} até {new Date(goal.validUntil).toLocaleDateString()}
            </span>
          </div>
          
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Meta:</p>
            <p className="text-sm">
              {goal.targetValue} {goal.targetType === 'weight' ? 'kg' : 'unidades'} de resíduos
            </p>
          </div>
          
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Resíduos aceitos:</p>
            <div className="flex flex-wrap gap-1">
              {goal.challenges.map((challenge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {challenge.waste.name}
                </Badge>
              ))}
            </div>
          </div>
          
          {userProgress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{Math.round(userProgress.percentComplete)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${userProgress.percentComplete}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {userProgress.currentValue} de {userProgress.targetValue} 
                {goal.targetType === 'weight' ? 'kg' : ' unidades'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {isParticipating ? (
          <Button variant="outline" className="w-full" disabled>
            Participando
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onJoin(goal._id)}
          >
            Participar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}