'use client'
import { Typography, Paper } from '@mui/material'
import '@/app/styles/globals.css';

const RankingSection = ({ ranking }) => {
  return (
    <Paper elevation={3} className="p-6 mb-8">
      <Typography variant="h5" className="mb-6 font-bold text-center">
        Ranking
      </Typography>
      
      <div className="flex justify-center items-end space-x-4 mb-8">
        {/* Segundo lugar (prata) */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-2 shadow-md">
          <i className="fa-solid fa-medal text-gray-100 text-3xl" ></i>
         
          </div>
          <div className="bg-gray-200 p-4 rounded-lg text-center shadow-sm transform hover:scale-105 transition-transform"> 
            <div className="font-medium">{ranking[1]?.nome}</div>
            <div className="text-sm text-gray-700">{ranking[1]?.pontos} pts</div>
          </div>
        </div>
        
        {/* Primeiro lugar (ouro) */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-2 shadow-lg border-2 border-yellow-300">
          <i className="fa-solid fa-trophy-star text-amber-100 text-4xl" ></i>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center shadow-md transform hover:scale-105 transition-transform">
            <div className="font-bold text-lg">{ranking[0]?.nome}</div>
            <div className="text-sm font-medium text-yellow-800">{ranking[0]?.pontos} pts</div>
          </div>
        </div>
        
        {/* Terceiro lugar (bronze) */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mb-2 shadow-md">
            {/* <FontAwesomeIcon icon={faMedal} className="text-2xl text-amber-200" /> */}
            <i className="fa-solid fa-medal text-3xl text-amber-500"></i>
          </div>
          <div className="bg-amber-200 p-4 rounded-lg text-center shadow-sm transform hover:scale-105 transition-transform">
            <div className="font-medium">{ranking[2]?.nome}</div>
            <div className="text-sm text-amber-800">{ranking[2]?.pontos} pts</div>
          </div>
        </div>
      </div>
      
      {/* Lista do ranking */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {ranking.slice(3).map(user => (
          <div 
            key={user.id} 
            className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center text-center font-medium text-gray-700">
                {user.posicao}
              </span>
              <span className={`ml-3 ${user.nome === 'Você' ? 'font-bold text-green-600' : ''}`}>
                {user.nome}
              </span>
            </div>
            <span className="font-medium bg-green-50 px-2 py-1 rounded-full text-sm">
              {user.pontos} pts
            </span>
          </div>
        ))}
      </div>
    </Paper>
  )
}

export default RankingSection
