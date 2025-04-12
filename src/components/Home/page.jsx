'use client';
import { useState, useEffect } from "react";
import { 
  Box, Typography, Paper, Button, Dialog, DialogTitle, 
  DialogContent, DialogContentText, DialogActions,
  Grid, Card, CardContent, CardMedia, CardActionArea,
  Chip, Divider, Avatar, List, ListItem, ListItemAvatar, 
  ListItemText, IconButton, Container, Tabs, Tab
} from "@mui/material";
import { 
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon,
  EmojiEvents as EmojiEventsIcon,
  Recycling as RecyclingIcon,
  ElectricBolt as ElectricBoltIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import '@/app/styles/globals.css';
import wasteData from "@/data/wasteData";
import { ecoPointsData } from "@/data/ecoPointsData";
import useLocalStorage from "@/hooks/useLocalStorage";
import Meta from "./Meta";
import Blog from "./Blog";
import mockPosts from "@/data/mockPost";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [schedules, setSchedules] = useLocalStorage("ecotrack-schedules", []);
  const [goals, setGoals] = useLocalStorage("ecotrack-goals", [
    { id: 1, title: "Reduzir o uso de plástico em 50% até 2025", completed: false },
    { id: 2, title: "Reciclar 10kg de papel este mês", completed: false },
    { id: 3, title: "Descartar corretamente 5 itens eletrônicos", completed: true }
  ]);

  
  const [latestPosts, setLatestPosts] = useState(() => {
    // Sort by ID in descending order (assuming higher ID means more recent)
    return [...mockPosts]
      .sort((a, b) => b.id - a.id) // Sort by ID in descending order
      .slice(0, 2); // Take only the two most recent posts (highest IDs)
  });
   
  const handleOpenDialog = (wasteType) => {
    setSelectedWaste(wasteType);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Sample upcoming schedules
  const upcomingSchedules = [
    { id: 1, location: "Ecoponto - Pajuçara", date: "15 Jun 2023", time: "14:00", type: "Eletrônicos" },
    { id: 2, location: "Ecoponto - Tabuleiro", date: "22 Jun 2023", time: "10:30", type: "Plástico e Papel" }
  ];

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          position: 'relative',
          height: '400px',
          mb: 6,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundImage: 'url(/images/main1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            EcoTrack
          </Typography>
          <Typography variant="h5" sx={{ color: 'white', mb: 4, maxWidth: '600px' }}>
            Conectando você aos pontos de coleta para um descarte consciente e sustentável
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              backgroundColor: '#2e8b57', 
              '&:hover': { backgroundColor: '#1f6b47' },
              px: 4,
              py: 1.5
            }}
          >
            Encontrar Ecopontos
          </Button>
        </Container>
      </Paper>

      {/* Main Content Tabs */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            textColor="primary"
            indicatorColor="primary"
            centered
            sx={{ 
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#555',
                '&.Mui-selected': { color: '#2e8b57' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#2e8b57' }
            }}
          >
            <Tab label="Início" />
            <Tab label="Ecopontos" />
            <Tab label="Guia de Resíduos" />
          </Tabs>
        </Box>

        {/* Home Tab */}
        {activeTab === 0 && (
          <Box sx={{ py: 4 }}>
            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid item xs={12} md={8}>

{/* Latest Blog Posts - Centered */}
<Box sx={{ mb: 6 }}>
  <Typography 
    variant="h5" 
    sx={{ 
      mb: 3, 
      color: '#2e8b57', 
      fontWeight: 'bold', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center' // Center the heading
    }}
  >
    <ArticleIcon sx={{ mr: 1 }} /> Últimas Dicas Ecológicas
  </Typography>
  
  <Box sx={{ maxWidth: '900px', mx: 'auto' }}> {/* Center container with max width */}
    <Grid container spacing={3} justifyContent="center"> {/* Center the grid items */}
      {latestPosts.map(post => (
        <Grid item xs={12} sm={6} md={5} key={post.id}> {/* Adjusted width for better centering */}
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardActionArea>
              <CardMedia
                component="img"
                height="180" // Slightly larger image
                image={post.image || "/image/main1.jpg"}
                alt={post.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold',
                    textAlign: 'center' // Center the title
                  }}
                >
                  {post.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, textAlign: 'center' }} // Center the excerpt
                >
                  {post.excerpt}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '1px solid #e0e0e0',
                  pt: 2
                }}>
                  <Typography variant="caption" color="text.secondary">
                    {post.date}
                  </Typography>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: '#2e8b57' }}
                  >
                    Ler mais
                  </Button>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
    
    {/* View All Posts button - centered */}
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
      <Button 
        variant="outlined" 
        endIcon={<ArrowForwardIcon />}
        sx={{ 
          color: '#2e8b57', 
          borderColor: '#2e8b57',
          '&:hover': { 
            borderColor: '#1f6b47', 
            backgroundColor: '#e8f5e9' 
          }
        }}
      >
        Ver Todas as Publicações
      </Button>
    </Box>
  </Box>
</Box>


                {/* Waste Classification Preview */}
                <Paper elevation={1} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <RecyclingIcon sx={{ mr: 1 }} /> Classificação de Resíduos
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.keys(wasteData).slice(0, 3).map((item) => (
                      <Grid item xs={12} sm={4} key={item}>
                        <Card sx={{ height: '100%' }}>
                          <CardActionArea onClick={() => handleOpenDialog(item)}>
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {item}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {wasteData[item].description.substring(0, 80)}...
                              </Typography>
                              <Chip 
                                label={`Decomposição: ${wasteData[item].decomposition}`} 
                                size="small" 
                                sx={{ backgroundColor: '#e8f5e9', color: '#2e8b57' }}
                              />
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setActiveTab(2)}
                      sx={{ 
                        color: '#2e8b57', 
                        borderColor: '#2e8b57',
                        '&:hover': { borderColor: '#1f6b47', backgroundColor: '#e8f5e9' }
                      }}
                    >
                      Ver todos os tipos de resíduos
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={4}>
                {/* Upcoming Schedules */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} /> Próximos Agendamentos
                  </Typography>
                  {upcomingSchedules.length > 0 ? (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                      {upcomingSchedules.map((schedule) => (
                        <ListItem
                          key={schedule.id}
                          secondaryAction={
                            <IconButton edge="end" aria-label="details" sx={{ color: '#2e8b57' }}>
                              <ArrowForwardIcon />
                            </IconButton>
                          }
                          sx={{ 
                            mb: 1, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1,
                            '&:hover': { backgroundColor: '#f5f5f5' }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#e8f5e9' }}>
                              {schedule.type.includes('Eletrônico') ? 
                                <ElectricBoltIcon sx={{ color: '#2e8b57' }} /> : 
                                <RecyclingIcon sx={{ color: '#2e8b57' }} />
                              }
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={schedule.location}
                            secondary={
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {schedule.date}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {schedule.time}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum agendamento próximo
                      </Typography>
                      <Button 
                        variant="contained" 
                        sx={{ 
                          mt: 2,
                          backgroundColor: '#2e8b57', 
                          '&:hover': { backgroundColor: '#1f6b47' }
                        }}
                      >
                        Agendar Coleta
                      </Button>
                    </Box>
                  )}
                </Paper>

                {/* Goals */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <EmojiEventsIcon sx={{ mr: 1 }} /> Minhas Metas
                  </Typography>
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {goals.map((goal) => (
                      <ListItem
                        key={goal.id}
                        sx={{ 
                          mb: 1, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          backgroundColor: goal.completed ? '#e8f5e9' : 'white',
                          '&:hover': { backgroundColor: goal.completed ? '#d7ecd9' : '#f5f5f5' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: goal.completed ? '#2e8b57' : '#e0e0e0' }}>
                            <EmojiEventsIcon sx={{ color: goal.completed ? 'white' : '#757575' }} />
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={goal.title}
                          secondary={
                            <Chip 
                              size="small" 
                              label={goal.completed ? "Concluído" : "Em andamento"} 
                              sx={{ 
                                backgroundColor: goal.completed ? '#2e8b57' : '#fafafa',
                                color: goal.completed ? 'white' : '#757575',
                                borderColor: goal.completed ? '#2e8b57' : '#e0e0e0',
                                border: '1px solid'
                              }} 
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        color: '#2e8b57', 
                        borderColor: '#2e8b57',
                        '&:hover': { borderColor: '#1f6b47', backgroundColor: '#e8f5e9' }
                      }}
                    >
                      Adicionar Nova Meta
                    </Button>
                  </Box>
                </Paper>

                {/* Quick Stats */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2e8b57', fontWeight: 'bold' }}>
                    Seu Impacto
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#2e8b57', fontWeight: 'bold' }}>
                          12kg
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resíduos reciclados
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#2e8b57', fontWeight: 'bold' }}>
                          3
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Coletas realizadas
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Ecopoints Tab */}
        {activeTab === 1 && (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1 }} /> Ecopontos Disponíveis
            </Typography>
            <Grid container spacing={3}>
              {ecoPointsData.map((point, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {point.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <LocationOnIcon sx={{ color: '#2e8b57', mr: 1, fontSize: 20, mt: 0.3 }} />
                        <Typography variant="body2" color="text.secondary">
                          {point.address}
                        </Typography>
                      </Box>
                      <Chip 
                        label={point.region} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#e8f5e9', 
                          color: '#2e8b57',
                          mt: 1
                        }}
                      />
                    </CardContent>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                      <Button 
                        size="small" 
                        startIcon={<CalendarTodayIcon />}
                        sx={{ color: '#2e8b57' }}
                      >
                        Agendar
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained"
                        sx={{ 
                          backgroundColor: '#2e8b57', 
                          '&:hover': { backgroundColor: '#1f6b47' }
                        }}
                      >
                        Ver no Mapa
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Waste Guide Tab */}
        {activeTab === 2 && (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <RecyclingIcon sx={{ mr: 1 }} /> Guia de Resíduos
            </Typography>
            <Grid container spacing={3}>
              {Object.keys(wasteData).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => handleOpenDialog(item)}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2e8b57' }}>
                          {item}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {wasteData[item].description}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={`Decomposição: ${wasteData[item].decomposition}`} 
                            size="small" 
                            sx={{ backgroundColor: '#e8f5e9', color: '#2e8b57' }}
                          />
                          <Button 
                            size="small" 
                            endIcon={<ArrowForwardIcon />}
                            sx={{ color: '#2e8b57' }}
                          >
                            Detalhes
                          </Button>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Dialog with detailed information */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          color: '#2e8b57', 
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RecyclingIcon sx={{ mr: 1 }} />
            Informações sobre: {selectedWaste}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedWaste && (
            <>
              <DialogContentText sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                  Descrição:
                </Typography>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  {wasteData[selectedWaste].description}
                </Typography>
              </DialogContentText>
              
              <DialogContentText sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                  Tempo de decomposição:
                </Typography>
                <Chip 
                  label={wasteData[selectedWaste].decomposition}
                  sx={{ 
                    backgroundColor: '#e8f5e9', 
                    color: '#2e8b57',
                    fontWeight: 'bold'
                  }}
                />
              </DialogContentText>
              
              <DialogContentText>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                  Dica de reciclagem:
                </Typography>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ color: '#555' }}>
                    {wasteData[selectedWaste].recyclingTip}
                  </Typography>
                </Paper>
              </DialogContentText>
              
              <Box sx={{ mt: 4, p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e8b57', mb: 1 }}>
                  Onde descartar:
                </Typography>
                <Typography variant="body2">
                  Você pode descartar este tipo de resíduo em qualquer Ecoponto da cidade.
                  Clique abaixo para agendar uma coleta ou encontrar o Ecoponto mais próximo.
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{ 
              color: '#2e8b57',
              borderColor: '#2e8b57',
              '&:hover': { borderColor: '#1f6b47', backgroundColor: '#e8f5e9' }
            }}
          >
            Fechar
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              backgroundColor: '#2e8b57', 
              '&:hover': { backgroundColor: '#1f6b47' }
            }}
          >
            Agendar Coleta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
