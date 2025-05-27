'use client'
import { useState } from 'react'
import { Box, Tabs, Tab, Typography } from '@mui/material'
import DesafioAtivo from './DesafioAtivo'
import DesafioConcluido from './DesafioConcluido'
import DesafioExpirado from './DesafioExpirado'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

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
  const handleChange = (event, newValue) => {
    setAbaAtiva(newValue)
  }

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={abaAtiva} 
          onChange={handleChange} 
          aria-label="metas tabs"
          variant="fullWidth"
        >
          <Tab label="Em Andamento" {...a11yProps('andamento')} value="andamento" />
          <Tab label="Concluídos" {...a11yProps('concluidos')} value="concluidos" />
          <Tab label="Expirados" {...a11yProps('expirados')} value="expirados" />
        </Tabs>
      </Box>
      
      <TabPanel value={abaAtiva} index="andamento">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          {desafiosAtivos && desafiosAtivos.length > 0 ? (
            desafiosAtivos.map((desafio) => (
              <DesafioAtivo 
                key={desafio._id || desafio.id} 
                desafio={desafio} 
                onRemover={removerDesafio}
              />
            ))
          ) : (
            <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4, gridColumn: '1/-1' }}>
              Você não tem desafios em andamento no momento.
            </Typography>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={abaAtiva} index="concluidos">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {desafiosConcluidos && desafiosConcluidos.length > 0 ? (
            desafiosConcluidos.map((desafio) => (
              <DesafioConcluido 
                key={desafio._id || desafio.id} 
                desafio={desafio} 
              />
            ))
          ) : (
            <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
              Você ainda não concluiu nenhum desafio.
            </Typography>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={abaAtiva} index="expirados">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {desafiosExpirados && desafiosExpirados.length > 0 ? (
            desafiosExpirados.map((desafio) => (
              <DesafioExpirado 
                key={desafio._id || desafio.id} 
                desafio={desafio} 
                onRemover={removerDesafio}
              />
            ))
          ) : (
            <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
              Você não tem desafios expirados.
            </Typography>
          )}
        </Box>
      </TabPanel>
    </Box>
  )
}

export default MetasTabs
