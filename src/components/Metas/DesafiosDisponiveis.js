'use client'
import React from 'react'
import { Typography, Paper, Button, Grid, Card, CardContent, CardActions } from '@mui/material'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'

const DesafiosDisponiveis = (props) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = React.useState({})
  // Verificar se props e desafiosDisponiveis existem
  if (!props) {
    console.warn("DesafiosDisponiveis: props is undefined")
    return <LoadingDesafios />
  }
  
  const desafiosDisponiveis = props.desafiosDisponiveis
  const participarDesafio = props.participarDesafio
  
  // Verificar se desafiosDisponiveis existe e é um array
  if (!desafiosDisponiveis || !Array.isArray(desafiosDisponiveis)) {
    console.warn("DesafiosDisponiveis: desafiosDisponiveis is not an array", desafiosDisponiveis)
    return <LoadingDesafios />
  }
  

  const handleParticipar = async (desafioId) => {
    if (!participarDesafio || typeof participarDesafio !== 'function') {
      console.error("participarDesafio is not a function")
      return
    }
    
    setLoading(prev => ({ ...prev, [desafioId]: true }))
    try {
      await participarDesafio(desafioId)
    } catch (error) {
      console.error("Erro ao participar do desafio:", error)
      toast({
        title: "Erro",
        description: "Não foi possível participar do desafio. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, [desafioId]: false }))
    }
  }

  return (
    <Paper elevation={3} className="p-6 mb-8">
      <Typography variant="h5" className="font-bold mb-4">
        Desafios Disponíveis
      </Typography>
      
      {desafiosDisponiveis.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Não há desafios disponíveis no momento.</p>
          <p className="text-gray-500">Volte mais tarde para novos desafios!</p>
        </div>
      ) : (
        <Grid container spacing={3}>
          {desafiosDisponiveis.map((desafio, index) => (
            <Grid item xs={12} sm={6} md={4} key={desafio.id || index}>
              <Card className="h-full flex flex-col">
                <CardContent className="flex-grow">
                  <Typography variant="h6" className="font-medium mb-2">
                    {desafio.nome}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className="mb-3">
                    {desafio.descricao}
                  </Typography>
                  <div className="space-y-1 text-sm">
                    <Typography>
                      <span className="font-medium">Meta:</span> {desafio.total} {desafio.tipo === 'peso' ? 'kg' : 'itens'}
                    </Typography>
                    <Typography>
                      <span className="font-medium">Pontos:</span> {desafio.pontos}
                    </Typography>
                    <Typography>
                      <span className="font-medium">Prazo:</span> {desafio.dataTermino ? desafio.dataTermino.toLocaleDateString() : 'Não definido'}
                    </Typography>
                  </div>
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => handleParticipar(desafio.id)}
                    disabled={loading[desafio.id]}
                  >
                    {loading[desafio.id] ? 'Participando...' : 'Participar'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  )
}

// Componente de carregamento para exibir quando os desafios não estiverem disponíveis
const LoadingDesafios = () => {
  return (
    <Paper elevation={3} className="p-6 mb-8">
      <Typography variant="h5" className="font-bold mb-4">
        Desafios Disponíveis
      </Typography>
      <div className="text-center p-8">
        <Typography variant="body1" color="textSecondary">
          Carregando desafios disponíveis...
        </Typography>
      </div>
    </Paper>
  )
}

export default DesafiosDisponiveis
