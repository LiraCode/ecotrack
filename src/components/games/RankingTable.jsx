'use client';
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';

export default function RankingTable({ ranking, clientId }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Posição</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
            <TableHead className="text-right">Metas Concluídas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranking.map((item) => (
            <TableRow 
              key={item.clientId} 
              className={item.clientId === clientId ? "bg-muted/50" : ""}
            >
              <TableCell className="font-medium">
                {item.position <= 3 ? (
                  <div className="flex items-center">
                    <Trophy 
                      className={`h-5 w-5 mr-1 ${
                        item.position === 1 ? "text-yellow-500" : 
                        item.position === 2 ? "text-gray-400" : 
                        "text-amber-700"
                      }`} 
                    />
                    {item.position}
                  </div>
                ) : (
                  item.position
                )}
              </TableCell>
              <TableCell>
                {item.name}
                {item.clientId === clientId && <span className="ml-2 text-xs text-muted-foreground">(Você)</span>}
              </TableCell>
              <TableCell className="text-right font-medium">{item.totalPoints}</TableCell>
              <TableCell className="text-right">{item.goalsCompleted}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
