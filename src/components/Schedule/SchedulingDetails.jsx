import { useState } from 'react';
import { Button, Typography, Box, Chip, Alert } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { completeScheduling } from '@/services/schedulingService';
import { useToast } from '@/components/ui/use-toast';

const SchedulingDetails = ({ scheduling, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleCompleteScheduling = async () => {
    if (!confirm('Tem certeza que deseja marcar este agendamento como concluído? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await completeScheduling(scheduling._id);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
          variant: "success"
        });
        
        // Notificar o componente pai sobre a mudança de status
        if (onStatusChange) {
          onStatusChange('Concluído');
        }
        
        // Exibir informação sobre metas atualizadas
        if (result.updatedScores > 0) {
          toast({
            title: "Metas atualizadas",
            description: `${result.updatedScores} meta(s) do cliente foram atualizadas com este agendamento.`,
            variant: "success"
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error);
      toast({
        title: "Erro",
        description: `Falha ao concluir agendamento: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      {/* Outros detalhes do agendamento */}
      
      {/* Botão para concluir o agendamento (apenas se não estiver concluído) */}
      {scheduling.status !== 'Concluído' && (
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={handleCompleteScheduling}
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? 'Processando...' : 'Marcar como Concluído'}
        </Button>
      )}
      
      {/* Indicador de agendamento concluído */}
      {scheduling.status === 'Concluído' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Este agendamento foi concluído em {new Date(scheduling.collectedAt).toLocaleString()}
        </Alert>
      )}
    </Box>
  );
};

export default SchedulingDetails;