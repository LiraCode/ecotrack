'use client';
import { createTheme } from '@mui/material/styles';

export default function getTheme(mode = 'light') {
  return createTheme({
    palette: {
      mode, // 'light' ou 'dark'
    },
    typography: {
      fontFamily: 'var(--font-geist-sans), var(--font-geist-mono), var(--font-cabin), var(--font-crimson)',
    },
  });
}