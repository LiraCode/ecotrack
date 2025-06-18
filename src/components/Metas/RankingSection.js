'use client'
import React from 'react';
import { Typography, Paper, useTheme, useMediaQuery, Box } from '@mui/material'
import '@/app/styles/globals.css';
import { useAuth } from '@/context/AuthContext';

const RankingSection = ({ ranking }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Garantir que ranking é um array, mesmo que seja undefined
  const safeRanking = Array.isArray(ranking) ? ranking : [];
  
  // console.log("RankingSection recebeu:", ranking);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: { xs: 3, md: 4 },
        bgcolor: theme.palette.background.paper
      }}
    >
      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        sx={{ 
          mb: { xs: 2, md: 3 }, 
          fontWeight: 'bold', 
          textAlign: 'center',
          color: theme.palette.text.primary
        }}
      >
        Ranking
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-end',
        gap: { xs: 1, md: 2 },
        mb: { xs: 3, md: 4 }
      }}>
        {/* Segundo lugar (prata) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            width: { xs: 64, md: 80 }, 
            height: { xs: 64, md: 80 },
            bgcolor: theme.palette.mode === 'dark' ? '#A9A9A9' : 'grey.300',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            boxShadow: 2
          }}>
            <i className={`fa-solid fa-medal ${isMobile ? 'text-2xl' : 'text-3xl'}`} 
               style={{ color: theme.palette.mode === 'dark' ? '#E0E0E0' : theme.palette.grey[50] }}></i>
          </Box>
          <Box sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? '#808080' : 'grey.200',
            p: { xs: 1, md: 2 },
            borderRadius: 1,
            boxShadow: 1,
            transform: 'hover:scale-105',
            transition: 'transform 0.2s'
          }}>
            <Typography 
              sx={{ 
                fontWeight: 500,
                fontSize: isMobile ? '0.875rem' : '1rem',
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'grey.800'
              }}
            >
              {safeRanking[1]?.name || 'Carregando...'}
            </Typography>
            <Typography 
              sx={{ 
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                color: theme.palette.mode === 'dark' ? '#E0E0E0' : 'grey.600'
              }}
            >
              {safeRanking[1]?.totalPoints || 0} pts
            </Typography>
          </Box>
        </Box>
        
        {/* Primeiro lugar (ouro) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            width: { xs: 80, md: 96 }, 
            height: { xs: 80, md: 96 },
            bgcolor: theme.palette.mode === 'dark' ? '#FFD700' : '#FFD700',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            boxShadow: 3,
            border: 2,
            borderColor: theme.palette.mode === 'dark' ? '#FFC107' : '#FFC107'
          }}>
            <i className={`fa-solid fa-trophy-star ${isMobile ? 'text-3xl' : 'text-4xl'}`}
               style={{ color: theme.palette.mode === 'dark' ? '#B8860B' : '#B8860B' }}></i>
          </Box>
          <Box sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? '#4B3621' : '#FFF8E1',
            p: { xs: 1, md: 2 },
            borderRadius: 1,
            boxShadow: 2,
            transform: 'hover:scale-105',
            transition: 'transform 0.2s'
          }}>
            <Typography 
              sx={{ 
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.125rem',
                color: theme.palette.mode === 'dark' ? '#FFD700' : '#B8860B'
              }}
            >
              {safeRanking[0]?.name || 'Carregando...'}
            </Typography>
            <Typography 
              sx={{ 
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? '#FFD700' : '#B8860B'
              }}
            >
              {safeRanking[0]?.totalPoints || 0} pts
            </Typography>
          </Box>
        </Box>
        
        {/* Terceiro lugar (bronze) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            width: { xs: 56, md: 64 }, 
            height: { xs: 56, md: 64 },
            bgcolor: theme.palette.mode === 'dark' ? '#CD7F32' : '#CD7F32',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            boxShadow: 2
          }}>
            <i className={`fa-solid fa-medal ${isMobile ? 'text-xl' : 'text-2xl'}`}
               style={{ color: theme.palette.mode === 'dark' ? '#FFE4B5' : '#FFF8E1' }}></i>
          </Box>
          <Box sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? '#8B4513' : '#FFF3E0',
            p: { xs: 1, md: 2 },
            borderRadius: 1,
            boxShadow: 1,
            transform: 'hover:scale-105',
            transition: 'transform 0.2s'
          }}>
            <Typography 
              sx={{ 
                fontWeight: 500,
                fontSize: isMobile ? '0.875rem' : '1rem',
                color: theme.palette.mode === 'dark' ? '#FFE4B5' : '#8B4513'
              }}
            >
              {safeRanking[2]?.name || 'Carregando...'}
            </Typography>
            <Typography 
              sx={{ 
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                color: theme.palette.mode === 'dark' ? '#FFE4B5' : '#8B4513'
              }}
            >
              {safeRanking[2]?.totalPoints || 0} pts
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Lista completa */}
      <Box sx={{ minWidth: '100%', overflow: 'hidden' }}>
        <Box component="table" sx={{ minWidth: '100%' }}>
          <Box component="thead" sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.50' }}>
            <Box component="tr">
              <Box component="th" sx={{ 
                px: { xs: 1, md: 3 }, 
                py: 1.5,
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.palette.text.secondary
              }}>
                Posição
              </Box>
              <Box component="th" sx={{ 
                px: { xs: 1, md: 3 }, 
                py: 1.5,
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.palette.text.secondary
              }}>
                Usuário
              </Box>
              <Box component="th" sx={{ 
                px: { xs: 1, md: 3 }, 
                py: 1.5,
                textAlign: 'right',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.palette.text.secondary
              }}>
                Pontos
              </Box>
            </Box>
          </Box>
          <Box component="tbody" sx={{ 
            bgcolor: theme.palette.background.paper,
            '& tr': {
              borderBottom: 1,
              borderColor: theme.palette.divider
            }
          }}>
            {safeRanking.length > 0 ? (
              safeRanking.map((item) => (
                <Box 
                  component="tr" 
                  key={item.clientId} 
                  sx={{ 
                    bgcolor: item.isCurrentUser ? 
                      (theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)') : 
                      'transparent'
                  }}
                >
                  <Box component="td" sx={{ 
                    px: { xs: 1, md: 3 }, 
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900'
                  }}>
                    {item.position}
                  </Box>
                  <Box component="td" sx={{ 
                    px: { xs: 1, md: 3 }, 
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 150
                      }}>
                        {item.name}
                      </Typography>
                      {item.isCurrentUser && (
                        <Typography 
                          sx={{ 
                            ml: 0.5,
                            fontSize: '0.75rem',
                            color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark'
                          }}
                        >
                          (Você)
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box component="td" sx={{ 
                    px: { xs: 1, md: 3 }, 
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                    textAlign: 'right'
                  }}>
                    {item.totalPoints}
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box component="td" colSpan={3} sx={{ 
                  px: { xs: 1, md: 3 }, 
                  py: 2,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: theme.palette.text.secondary
                }}>
                  Carregando ranking...
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

// Componente de carregamento para exibir quando o ranking não estiver disponível
const LoadingRanking = () => {
  return (
    <Paper elevation={3} className="p-6 mb-8">
      <Typography variant="h5" className="mb-6 font-bold text-center">
        Ranking
      </Typography>
      <div className="text-center p-8">
        <Typography variant="body1" color="textSecondary">
          Carregando ranking...
        </Typography>
      </div>
    </Paper>
  );
}

export default RankingSection;
