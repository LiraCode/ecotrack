'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@/components/ThemeProvider';
import theme, { darkTheme } from './theme';

export default function ClientProviders({ children }) {
  const { theme: darkMode } = useTheme();

  return (
    <MuiThemeProvider theme={darkMode === 'dark' ? darkTheme : theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}
