'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/Layout/page';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Button,
  Container
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'dompurify';

export default function SinglePostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${id}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);


  const renderHTML = (content) => {
    if (!content) return null;
    return { __html: DOMPurify.sanitize(content) };
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Link href="/posts" passHref>
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{
              mb: 3,
              color: '#2e8b57',
              '&:hover': {
                backgroundColor: 'rgba(46, 139, 87, 0.08)'
              }
            }}
          >
            Voltar para Posts
          </Button>
        </Link>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress color="success" />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Erro ao carregar o post
            </Typography>
            <Typography variant="body1">
              {error}
            </Typography>
          </Paper>
        ) : post ? (
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {post.image && (
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: '200px', md: '400px' },
                  mb: 3,
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </Box>
            )}

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: '#2e8b57'
              }}
            >
              {post.title}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ fontSize: 20, mr: 0.5, color: '#757575' }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(post.createdAt || post.date).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>

              {post.author && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ fontSize: 20, mr: 0.5, color: '#757575' }} />
                  <Typography variant="body2" color="text.secondary">
                    {post.author.name}
                  </Typography>
                </Box>
              )}

              {post.categories && post.categories.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.categories.map((category, index) => (
                    <Chip
                      key={index}
                      label={category}
                      size="small"
                      sx={{
                        backgroundColor: '#e8f5e9',
                        color: '#2e8b57'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
              variant="body1"
              sx={{
                lineHeight: 1.7,
                '& p': { mb: 2 },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  my: 2
                },
                '& h2, & h3': {
                  mt: 4,
                  mb: 2,
                  color: '#2e8b57',
                  fontWeight: 'bold'
                },
                '& ul, & ol': {
                  pl: 4,
                  mb: 2
                },
                '& li': {
                  mb: 1
                },
                '& blockquote': {
                  borderLeft: '4px solid #2e8b57',
                  pl: 2,
                  py: 1,
                  my: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '0 4px 4px 0'
                }
              }}
            />



            {post.tags && post.tags.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#2e8b57',
                        color: '#2e8b57'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Post não encontrado
            </Typography>
            <Typography variant="body1">
              O post que você está procurando não existe ou foi removido.
            </Typography>
          </Paper>
        )}
      </Container>
    </AppLayout>
  );
}