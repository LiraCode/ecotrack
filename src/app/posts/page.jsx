'use client';
import { useState } from 'react';
import AppLayout from '@/components/Layout/page';
import PostsContent from '@/components/Post/PostsContent';
import TrilhaContent from '@/components/Post/TrilhaContent';
import styles from '@/components/Post/post.module.css';
import { useTheme, useMediaQuery } from '@mui/material';

export default function PostsPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppLayout>
      <div className={`
        flex justify-center items-center h-95vh
        ${isMobile ? 'w-95vw mt-4' : 'w-90vw lg:mt-0 mt-4 xs:ml-[100px]'}
      `}>
        <div className={styles.contentContainer}>
          {/* Abas de navegação */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "posts" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "trilha" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("trilha")}
            >
              Trilha Ambiental
            </button>
          </div>

          {activeTab === "posts" ? <PostsContent /> : <TrilhaContent />}
        </div>
      </div>
    </AppLayout>
  );
}
