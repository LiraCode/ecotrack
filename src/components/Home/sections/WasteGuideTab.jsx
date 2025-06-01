import { Box, Typography, Grid, Card, CardActionArea, CardContent, Divider, Chip, useTheme, useMediaQuery } from "@mui/material";
import { Recycling as RecyclingIcon } from '@mui/icons-material';
import wasteData from "@/data/wasteData";

export default function WasteGuideTab({ handleOpenDialog }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      py: isMobile ? 2 : 4, 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        sx={{ 
          mb: isMobile ? 2 : 3, 
          color: '#2e8b57', 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: isMobile ? '1.2rem' : undefined
        }}
      >
        <RecyclingIcon sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : undefined }} /> 
        Guia de Resíduos
      </Typography>
      <Grid 
        container 
        spacing={isMobile ? 2 : 3} 
        justifyContent="center"
      >
        {Object.keys(wasteData).map((item) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={item}
          >
            <Card 
              sx={{ 
                height: '100%',
                ...(isMobile && {
                  maxWidth: '400px',
                  margin: '0 auto'
                })
              }}
            >
              <CardActionArea onClick={() => handleOpenDialog(item)}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: isMobile ? 2 : 3
                }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: isMobile ? 1.5 : 2, 
                      color: '#2e8b57', 
                      textAlign: 'center',
                      fontSize: isMobile ? '1.1rem' : undefined
                    }}
                  >
                    {item}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: isMobile ? 1.5 : 2, 
                      textAlign: 'center',
                      fontSize: isMobile ? '0.875rem' : undefined,
                      color: 'text.secondary'
                    }}
                  >
                    {wasteData[item].description}
                  </Typography>
                  <Divider sx={{ my: isMobile ? 1.5 : 2, width: '100%' }} />
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    width: '100%',
                    gap: isMobile ? 1 : 0
                  }}>
                    <Chip 
                      label={`Decomposição: ${wasteData[item].decomposition}`} 
                      size={isMobile ? "small" : "medium"}
                      sx={{ 
                        backgroundColor: '#e8f5e9', 
                        color: '#2e8b57',
                        fontSize: isMobile ? '0.75rem' : undefined,
                        mb: isMobile ? 1 : 0
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#2e8b57', 
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.75rem' : undefined,
                        textAlign: 'center'
                      }}
                    >
                      Toque para mais informações
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
