'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header/page'
import { Container, Grid, Paper, Typography, Button, Box, IconButton, Chip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CircularProgressBar from './CircularProgressBar'

const MetasPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desafiosAtivos, setDesafiosAtivos] = useState([
    {
      id: 1,
      nome: 'Reciclar Plástico',
      progresso: 70,
      total: 100,
      pontuacao: 150,
      dataInicio: new Date(new Date().setDate(new Date().getDate() - 3)),
      dataTermino: new Date(new Date().setDate(new Date().getDate() + 4)),
      concluido: false
    },
    {
      id: 6,
      nome: 'Reciclar Metal',
      progresso: 40,
      total: 100,
      pontuacao: 120,
      dataInicio: new Date(new Date().setDate(new Date().getDate() - 10)),
      dataTermino: new Date(new Date().setDate(new Date().getDate() - 3)),
      concluido: false
    }
  ])
  
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([])
  const [desafiosExpirados, setDesafiosExpirados] = useState([])
  const [pendingAlert, setPendingAlert] = useState(null) 
  const alertShownRef = useRef(false) 
  const [ranking, setRanking] = useState([
    { id: 1, nome: 'Maria', pontos: 850, posicao: 2 },
    { id: 2, nome: 'João', pontos: 1200, posicao: 1 },
    { id: 3, nome: 'Ana', pontos: 700, posicao: 3 },
    { id: 4, nome: 'Carlos', pontos: 650, posicao: 4 },
    { id: 5, nome: 'Você', pontos: 300, posicao: 5 },
  ])
  const [meusPontos, setMeusPontos] = useState(300)
  const [abaAtiva, setAbaAtiva] = useState('andamento')

  // Desafios disponíveis
  const desafiosDisponiveis = [
    { id: 2, nome: 'Reciclar Papel', pontuacao: 50 },
    { id: 3, nome: 'Reciclar Vidro', pontuacao: 180 },
    { id: 4, nome: 'Reciclagem de Eletrônicos', pontuacao: 200 },
    { id: 5, nome: 'Redução de Plástico', pontuacao: 80 },
    { id: 6, nome: 'Reciclar Metal', pontuacao: 150 },
    { id: 7, nome: 'Compostagem', pontuacao: 100 },
  ]

  const isExpirado = (dataTermino) => new Date() > dataTermino
  const diasRestantes = (dataTermino) => Math.ceil((dataTermino - new Date()) / (1000 * 60 * 60 * 24))

  // Função para mover desafios expirados
  const moverDesafiosExpirados = () => {
    const agora = new Date()
    const [ativos, novosExpirados] = desafiosAtivos.reduce(
      ([ativos, expirados], desafio) => {
        return desafio.dataTermino < agora 
          ? [ativos, [...expirados, desafio]] 
          : [[...ativos, desafio], expirados]
      },
      [[], []]
    )

    if (novosExpirados.length > 0) {
      setDesafiosAtivos(ativos)
      setDesafiosExpirados(prev => [...prev, ...novosExpirados])
      setPendingAlert(novosExpirados.length) 
    }
  }

  // Efeito para verificar desafios expirados na montagem e atualização
  useEffect(() => {
    moverDesafiosExpirados()
  }, []) 

  // Efeito para mostrar alerta após a renderização
  useEffect(() => {
    if (pendingAlert !== null && !alertShownRef.current) {
      const timer = setTimeout(() => {
        alert(`${pendingAlert} desafio(s) expiraram e foram movidos para "Não concluídos"`)
        setPendingAlert(null)
        alertShownRef.current = true
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pendingAlert])

  const participarDesafio = (desafio) => {
    const novoDesafio = {
      ...desafio,
      progresso: 0,
      total: 100,
      dataInicio: new Date(),
      dataTermino: new Date(new Date().setDate(new Date().getDate() + 7)),
      concluido: false
    }
    
    setDesafiosAtivos([...desafiosAtivos, novoDesafio])
    alert(`Você começou o desafio: ${desafio.nome}. Você tem 7 dias para completar!`)
  }

  const concluirDesafio = (desafioId) => {
    const desafio = desafiosAtivos.find(d => d.id === desafioId)
    if (!desafio) return

    if (isExpirado(desafio.dataTermino)) {
      alert('Este desafio já expirou e não pode ser concluído!')
      return
    }

    if (desafio.progresso >= desafio.total) {
      const novosPontos = meusPontos + desafio.pontuacao
      setMeusPontos(novosPontos)
      setDesafiosConcluidos([...desafiosConcluidos, { ...desafio, concluido: true }])
      setDesafiosAtivos(desafiosAtivos.filter(d => d.id !== desafioId))
      atualizarRanking(novosPontos)
      alert(`Desafio concluído! +${desafio.pontuacao} pontos!`)
    } else {
      alert('Complete 100% do desafio primeiro!')
    }
  }

  const removerDesafio = (desafioId) => {
    const desafio = desafiosAtivos.find(d => d.id === desafioId)
    if (!desafio) return

    if (isExpirado(desafio.dataTermino)) {
      setDesafiosExpirados([...desafiosExpirados, desafio])
    }
    
    setDesafiosAtivos(desafiosAtivos.filter(d => d.id !== desafioId))
  }

  const atualizarProgresso = (desafioId, incremento) => {
    setDesafiosAtivos(desafiosAtivos.map(desafio => {
      if (desafio.id === desafioId) {
        if (isExpirado(desafio.dataTermino)) {
          alert('Este desafio expirou e não pode ser atualizado!')
          return desafio
        }
        
        const novoProgresso = Math.min(desafio.progresso + incremento, desafio.total)
        return { ...desafio, progresso: novoProgresso }
      }
      return desafio
    }))
  }

  const atualizarRanking = (novosPontos) => {
    const novoRanking = ranking.map(p => 
      p.nome === 'Você' ? { ...p, pontos: novosPontos } : p
    ).sort((a, b) => b.pontos - a.pontos)
    .map((p, i) => ({ ...p, posicao: i + 1 }))
    
    setRanking(novoRanking)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} overflow-auto`}>
        <Container maxWidth="lg" className="space-y-8">
          {/* Seção de Título e Pontos */}
          <div className="flex justify-between items-center mb-8">
            <Typography variant="h4" className="font-bold text-gray-800">
              Meus Desafios
            </Typography>
            <div className="bg-white rounded-lg shadow p-4">
              <Typography variant="h6" className="text-center font-medium">
                Seus Pontos
              </Typography>
              <div className="text-center text-2xl font-bold text-green-600">
                {meusPontos}
              </div>
            </div>
          </div>

          {/* Seção de Ranking */}
          <Paper elevation={3} className="p-6 mb-8">
            <Typography variant="h5" className="mb-6 font-bold text-center">
              Ranking
            </Typography>
            
            <div className="flex justify-center items-end space-x-4 mb-8">
              {/* Segundo lugar (prata) */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div className="bg-gray-200 p-4 rounded-lg text-center">
                  <div className="font-medium">{ranking[1]?.nome}</div>
                  <div className="text-sm">{ranking[1]?.pontos} pts</div>
                </div>
              </div>
              
              {/* Primeiro lugar (ouro) */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="font-medium">{ranking[0]?.nome}</div>
                  <div className="text-sm">{ranking[0]?.pontos} pts</div>
                </div>
              </div>
              
              {/* Terceiro lugar (bronze) */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <div className="bg-amber-200 p-4 rounded-lg text-center">
                  <div className="font-medium">{ranking[2]?.nome}</div>
                  <div className="text-sm">{ranking[2]?.pontos} pts</div>
                </div>
              </div>
            </div>
            
            {/* Lista do ranking */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {ranking.slice(3).map(user => (
                <div key={user.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <span className="w-6 text-center font-medium">{user.posicao}</span>
                    <span className={`ml-2 ${user.nome === 'Você' ? 'font-bold text-blue-600' : ''}`}>
                      {user.nome}
                    </span>
                  </div>
                  <span className="font-medium">{user.pontos} pts</span>
                </div>
              ))}
            </div>
          </Paper>

          {/* Abas de navegação */}
          <div className="flex space-x-4 mb-4 border-b">
            <Button 
              variant="text" 
              color={abaAtiva === 'andamento' ? 'primary' : 'inherit'}
              onClick={() => setAbaAtiva('andamento')}
            >
              Em Andamento
            </Button>
            <Button 
              variant="text" 
              color={abaAtiva === 'concluidos' ? 'primary' : 'inherit'}
              onClick={() => setAbaAtiva('concluidos')}
            >
              Concluídos
            </Button>
            <Button 
              variant="text" 
              color={abaAtiva === 'expirados' ? 'primary' : 'inherit'}
              onClick={() => setAbaAtiva('expirados')}
            >
              Não Concluídos
            </Button>
          </div>

          {/* Conteúdo das abas */}
          {abaAtiva === 'andamento' && (
            <Grid container spacing={3} className="mb-8">
              {desafiosAtivos.length > 0 ? (
                desafiosAtivos.map(desafio => (
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
                          <span className="font-medium">Progresso:</span> {Math.round((desafio.progresso/desafio.total)*100)}%
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
                      
                      {!isExpirado(desafio.dataTermino) && (
                        <Box mt={2} className="flex space-x-2">
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => atualizarProgresso(desafio.id, 10)}
                          >
                            +10%
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => atualizarProgresso(desafio.id, 25)}
                          >
                            +25%
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Typography className="w-full text-center py-4 text-gray-500">
                  Nenhum desafio em andamento
                </Typography>
              )}
            </Grid>
          )}

          {abaAtiva === 'concluidos' && (
            <Grid container spacing={3} className="mb-8">
              {desafiosConcluidos.length > 0 ? (
                desafiosConcluidos.map(desafio => (
                  <Grid item xs={12} sm={6} md={4} key={desafio.id}>
                    <Paper elevation={3} className="p-4 bg-green-50 h-full">
                      <Typography variant="h6" className="font-medium mb-3 text-green-800">
                        {desafio.nome} ✓
                      </Typography>
                      <CircularProgressBar progresso={100} total={100} />
                      <Box mt={2} className="space-y-1">
                        <Typography className="text-sm">
                          <span className="font-medium">Pontos ganhos:</span> {desafio.pontuacao}
                        </Typography>
                        <Typography className="text-sm">
                          <span className="font-medium">Concluído em:</span> {new Date().toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Typography className="w-full text-center py-4 text-gray-500">
                  Nenhum desafio concluído ainda
                </Typography>
              )}
            </Grid>
          )}

          {abaAtiva === 'expirados' && (
            <Grid container spacing={3} className="mb-8">
              {desafiosExpirados.length > 0 ? (
                desafiosExpirados.map(desafio => (
                  <Grid item xs={12} sm={6} md={4} key={desafio.id}>
                    <Paper elevation={3} className="p-4 bg-red-50 h-full">
  <Typography variant="h6" className="font-medium mb-3 text-red-800">
    {desafio.nome} 
  </Typography>
  <CircularProgressBar 
    progresso={desafio.progresso} 
    total={desafio.total}
    expirado={true} 
  />
  <Box mt={2} className="space-y-1 text-sm">
    <Typography>
      <span className="font-medium">Progresso alcançado:</span> {Math.round((desafio.progresso/desafio.total)*100)}%
    </Typography>
    <Typography>
      <span className="font-medium">Itens coletados:</span> {desafio.progresso} de {desafio.total}
    </Typography>
    <Typography className="text-red-600">
      <span className="font-medium">Expirou em:</span> {desafio.dataTermino.toLocaleDateString('pt-BR')}
    </Typography>
  </Box>
</Paper>
                  </Grid>
                ))
              ) : (
                <Typography className="w-full text-center py-4 text-gray-500">
                  Nenhum desafio expirado
                </Typography>
              )}
            </Grid>
          )}

          {/* Seção de Desafios Disponíveis */}
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
                    style={{ backgroundColor: '#4CAF50' }} // Verde
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
        </Container>
      </main>
    </div>
  )
}

export default MetasPage