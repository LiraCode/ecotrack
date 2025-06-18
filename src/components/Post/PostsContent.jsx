'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Typography, Paper, Chip, useTheme } from '@mui/material';
import DOMPurify from 'dompurify';

export default function PostsContent({ posts }) {
  const [expandedPost, setExpandedPost] = useState(null);
  const [localPosts, setLocalPosts] = useState([]);
  const theme = useTheme();
  
  useEffect(() => {
    if (posts && posts.length > 0) {
      setLocalPosts(posts);
    } else {
      const fetchPosts = async () => {
        try {
          const response = await fetch('/api/posts');
          if (!response.ok) {
            throw new Error('Failed to fetch posts');
          }
          const data = await response.json();
          setLocalPosts(data);
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      };
      
      fetchPosts();
    }
  }, [posts]);
  
  const renderHTML = (content) => {
    if (!content) return null;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(content);
    const textContent = tempDiv.textContent || tempDiv.innerText;
    let previewText = '';
    if (textContent.length > 150) {
      const lastSpace = textContent.substring(0, 150).lastIndexOf(' ');
      previewText = textContent.substring(0, lastSpace).trim() + '...';
    } else {
      previewText = textContent;
    }
    return { __html: previewText };
  };
  
  if (localPosts.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ color: theme.palette.primary.main, mb: 2 }}>
          EcoTrack Sustentável
        </Typography>
        <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Esse é o nosso espaço para posts sobre sustentabilidade e tecnologia.
        </Typography>
        <Typography>Carregando posts...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: theme.palette.primary.main, mb: 2 }}>
        EcoTrack Sustentável
      </Typography>
      <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
        Esse é o nosso espaço para posts sobre sustentabilidade e tecnologia.
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 3 
      }}>
        {localPosts.map((post) => (
          <Paper
            key={post._id}
            elevation={1}
            sx={{
              p: 3,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontWeight: 'bold',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {post.title}
              </Typography>
              
              {post.subtitle && (
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontStyle: 'italic',
                    mb: 2
                  }}
                >
                  {post.subtitle}
                </Typography>
              )}
            </Box>
            
            {post.image && (
              <Link href={`/posts/${post._id}`} passHref>
                <Box 
                  sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: { xs: 200, sm: 300, md: 400 },
                    mb: 2,
                    cursor: 'pointer',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    src={post.image}
                    alt={`Visualizar: ${post.title}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      p: 1,
                      textAlign: 'center'
                    }}
                  >
                    Clique para ver mais
                  </Box>
                </Box>
              </Link>
            )}
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.text.primary,
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {post.content && (
                post.content
                  .replace(/<br\s*\/?>/gi, '\n')
                  .replace(/<\/?p>/gi, '\n')
                  .replace(/<\/?h[1-5]>/gi, '\n')
                  .replace(/<[^>]*>/g, '')
                  .replace(/\n\s*\n/g, '\n')
                  .replace(/^\s+|\s+$/gm, '')
                  .trim()
                  .split('\n')
                  .filter(line => line.trim() !== '')
                  .slice(0, 3)
                  .join('\n')
                  .substring(0, 150)
                  .split(' ')
                  .slice(0, -1)
                  .join(' ') + '...'
              )}
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ color: theme.palette.text.secondary }}
              >
                {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </Typography>
              
              {post.category && post.category.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {post.category.map((cat, index) => (
                    <Chip
                      key={index}
                      label={cat}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(76, 175, 80, 0.2)' 
                          : 'rgba(46, 125, 50, 0.1)',
                        color: theme.palette.mode === 'dark'
                          ? 'primary.light'
                          : 'primary.main'
                      }}
                    />
                  ))}
                </Box>
              )}
              
              <Link 
                href={`/posts/${post._id}`}
                style={{ 
                  textDecoration: 'none',
                  color: theme.palette.primary.main
                }}
              >
                Ver post completo
              </Link>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}