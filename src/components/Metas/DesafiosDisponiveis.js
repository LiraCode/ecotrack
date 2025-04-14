'use client'
import { Typography, Grid, Paper, Button } from '@mui/material'

const DesafiosDisponiveis = ({ desafiosDisponiveis, participarDesafio }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Typography variant="h5" className="mb-4 font-bold text-center">
        Desafios Disponíveis
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {desafiosDisponiveis.map(desafio => (
          <Grid item xs={12} sm={10} md={6} lg={4} key={desafio.id}>
            <Paper elevation={3} className="p-4 sm:p-6 flex flex-col items-center h-full mx-auto max-w-sm">
              <Typography variant="h6" className="font-medium mb-3 text-center text-sm sm:text-base">
                {desafio.nome}
              </Typography>
              <Typography className="text-xs sm:text-sm mb-2 text-center">
                <span className="font-medium">Prêmio:</span> {desafio.pontuacao} pontos
              </Typography>
              <Button 
                variant="contained" 
                style={{ backgroundColor: '#4CAF50' }}
                onClick={() => participarDesafio(desafio)}
                className="mt-auto"
                fullWidth
                size="small"
              >
                Participar
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

export default DesafiosDisponiveis
