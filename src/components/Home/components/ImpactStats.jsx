import { Box, Typography, Paper, Grid } from "@mui/material";

export default function ImpactStats() {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 4, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#2e8b57', fontWeight: 'bold', textAlign: 'center' }}>
        Seu Impacto
      </Typography>
      <Grid container spacing={2} justifyContent="center">
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
  );
}
