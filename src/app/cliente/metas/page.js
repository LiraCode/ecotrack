'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header/page'
import { Container, Grid, Paper, Typography, Button, Box } from '@mui/material'
import CircularProgressBar from './CircularProgressBar'; // Importar o componente do gráfico circular

const MetasPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Exemplo de dados de progresso
  const desafios = [
    {
      nome: 'Reciclar Plástico',
      progresso: 70,
      total: 100,
      pontuacao: 150,
      dataInicio: new Date('2023-01-01'),
      dataTermino: new Date('2023-12-31'),
    },
    {
      nome: 'Reciclar Papel',
      progresso: 50,
      total: 100,
      pontuacao: 100,
      dataInicio: new Date('2023-02-01'),
      dataTermino: new Date('2023-11-30'),
    },
    {
      nome: 'Reciclar Vidro',
      progresso: 30,
      total: 100,
      pontuacao: 50,
      dataInicio: new Date('2023-03-01'),
      dataTermino: new Date('2023-10-31'),
    },
  ]

  // Exemplo de desafios disponíveis
  const desafiosDisponiveis = [
    { nome: 'Desafio de Reciclagem de Eletrônicos' },
    { nome: 'Desafio de Redução de Plástico' },
    { nome: 'Desafio de Compostagem' },
  ]

  // Função para calcular os dias restantes
  const calcularDiasRestantes = (dataTermino) => {
    const hoje = new Date()
    const diffTime = dataTermino - hoje
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Converte milissegundos em dias
  }

  // Função para verificar se a meta está expirada
  const isExpired = (dataTermino) => {
    const hoje = new Date()
    return dataTermino < hoje
  }

  // Função para participar do desafio
  const participarDesafio = (desafioNome) => {
    alert(`Você participou do desafio: ${desafioNome}`)
    // Aqui você pode adicionar a lógica para registrar a participação do usuário
  }

  return (
    <div className="flex flex-col h-screen">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      <main className={`flex-1 p-4 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Container>
          <Typography variant="h4" className="mb-4">Desafios de Reciclagem</Typography>
          <Grid container spacing={3} className="mb-15 mt-5">
            {desafios.map((desafio, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} className="p-4">
                  <Typography variant="h6">{desafio.nome}</Typography>
                  <CircularProgressBar progresso={desafio.progresso} total={desafio.total} />
                  <Box mt={4}>
                  <Typography>Pontuação: {desafio.pontuacao}</Typography>
                  <Typography>Progresso: {desafio.progresso}%</Typography>
                  <Typography>Data de Início: {desafio.dataInicio.toLocaleDateString()}</Typography>
                  <Typography>Data de Término: {desafio.dataTermino.toLocaleDateString()}</Typography>
                  <Typography>Dias Restantes: {isExpired(desafio.dataTermino) ? 'Expirado' : calcularDiasRestantes(desafio.dataTermino)}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h4" className="mb-2">Desafios Disponíveis</Typography>
          <Grid container spacing={3} className="mt-5">
            {desafiosDisponiveis.map((desafio, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} className="p-4 flex flex-col items-center">
                  <Typography variant="h6">{desafio.nome}</Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => participarDesafio(desafio.nome)}
                    className="mt-2"
                  >
                    Participar
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </div>
  )
}

export default MetasPage