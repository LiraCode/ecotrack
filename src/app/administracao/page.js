'use client';

import AppLayout from '@/components/Layout/page';
import { Box } from '@mui/material';

export default function Administracao({}) {

return (
  <AppLayout>
    <Box
    sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <h1>Administração</h1>
    </Box>

  </AppLayout>
);
}
