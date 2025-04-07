'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from '@/components/Post/post.module.css';
const mockPosts = [
  {
    id: 1,
    title: 'Bem-vindo ao EcoTrack!',
    content: 'Esse é o nosso primeiro post sobre sustentabilidade e tecnologia.',
    image: '/images/post1.png',
  },
  {
    id: 2,
    title: 'Dicas para economizar energia',
    content: 'Confira 5 formas simples de reduzir o consumo de energia em casa.',
    image: '/images/post2.png',
  },
  {
    id: 3,
    title: 'Reciclagem: por onde começar?',
    content: 'Entenda os primeiros passos para implantar a reciclagem no dia a dia.',
    image: '/images/post3.png',
  },
];

export default function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setPosts(mockPosts);
    }, 500);
  }, []);

  return (
    <div className={styles.postsContainer}>
      <h2 className={styles.heading}>Descubra como fazer mais!</h2>
      {posts.length === 0 ? (
        <p>Carregando posts...</p>
      ) : (
        <ul className={styles.postList}>
          {posts.map((post) => (
            <li key={post.id} className={styles.postItem}>
              <div className={styles.imageWrapper}>
                <Image
                  src={post.image}
                  alt={`Capa do post: ${post.title}`}
                  width={800}
                  height={400}
                  className={styles.coverImage}
                  priority
                />
              </div>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}