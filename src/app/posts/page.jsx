'use client';
import { useState } from 'react';
import AppLayout from '@/components/Layout/page';
import PostsContent from '@/components/Post/PostsContent';
import TrilhaContent from '@/components/Post/TrilhaContent';
import styles from '@/components/Post/post.module.css';

export default function PostsPage() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <AppLayout>
      <div className="xs:ml-[100px] lg:mt-0 mt-4  flex  justify-center items-center  w-90vw h-95vh">
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
