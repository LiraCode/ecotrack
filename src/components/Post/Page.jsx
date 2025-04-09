'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header/page';
import PostsContent from './PostsContent';
import TrilhaContent from './TrilhaContent';
import styles from '@/components/Post/post.module.css';

export default function Posts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerWrapper}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      <div className={`${styles.sidebarArea} ${sidebarOpen ? styles.sidebarExpanded : ''}`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      <main className={`${styles.mainArea} ${sidebarOpen ? styles.mainShifted : ''}`}>
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'posts' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'trilha' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('trilha')}
          >
            Trilha Ambiental
          </button>
        </div>

        {activeTab === 'posts' ? <PostsContent /> : <TrilhaContent />}
      </main>
    </div>
  );
}