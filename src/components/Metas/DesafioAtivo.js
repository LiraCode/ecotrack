'use client'
import React, { useState } from 'react'
import { Paper, Typography, Box, Button, Slider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import CircularProgressBar from './utils/CircularProgressBar'
import { calcularPorcentagem } from './utils/metasUtils'

const DesafioAtivo = ({ desafio, onConcluir, onRemover, onAtualizarProgresso }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [progressoAtual, setProgressoAtual] = useState(desafio?.progresso || 0)
  const [loading, setLoading] = useState(false)
  
  // Verificar se o desafio é válido
  if (!desafio) {
    console.warn("DesafioAtivo: desafio is undefined")
    return null
  }
  
  const porcentagem = calcularPorcentagem(desafio.progresso || 0, desafio.total || 100)
  const dataTermino = desafio.dataTermino instanceof Date 
    ? desafio.dataTermino 
    : new Date(desafio.dataTermino || Date.now())
  
  const diasRestantes = Math.ceil((dataTermino - new Date()) / (1000 * 60 * 60 * 24))
  
  const handleOpenDialog = () => {
    setProgressoAtual(desafio.progresso || 0)
    setOpenDialog(true)
  }
  
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }
  
 

  

  
  const handleRemover = async () => {
    if (!onRemover) return
    
    if (window.confirm(`Tem certeza que deseja remover o desafio "${desafio.nome}"? \n Essa ação não pode ser desfeita e irá zerar o progresso atual.`)) {
      setLoading(true)
      try {
        await onRemover(desafio.id)
      } catch (error) {
        console.error("Erro ao remover desafio:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Paper elevation={3} className="p-4 bg-white h-full">
      <Typography variant="h6" className="font-medium mb-3">
        {desafio.nome || "Desafio sem título"}
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Typography variant="body2" className="mb-3 text-gray-600">
            {desafio.descricao || "Sem descrição"}
          </Typography>

          <Box className="space-y-1 text-sm">
            <Typography>
              <span className="font-medium">Meta:</span> {desafio.total || 0}{" "}
              {desafio.tipo === "peso" ? "kg" : "itens"}
            </Typography>
            <Typography>
              <span className="font-medium">Pontos possíveis:</span>{" "}
              {desafio.pontos || 0}
            </Typography>
            <Typography>
              <span className="font-medium">Prazo:</span>{" "}
              {dataTermino.toLocaleDateString()}
            </Typography>
            <Typography className={diasRestantes <= 3 ? "text-red-600" : ""}>
              <span className="font-medium">Tempo restante:</span>{" "}
              {diasRestantes} dias
            </Typography>
          </Box>

          <Box className="mt-4 flex space-x-2">
            <Button
              variant="contained"
              color="error"
              onClick={handleRemover}
              disabled={loading}
              size="small"
            >
              Remover
            </Button>
          </Box>
        </div>

        <div>
          <CircularProgressBar
            progresso={desafio.progresso || 0}
            total={desafio.total || 100}
          />
        </div>
      </div>
    </Paper>
  );
}

export default DesafioAtivo
