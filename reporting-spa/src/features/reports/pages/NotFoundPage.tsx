import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h4" component="h1">
        Страница не найдена
      </Typography>

      <Button
        component={Link}
        to="/reports"
        variant="contained"
      >
        Вернуться к отчётам
      </Button>
    </Stack>
  );
}