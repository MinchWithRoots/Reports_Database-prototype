
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useNavigate } from 'react-router-dom';

import {
  createReport,
  getAllReports,
} from '../../../db/repositories/reports.repository';
import type { Report, ReportMode } from '../types';

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

export function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<ReportMode>('periodic');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  async function loadReports() {
    setLoading(true);
    setError('');

    try {
      const result = await getAllReports();
      setReports(result);
    } catch (err) {
      console.error('Не удалось загрузить отчёты:', err);
      setError('Не удалось загрузить отчёты из локальной базы данных.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  function openCreateDialog() {
    setTitle('');
    setMode('periodic');
    setPeriodStart('');
    setPeriodEnd('');
    setError('');
    setDialogOpen(true);
  }

  function closeCreateDialog() {
    if (saving) return;
    setDialogOpen(false);
    setError('');
  }

  async function handleCreateReport() {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError('Введите название отчёта.');
      return;
    }

    if (!periodStart) {
      setError('Укажите дату начала отчёта.');
      return;
    }

    if (mode === 'periodic' && !periodEnd) {
      setError('Укажите дату окончания отчёта.');
      return;
    }

    if (
      mode === 'periodic' &&
      periodEnd &&
      periodEnd < periodStart
    ) {
      setError('Дата окончания не может быть раньше даты начала.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await createReport({
        title: normalizedTitle,
        mode,
        periodStart,
        periodEnd: mode === 'periodic' ? periodEnd : null,
      });

      const result = await getAllReports();
      setReports(result);
      setDialogOpen(false);
    } catch (err) {
      console.error('Не удалось создать отчёт:', err);
      setError(
        'Не удалось сохранить отчёт. Проверьте данные и попробуйте ещё раз.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Отчёты
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Создание и управление периодическими и долгосрочными отчётами.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={openCreateDialog}
        >
          Создать отчёт
        </Button>
      </Box>

      {error && !dialogOpen && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void loadReports()}>
              Повторить
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            minHeight: 280,
            display: 'grid',
            placeItems: 'center',
            p: 4,
            borderStyle: 'dashed',
          }}
        >
          <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center' }}>
            <DescriptionOutlinedIcon
              sx={{ fontSize: 44, color: 'text.secondary' }}
            />

            <Typography variant="h6">
              Пока нет отчётов
            </Typography>

            <Typography color="text.secondary" maxWidth={460}>
              Создайте первый отчёт, чтобы начать вести показатели по странам,
              способам оплаты и провайдерам.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={openCreateDialog}
              sx={{ mt: 1 }}
            >
              Создать первый отчёт
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {reports.map((report) => (
            <Paper
              key={report.id}
              variant="outlined"
              onClick={() => navigate(`/reports/${report.id}`)}
              sx={{
                p: { xs: 2, sm: 2.5 },
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box>
                  <Typography variant="h6">
                    {report.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Начало: {formatDate(report.periodStart)}
                    {report.mode === 'periodic' && report.periodEnd
                      ? ` · Окончание: ${formatDate(report.periodEnd)}`
                      : ' · Без даты окончания'}
                  </Typography>
                </Box>

                <Chip
                  label={
                    report.mode === 'periodic'
                      ? 'Периодический'
                      : 'Долгосрочный'
                  }
                  variant="outlined"
                  color={report.mode === 'periodic' ? 'primary' : 'default'}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeCreateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Создать отчёт</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="Название отчёта"
              placeholder="Например, Taiwan — октябрь"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              fullWidth
              required
              autoFocus
              disabled={saving}
            />

            <TextField
              select
              label="Тип отчёта"
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as ReportMode);
                setError('');
              }}
              fullWidth
              disabled={saving}
            >
              <MenuItem value="periodic">
                Периодический
              </MenuItem>
              <MenuItem value="continuous">
                Долгосрочный — без даты окончания
              </MenuItem>
            </TextField>

            <TextField
              label="Дата начала"
              type="date"
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
              disabled={saving}
            />

            {mode === 'periodic' && (
              <TextField
                label="Дата окончания"
                type="date"
                value={periodEnd}
                onChange={(event) => setPeriodEnd(event.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: periodStart || undefined },
                }}
                fullWidth
                required
                disabled={saving}
              />
            )}

            {mode === 'continuous' && (
              <Alert severity="info">
                У долгосрочного отчёта нет фиксированной даты окончания.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeCreateDialog} disabled={saving}>
            Отмена
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleCreateReport()}
            disabled={saving}
          >
            {saving ? 'Сохранение…' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
