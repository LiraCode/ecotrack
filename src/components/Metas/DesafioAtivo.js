'use client'
import React, { useState } from 'react'
import { Paper, Typography, Box, Button } from '@mui/material'
import CircularProgressBar from './CircularProgressBar'
import { calcularPorcentagem, calcularDiasRestantes } from './utils/metasUtils'

const DesafioAtivo = ({ desafio, onRemover }) => {
  const [loading, setLoading] = useState(false)
  
  if (!desafio || !desafio.goalId) return null;

  // Calcular média do progresso de todas as metas
  const calcularProgressoMedio = () => {
    if (!desafio.goalId.challenges || desafio.goalId.challenges.length === 0) {
      console.log('Sem desafios para calcular progresso');
      return 0;
    }
    
    console.log('Calculando progresso para desafio:', {
      id: desafio._id,
      title: desafio.goalId.title,
      challenges: desafio.goalId.challenges.length
    });
    
    const progressos = desafio.goalId.challenges.map(challenge => {
      const progress = desafio.progress?.[challenge._id.toString()];
      if (!progress) {
        console.log('Sem progresso para desafio:', challenge._id);
        return 0;
      }
      
      // Garantir que os valores são números válidos
      const currentValue = parseFloat(progress.currentValue) || 0;
      const targetValue = parseFloat(progress.targetValue) || 1;
      
      console.log('Progresso do desafio:', {
        challengeId: challenge._id,
        currentValue,
        targetValue,
        porcentagem: (currentValue / targetValue) * 100
      });
      
      // Evitar divisão por zero
      if (targetValue <= 0) {
        console.log('Target value inválido:', targetValue);
        return 0;
      }
      
      return (currentValue / targetValue) * 100;
    });

    // Verificar se há progressos válidos
    if (progressos.length === 0) {
      console.log('Nenhum progresso válido encontrado');
      return 0;
    }
    
    const media = progressos.reduce((a, b) => a + b, 0) / progressos.length;
    const porcentagemFinal = Math.round(Math.max(0, Math.min(100, media)));
    
    console.log('Porcentagem final:', {
      progressos,
      media,
      porcentagemFinal
    });
    
    return porcentagemFinal;
  };

  const porcentagem = calcularProgressoMedio();
  const diasRestantes = calcularDiasRestantes(desafio.goalId.validUntil);

  const handleRemover = async () => {
    if (!onRemover) return;
    if (window.confirm(`Tem certeza que deseja remover o desafio "${desafio.goalId.title}"?`)) {
      setLoading(true);
      try {
        await onRemover(desafio._id);
      } catch (error) {
        console.error("Erro ao remover desafio:", error);
      } finally {
        setLoading(false);
      }
    }
  }

  // Debug logs mais específicos
  console.log('Estrutura completa do desafio:', JSON.stringify(desafio, null, 2));
  if (desafio.goalId.challenges) {
    desafio.goalId.challenges.forEach((challenge, index) => {
      console.log(`Challenge ${index}:`, {
        waste: challenge.waste,
        wasteType: challenge.waste?.type,
        wasteName: challenge.waste?.name,
        wasteId: challenge.waste?._id
      });
    });
  }

  return (
    <Paper elevation={3} className="p-4 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-8">
          <Typography variant="h6" className="font-medium mb-2">
            {desafio.goalId.title}
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-2">
            {desafio.goalId.description}
          </Typography>
          
          {/* Contadores por tipo de resíduo */}
          <Box className="mb-4">
            <Typography variant="subtitle2" className="font-medium mb-2">
              Metas do desafio:
            </Typography>
            <div className="space-y-1">
              {desafio.goalId.challenges?.map((challenge, index) => {
                const progress = desafio.progress[challenge._id.toString()] || {
                  currentValue: 0,
                  targetValue: parseFloat(challenge.value),
                  completed: false
                };
                
                return (
                  <Typography key={index} variant="body2">
                    <strong>{challenge.waste.type || 'Resíduo'}</strong>: {progress.currentValue}/{progress.targetValue} {challenge.type === 'weight' ? 'kg' : 'un.'}
                  </Typography>
                );
              })}
            </div>
          </Box>
          
          <Box className="flex items-center space-x-4">
            <Box>
              <Typography variant="body2" color="textSecondary">
                Pontos: {desafio.goalId.points}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Prazo: {new Date(desafio.goalId.validUntil).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Dias restantes: {diasRestantes}
              </Typography>
            </Box>
          </Box>
        </div>
        
        <Box className="flex flex-col items-center">
          <CircularProgressBar
            progresso={porcentagem}
            total={100}
            isPercentage={true}
            color={
              porcentagem >= 100 ? "success" :
              porcentagem < 30 ? "error" :
              porcentagem < 60 ? "warning" :
              "primary"
            }
            size={120}
          />
        </Box>
      </div>
      
      <Box className="mt-4 flex justify-end">
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleRemover}
          disabled={loading}
        >
          Remover
        </Button>
      </Box>
    </Paper>
  );
}

export default DesafioAtivo
