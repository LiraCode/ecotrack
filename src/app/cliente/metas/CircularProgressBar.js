import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar os componentes necessários
ChartJS.register(ArcElement, Tooltip, Legend);

const CircularProgressBar = ({ progresso, total }) => {
  const data = {
    labels: ['Alcançado', 'Restante'],
    datasets: [
      {
        data: [progresso, total - progresso],
        backgroundColor: ['#36A2EB', '#E0E0E0'],
        hoverBackgroundColor: ['#36A2EB', '#E0E0E0'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permite que o gráfico se ajuste ao contêiner
  };

  return (
    <div style={{ width: '100%', height: '150px', margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
      <p className="text-center">{progresso} de {total} itens reciclados</p>
    </div>
  );
};

export default CircularProgressBar;
