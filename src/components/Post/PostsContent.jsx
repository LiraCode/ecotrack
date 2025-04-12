'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './post.module.css';
import mockPosts from '@/data/mockPost';


export default function PostsContent() {
  const [expandedPost, setExpandedPost] = useState(null);
  
  return (
    <div className={styles.postsContainer}>
      <h1 className={styles.pageTitle}>EcoTrack Sustentável</h1>
      <p className={styles.pageSubtitle}>Esse é o nosso espaço para posts sobre sustentabilidade e tecnologia.</p>
      
      <div className={styles.postsGrid}>
        {mockPosts.map((post) => (
          <article key={post.id} className={styles.postCard}>
            <header className={styles.postHeader}>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postSubtitle}>{post.subtitle}</p>
            </header>
            <div 
              className={styles.postImage}
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              role="button"
              tabIndex={0}
            >
              <Image
                src={post.image}
                alt={`Visualizar dica: ${post.title}`}
                width={800}
                height={400}
                className={styles.imageElement}
              />
              <div className={styles.imageOverlay}>Clique para ver a dica</div>
            </div>
            <div className={styles.postBody}>
              <p>{post.content}</p>
            </div>
            {expandedPost === post.id && (
              <div className={styles.expandedContent}>
                {post.expandContent}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}