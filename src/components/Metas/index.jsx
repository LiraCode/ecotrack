'use client';
import { Grid, Paper, Typography, Button, Box, IconButton, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgressBar from './CircularProgressBar';

const Metas = ({ desafiosAtivos, setDesafiosAtivos, setDesafiosConcluidos, meusPontos, setMeusPontos, atualizarRanking }) => {
  const isExpirado = (dataTermino) => new Date() > dataTermino;
  const diasRestantes = (dataTermino) => Math.ceil((dataTermino - new Date()) / (1000 * 60 * 60 * 24));

  const concluirDesafio = (desafioId) => {
    const desafio = desafiosAtivos.find((d) => d.id === desafioId);
    if (!desafio) return;

    if (isExpirado(desafio.dataTermino)) {
      alert('Este desafio já expirou e não pode ser concluído!');
      return;
    }

    if (desafio.progresso >= desafio.total) {
      const novosPontos = meusPontos + desafio.pontuacao;
      setMeusPontos(novosPontos);
      setDesafiosConcluidos((prev) => [...prev, { ...desafio, concluido: true }]);
      setDesafiosAtivos((prev) => prev.filter((d) => d.id !== desafioId));
      atualizarRanking(novosPontos);
      alert(`Desafio concluído! +${desafio.pontuacao} pontos!`);
    } else {
      alert('Complete 100% do desafio primeiro!');
    }
  };

  const removerDesafio = (desafioId) => {
    setDesafiosAtivos((prev) => prev.filter((d) => d.id !== desafioId));
  };

  return (
    <Grid container spacing={3} className="mb-8">
      {desafiosAtivos.length > 0 ? (
        desafiosAtivos.map((desafio) => (
          <Grid item xs={12} sm={6} md={4} key={desafio.id}>
            <Paper elevation={3} className="p-4 h-full relative">
              <div className="absolute top-2 right-2 flex space-x-1">
                {desafio.progresso >= desafio.total && !isExpirado(desafio.dataTermino) && (
                  <IconButton 
                    color="success" 
                    onClick={() => concluirDesafio(desafio.id)}
                    title="Concluir desafio"
                    size="small"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )}
                <IconButton 
                  color="error" 
                  onClick={() => removerDesafio(desafio.id)}
                  title="Remover desafio"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </div>

              <Typography variant="h6" className="font-medium mb-3">
                {desafio.nome}
              </Typography>

              <CircularProgressBar progresso={desafio.progresso} total={desafio.total} expirado={isExpirado(desafio.dataTermino)} />

              <Box mt={2} className="space-y-1">
                <Typography className="text-sm">
                  <span className="font-medium">Pontos:</span> {desafio.pontuacao}
                </Typography>
                <Typography className="text-sm">
                  <span className="font-medium">Progresso:</span> {Math.round((desafio.progresso / desafio.total) * 100)}%
                </Typography>
                <Typography className="text-sm">
                  <span className="font-medium">Término:</span> {desafio.dataTermino.toLocaleDateString('pt-BR')}
                </Typography>
                <Chip 
                  label={isExpirado(desafio.dataTermino) ? 'Expirado' : `${diasRestantes(desafio.dataTermino)} dias restantes`}
                  color={isExpirado(desafio.dataTermino) ? 'error' : 'success'}
                  size="small"
                  icon={isExpirado(desafio.dataTermino) ? null : <AccessTimeIcon fontSize="small" />}
                />
              </Box>
            </Paper>
          </Grid>
        ))
      ) : (
        <Typography className="w-full text-center py-4 text-gray-500">
          Nenhum desafio em andamento
        </Typography>
      )}
    </Grid>
  );
};

export default Metas;
