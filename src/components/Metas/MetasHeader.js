'use client'
import { Typography } from '@mui/material'

const MetasHeader = ({ meusPontos }) => {
  return (
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
  )
}

export default MetasHeader
