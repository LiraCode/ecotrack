'use client'
import { Typography, Paper } from '@mui/material'

const RankingSection = ({ ranking }) => {
  return (
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
  )
}

export default RankingSection
