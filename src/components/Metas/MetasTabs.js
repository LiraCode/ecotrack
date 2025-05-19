'use client'
import { useState, useEffect } from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import DesafioAtivo from './DesafioAtivo'
import DesafioConcluido from './DesafioConcluido'
import DesafioExpirado from './DesafioExpirado'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { getAuthToken } from '@/services/authService'
import { checkExpiredScores } from '@/services/scoreService'

const MetasTabs = ({ 
  abaAtiva, 
  setAbaAtiva, 
  desafiosAtivos, 
  desafiosConcluidos, 
  desafiosExpirados, 
  removerDesafio
}) => {
  const { toast } = useToast()
  const { user } = useAuth()

  // Verificar scores expirados
  useEffect(() => {
    const verifyExpiredScores = async () => {
      try {
        const result = await checkExpiredScores()
        
        if (result.success && result.expiredCount > 0) {
          console.log(`${result.expiredCount} metas foram marcadas como expiradas`)
          toast({
            title: "Metas expiradas",
            description: `${result.expiredCount} meta(s) foram marcadas como expiradas`,
            variant: "warning"
          })
        }
      } catch (error) {
        console.error('Erro ao verificar metas expiradas:', error)
      }
    }
    
    if (user) {
      verifyExpiredScores()
    }
  }, [user, toast])

  const handleChangeTab = (event, newValue) => {
    setAbaAtiva(newValue)
  }

  return (
    <Box className="mb-8">
      <Tabs
        value={abaAtiva}
        onChange={handleChangeTab}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        className="mb-4"
      >
        <Tab value="andamento" label="Em Andamento" />
        <Tab value="concluidos" label="Concluídos" />
        <Tab value="expirados" label="Expirados" />
      </Tabs>

      {abaAtiva === 'andamento' && (
        <div className="space-y-4">
          {desafiosAtivos.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Você não tem desafios em andamento.</p>
              <p className="text-gray-500">Participe de um desafio abaixo!</p>
            </div>
          ) : (
            desafiosAtivos.map((desafio) => (
              <DesafioAtivo
                key={desafio.id}
                desafio={desafio}
                onRemover={removerDesafio}
              
              />
            ))
          )}
        </div>
      )}

      {abaAtiva === 'concluidos' && (
        <div className="space-y-4">
          {desafiosConcluidos.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Você ainda não concluiu nenhum desafio.</p>
            </div>
          ) : (
            desafiosConcluidos.map((desafio) => (
              <DesafioConcluido
                key={desafio.id}
                desafio={desafio}
                onRemover={removerDesafio}
              />
            ))
          )}
        </div>
      )}

      {abaAtiva === 'expirados' && (
        <div className="space-y-4">
          {desafiosExpirados.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Você não tem desafios expirados.</p>
            </div>
          ) : (
            desafiosExpirados.map((desafio) => (
              <DesafioExpirado
                key={desafio.id}
                desafio={desafio}
                onRemover={removerDesafio}
              />
            ))
          )}
        </div>
      )}
    </Box>
  )
}

export default MetasTabs
