import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CircularProgressBar = ({ progresso, total, expirado = false }) => {
  const percentage = Math.round((progresso / total) * 100);
  
  const data = {
    labels: ['Concluído', 'Faltou'],
    datasets: [
      {
        data: [progresso, total - progresso],
        backgroundColor: [
          '#4CAF50', // Verde para o progresso alcançado
          expirado ? '#FF5252' : '#E0E0E0' // Vermelho vibrante se expirado
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="relative" style={{ width: '100%', height: '150px' }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default CircularProgressBar;