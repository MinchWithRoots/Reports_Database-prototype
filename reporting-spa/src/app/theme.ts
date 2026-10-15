import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3157a4',
    },
    background: {
      default: '#f7f8fa',
      paper: '#ffffff',
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});