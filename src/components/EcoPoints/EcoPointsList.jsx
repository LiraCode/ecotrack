import React from 'react';
import { 
  List, 
  ListItem, 
  Typography, 
  Box, 
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  LocationOn as LocationOnIcon
} from '@mui/icons-material';

const EcoPointsList = ({ points, activeMarker, onMarkerClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const safePoints = Array.isArray(points) ? points : [];
  
  if (safePoints.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Nenhum ecoponto encontrado.
        </Typography>
      </Box>
    );
  }
  
  return (
    <List sx={{ width: '100%', p: 0 }}>
      {safePoints.map((point, index) => (
        <React.Fragment key={point.id || index}>
          <ListItem
            onClick={() => onMarkerClick(point)}
            sx={{
              py: 2,
              px: { xs: 2, sm: 3 },
              bgcolor: activeMarker === point.name 
                ? theme.palette.mode === 'dark' 
                  ? 'rgba(76,175,80,0.2)' 
                  : '#e8f5e9' 
                : 'background.paper',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(76,175,80,0.15)' 
                  : '#f1f8e9',
                cursor: 'pointer',
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(76,175,80,0.2)'
                  : '0 2px 8px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <LocationOnIcon 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? 'primary.light' : '#2e8b57', 
                    mr: 2,
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    mt: 0.5
                  }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    sx={{
                      fontWeight: activeMarker === point.name ? 700 : 600,
                      color: theme.palette.mode === 'dark' ? 'primary.light' : '#2e8b57',
                      mb: 0.5
                    }}
                  >
                    {point.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      mb: 0.5
                    }}
                  >
                    {point.address}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      display: 'block'
                    }}
                  >
                    {point.region}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.mode === 'dark' ? 'primary.light' : 'text.secondary',
                  mt: 1,
                  ml: 'auto',
                  fontStyle: 'italic'
                }}
              >
                Toque para ver no mapa
              </Typography>
            </Box>
          </ListItem>
          {index < safePoints.length - 1 && (
            <Divider />
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default EcoPointsList;
