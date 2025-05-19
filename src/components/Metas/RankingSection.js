'use client'
import React from 'react';
import { Typography, Paper } from '@mui/material'
import '@/app/styles/globals.css';
import { useAuth } from '@/context/AuthContext';

const RankingSection = ({ ranking }) => {
  const { user } = useAuth();
  const clientId = user?._id;

  // Garantir que ranking é um array, mesmo que seja undefined
  const safeRanking = Array.isArray(ranking) ? ranking : [];
  
  //console.log("RankingSection recebeu:", ranking);
  //console.log("safeRanking:", safeRanking);

  return (
    <Paper elevation={3} className="p-6 mb-8">
      <Typography variant="h5" className="mb-6 font-bold text-center">
        Ranking
      </Typography>
      
      <div className="flex justify-center items-end space-x-4 mb-8">
        {/* Segundo lugar (prata) */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-2 shadow-md">
            <i className="fa-solid fa-medal text-gray-100 text-3xl"></i>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg text-center shadow-sm transform hover:scale-105 transition-transform"> 
            <div className="font-medium">{safeRanking[1]?.nome || 'Carregando...'}</div>
            <div className="text-sm text-gray-700">{safeRanking[1]?.pontos || 0} pts</div>
          </div>
        </div>
        
        {/* Primeiro lugar (ouro) */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-2 shadow-lg border-2 border-yellow-300">
            <i className="fa-solid fa-trophy-star text-amber-100 text-4xl"></i>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center shadow-md transform hover:scale-105 transition-transform">
            <div className="font-bold text-lg">{safeRanking[0]?.nome || 'Carregando...'}</div>
            <div className="text-sm font-medium text-yellow-800">{safeRanking[0]?.pontos || 0} pts</div>
          </div>
        </div>
        
        {/* Terceiro lugar (bronze) */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mb-2 shadow-md">
            <i className="fa-solid fa-medal text-amber-200 text-2xl"></i>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm transform hover:scale-105 transition-transform">
            <div className="font-medium">{safeRanking[2]?.nome || 'Carregando...'}</div>
            <div className="text-sm text-amber-800">{safeRanking[2]?.pontos || 0} pts</div>
          </div>
        </div>
      </div>
      
      {/* Lista completa */}
      <div className="overflow-auto max-h-64">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeRanking.length > 0 ? (
              safeRanking.map((item, index) => (
                <tr key={index} className={item.clientId === clientId ? "bg-green-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.posicao || index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.nome || 'Usuário'}
                    {item.clientId === clientId && <span className="ml-2 text-xs text-green-600">(Você)</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.pontos || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                  Carregando ranking...
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
