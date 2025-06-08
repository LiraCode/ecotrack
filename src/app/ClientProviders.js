'use client';
import { useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import getTheme from './theme';

function MuiThemeWrapper({ children }) {
  const { theme } = useTheme();
  const muiTheme = getTheme(theme);

  return (
    <MuiThemeProvider theme={muiTheme}>
      {children}
    </MuiThemeProvider>
  );
}

export default function ClientProviders({ children }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider>
        <MuiThemeWrapper>
          {children}
        </MuiThemeWrapper>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}