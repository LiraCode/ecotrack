'use client'
import { Button, Grid, Typography } from '@mui/material'
import DesafioAtivo from './DesafioAtivo'
import DesafioConcluido from './DesafioConcluido'
import DesafioExpirado from './DesafioExpirado'

const MetasTabs = ({ 
  abaAtiva, 
  setAbaAtiva, 
  desafiosAtivos, 
  desafiosConcluidos, 
  desafiosExpirados,
  concluirDesafio,
  removerDesafio,
  atualizarProgresso
}) => {
  return (
    <>
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
                <DesafioAtivo 
                  desafio={desafio}
                  concluirDesafio={concluirDesafio}
                  removerDesafio={removerDesafio}
                  atualizarProgresso={atualizarProgresso}
                />
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
                <DesafioConcluido desafio={desafio} />
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
                <DesafioExpirado desafio={desafio} />
              </Grid>
            ))
          ) : (
            <Typography className="w-full text-center py-4 text-gray-500">
              Nenhum desafio expirado
            </Typography>
          )}
        </Grid>
      )}
    </>
  )
}

export default MetasTabs
