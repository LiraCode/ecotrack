'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header/page';
import CircularProgressBar from './CircularProgressBar'; // Importar o componente do gráfico circular
import styles from '@/components/Post/post.module.css'; // Use o estilo existente ou crie um novo

const MetasPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const progress = 150; // Exemplo de itens reciclados
  const total = 300; // Total de itens que precisam ser reciclados

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerWrapper}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      <div className={`${styles.sidebarArea} ${sidebarOpen ? styles.sidebarExpanded : ''}`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      <main className={`${styles.mainArea} ${sidebarOpen ? styles.mainShifted : ''}`}>
        <h1>Metas de Reciclagem</h1>
        <CircularProgressBar progress={progress} total={total} />
        <div>
          <p>Pontuação: {progress} pontos</p>
          <p>Período de Validade: 30 dias</p>
        </div>
      </main>
    </div>
  );
};

export default MetasPage;
