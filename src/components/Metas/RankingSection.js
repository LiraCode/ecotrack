'use client'
import React from 'react';
import { Typography, Paper, useTheme, useMediaQuery } from '@mui/material'
import '@/app/styles/globals.css';
import { useAuth } from '@/context/AuthContext';

const RankingSection = ({ ranking }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Garantir que ranking é um array, mesmo que seja undefined
  const safeRanking = Array.isArray(ranking) ? ranking : [];
  
  // console.log("RankingSection recebeu:", ranking);

  return (
    <Paper elevation={3} className="p-4 md:p-6 mb-6 md:mb-8">
      <Typography variant={isMobile ? "h6" : "h5"} className="mb-4 md:mb-6 font-bold text-center">
        Ranking
      </Typography>
      
      <div className={`flex justify-center items-end ${isMobile ? 'space-x-2' : 'space-x-4'} mb-6 md:mb-8`}>
        {/* Segundo lugar (prata) */}
        <div className="flex flex-col items-center">
          <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} bg-gray-300 rounded-full flex items-center justify-center mb-2 shadow-md`}>
            <i className={`fa-solid fa-medal text-gray-100 ${isMobile ? 'text-2xl' : 'text-3xl'}`}></i>
          </div>
          <div className="bg-gray-200 p-2 md:p-4 rounded-lg text-center shadow-sm transform hover:scale-105 transition-transform"> 
            <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{safeRanking[1]?.name || 'Carregando...'}</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{safeRanking[1]?.totalPoints || 0} pts</div>
          </div>
        </div>
        
        {/* Primeiro lugar (ouro) */}
        <div className="flex flex-col items-center">
          <div className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} bg-yellow-400 rounded-full flex items-center justify-center mb-2 shadow-lg border-2 border-yellow-300`}>
            <i className={`fa-solid fa-trophy-star text-amber-100 ${isMobile ? 'text-3xl' : 'text-4xl'}`}></i>
          </div>
          <div className="bg-yellow-100 p-2 md:p-4 rounded-lg text-center shadow-md transform hover:scale-105 transition-transform">
            <div className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{safeRanking[0]?.name || 'Carregando...'}</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-yellow-800`}>{safeRanking[0]?.totalPoints || 0} pts</div>
          </div>
        </div>
        
        {/* Terceiro lugar (bronze) */}
        <div className="flex flex-col items-center">
          <div className={`${isMobile ? 'w-14 h-14' : 'w-16 h-16'} bg-amber-700 rounded-full flex items-center justify-center mb-2 shadow-md`}>
            <i className={`fa-solid fa-medal text-amber-200 ${isMobile ? 'text-xl' : 'text-2xl'}`}></i>
          </div>
          <div className="bg-amber-50 p-2 md:p-4 rounded-lg text-center shadow-sm transform hover:scale-105 transition-transform">
            <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{safeRanking[2]?.name || 'Carregando...'}</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-800`}>{safeRanking[2]?.totalPoints || 0} pts</div>
          </div>
        </div>
      </div>
      
      {/* Lista completa */}
      <div className="overflow-x-auto">
        <div className="min-w-full overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${isMobile ? 'px-2' : 'px-6'} py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>Posição</th>
                <th className={`${isMobile ? 'px-2' : 'px-6'} py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>Usuário</th>
                <th className={`${isMobile ? 'px-2' : 'px-6'} py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}>Pontos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeRanking.length > 0 ? (
                safeRanking.map((item) => (
                  <tr key={item.clientId} className={item.isCurrentUser ? "bg-green-50" : ""}>
                    <td className={`${isMobile ? 'px-2' : 'px-6'} py-3 whitespace-nowrap text-sm font-medium text-gray-900`}>{item.position}</td>
                    <td className={`${isMobile ? 'px-2' : 'px-6'} py-3 whitespace-nowrap text-sm text-gray-500`}>
                      <div className="flex items-center">
                        <span className="truncate max-w-[150px]">{item.name}</span>
                        {item.isCurrentUser && <span className="ml-1 text-xs text-green-600">(Você)</span>}
                      </div>
                    </td>
                    <td className={`${isMobile ? 'px-2' : 'px-6'} py-3 whitespace-nowrap text-sm text-gray-500 text-right`}>{item.totalPoints}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={`${isMobile ? 'px-2' : 'px-6'} py-4 text-center text-sm text-gray-500`}>
                    Carregando ranking...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Paper>
  )
}

// Componente de carregamento para exibir quando o ranking não estiver disponível
const LoadingRanking = () => {
  return (
    <Paper elevation={3} className="p-6 mb-8">
      <Typography variant="h5" className="mb-6 font-bold text-center">
        Ranking
      </Typography>
      <div className="text-center p-8">
        <Typography variant="body1" color="textSecondary">
          Carregando ranking...
        </Typography>
      </div>
    </Paper>
  );
}

export default RankingSection;
