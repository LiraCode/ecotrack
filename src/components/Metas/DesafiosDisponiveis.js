'use client'
import { Typography, Grid, Paper, Button } from '@mui/material'

const DesafiosDisponiveis = ({ desafiosDisponiveis, participarDesafio }) => {
  return (
    <>
      <Typography variant="h5" className="mb-4 font-bold">
        Desafios Disponíveis
      </Typography>
      <Grid container spacing={3}>
        {desafiosDisponiveis.map(desafio => (
          <Grid item xs={12} sm={6} md={4} key={desafio.id}>
            <Paper elevation={3} className="p-4 flex flex-col items-center h-full">
              <Typography variant="h6" className="font-medium mb-3 text-center">
                {desafio.nome}
              </Typography>
              <Typography className="text-sm mb-2 text-center">
                <span className="font-medium">Prêmio:</span> {desafio.pontuacao} pontos
              </Typography>
              <Button 
                variant="contained" 
                style={{ backgroundColor: '#4CAF50' }}
                onClick={() => participarDesafio(desafio)}
                className="mt-auto"
                fullWidth
              >
                Participar
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default DesafiosDisponiveis
