import { NavLink, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

export function AppLayout() {
  const navLinkSx = {
    px: 1.5,
    py: 1,
    borderRadius: 1.5,
    color: 'text.secondary',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'background-color 0.2s, color 0.2s',
    '&': {
      bgcolor: 'action.hover',
    },
    '&.active': {
      color: 'primary.main',
      bgcolor: 'action.selected',
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 1.5, flexWrap: 'wrap' }}>
          <DescriptionOutlinedIcon color="primary" />

          <Typography
            variant="h6"
            fontWeight={750}
            sx={{ flexGrow: 1 }}
          >
            Отчёты
          </Typography>

          <Box
            component={NavLink}
            to="/reports"
            sx={navLinkSx}
          >
            Все отчёты
          </Box>

          <Box
            component={NavLink}
            to="/references"
            sx={navLinkSx}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <MenuBookOutlinedIcon fontSize="small" />
              Справочники
            </Box>
          </Box>

          <Box
            component={NavLink}
            to="/templates"
            sx={navLinkSx}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <TuneOutlinedIcon fontSize="small" />
              Шаблоны
            </Box>
          </Box>

        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>

  );
}