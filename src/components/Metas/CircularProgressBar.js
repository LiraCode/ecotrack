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

const CircularProgressBar = ({ progress, total }) => {
  const data = {
    labels: ['Alcançado', 'Restante'],
    datasets: [
      {
        data: [progress, total - progress],
        backgroundColor: ['#36A2EB', '#E0E0E0'],
        hoverBackgroundColor: ['#36A2EB', '#E0E0E0'],
      },
    ],
  };

  return (
    <div>
      <h2>Progresso das Metas</h2>
      <Doughnut data={data} />
      <p>
        {progress} de {total} itens reciclados
      </p>
    </div>
  );
};

export default CircularProgressBar;
