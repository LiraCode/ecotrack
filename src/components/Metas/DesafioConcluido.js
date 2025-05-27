'use client'
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material'
import CircularProgressBar from './CircularProgressBar'
import { calcularPorcentagem } from './utils/metasUtils'

const DesafioConcluido = ({ desafio }) => {
  console.log('Renderizando DesafioConcluido:', desafio);

  if (!desafio || !desafio.goalId) {
    console.log('Desafio inválido:', desafio);
    return null;
  }

  // Calcular progresso geral (média dos progressos individuais)
  const calcularProgressoGeral = () => {
    if (!desafio.progress || Object.keys(desafio.progress).length === 0) {
      console.log('Sem progresso para calcular');
      return 100; // Desafio concluído, retorna 100%
    }
    
    const progressos = Object.values(desafio.progress).map(progress => {
      const porcentagem = calcularPorcentagem(progress.currentValue, progress.targetValue);
      return porcentagem;
    });
    
    console.log('Progressos calculados:', progressos);
    
    return 100; // Desafio concluído, retorna 100%
  }
  
  const porcentagemGeral = calcularProgressoGeral();

  return (
    <Paper elevation={3} className="p-4 bg-green-50">
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="h6" className="font-medium text-green-800">
          {desafio.goalId.title}
        </Typography>
        <CheckCircleIcon color="success" />
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Typography variant="body2" className="mb-3 text-gray-700">
            {desafio.goalId.description}
          </Typography>

          <Box className="space-y-1 text-sm mb-4">
            <Typography className="text-green-700">
              <span className="font-medium">Status:</span> Concluído
            </Typography>
            <Typography className="text-green-700 font-medium">
              Pontos ganhos: {desafio.earnedPoints}
            </Typography>
            <Typography>
              <span className="font-medium">Concluído em:</span> {new Date(desafio.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Tabela de progresso por tipo de resíduo */}
          <Box className="mt-4">
            <Typography variant="subtitle2" className="font-medium mb-2">
              Metas concluídas:
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo de Resíduo</TableCell>
                    <TableCell align="right">Progresso</TableCell>
                    <TableCell align="right">Meta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {desafio.goalId.challenges.map((challenge, index) => {
                    const progress = desafio.progress[challenge._id.toString()] || {
                      currentValue: 0,
                      targetValue: challenge.value
                    };
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {challenge.waste.type}
                        </TableCell>
                        <TableCell align="right">
                          {progress.currentValue} {challenge.type === 'weight' ? 'kg' : 'un.'}
                        </TableCell>
                        <TableCell align="right">
                          {progress.targetValue} {challenge.type === 'weight' ? 'kg' : 'un.'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        
        <div className="flex justify-center items-start">
          <CircularProgressBar
            progresso={porcentagemGeral}
            total={100}
            isPercentage={true}
            color="success"
            size={120}
          />
        </div>
      </div>
    </Paper>
  );
}

export default DesafioConcluido
