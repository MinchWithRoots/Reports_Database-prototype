
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';

import { theme } from './app/theme';
import { router } from './app/router';
import { ensureInitialConfigurationLoaded } from './db/seed/seedInitialConfiguration';

import './index.css';

async function startApp() {
  await ensureInitialConfigurationLoaded();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>,
  );
}

void startApp();
