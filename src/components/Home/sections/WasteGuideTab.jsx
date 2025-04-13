import { Box, Typography, Grid, Card, CardActionArea, CardContent, Divider, Chip, Button } from "@mui/material";
import { Recycling as RecyclingIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import wasteData from "@/data/wasteData";

export default function WasteGuideTab({ handleOpenDialog }) {
  return (
    <Box sx={{ py: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RecyclingIcon sx={{ mr: 1 }} /> Guia de Resíduos
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {Object.keys(wasteData).map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => handleOpenDialog(item)}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2e8b57', textAlign: 'center' }}>
                    {item}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    {wasteData[item].description}
                  </Typography>
                  <Divider sx={{ my: 2, width: '100%' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Chip 
                      label={`Decomposição: ${wasteData[item].decomposition}`} 
                      size="small" 
                      sx={{ backgroundColor: '#e8f5e9', color: '#2e8b57' }}
                    />
                    <Typography variant="body2" sx={{ color: '#2e8b57', fontWeight: 'bold' }}>
                      Toque no Card para mais informações
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
