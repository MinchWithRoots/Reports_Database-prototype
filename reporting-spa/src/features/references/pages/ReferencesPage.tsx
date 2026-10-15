import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';

import type {
  Country,
  PaymentMethod,
  Provider,
} from '../../reports/types';

import {
  createCountry,
  createPaymentMethod,
  createProvider,
  deleteCountry,
  deletePaymentMethod,
  deleteProvider,
  getCountries,
  getPaymentMethods,
  getProviders,
  renameCountry,
  renamePaymentMethod,
  renameProvider,
} from '../../../db/repositories/reference.repository';

type ReferenceItem = {
  id: string;
  name: string;
  sortOrder: number;
};

type ReferenceSectionProps<T extends ReferenceItem> = {
  title: string;
  items: T[];
  loading: boolean;
  showCode?: boolean;
  onCreate: (name: string, code?: string) => Promise<unknown>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
};

function ReferenceSection<T extends ReferenceItem>({
  title,
  items,
  loading,
  showCode = false,
  onCreate,
  onRename,
  onDelete,
  onRefresh,
}: ReferenceSectionProps<T>) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editing, setEditing] = useState<T | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) {
      setError('Введите название.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onCreate(name.trim(), code.trim() || undefined);
      setName('');
      setCode('');
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось добавить запись.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRename() {
    if (!editing || !editName.trim()) {
      setError('Введите новое название.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onRename(editing.id, editName.trim());
      setEditing(null);
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось изменить название.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: T) {
    const confirmed = window.confirm(
      `Удалить «${item.name}»?`,
    );

    if (!confirmed) return;

    setError('');

    try {
      await onDelete(item.id);
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось удалить запись.',
      );
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{title}</Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'flex-start' }}
        >
          <TextField
            label="Название"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleCreate();
            }}
            fullWidth
            size="small"
          />

          {showCode && (
            <TextField
              label="Код страны"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Например, NL"
              size="small"
              sx={{ minWidth: { sm: 180 } }}
            />
          )}

          <Button
            variant="contained"
            onClick={() => void handleCreate()}
            disabled={saving || !name.trim()}
            sx={{ whiteSpace: 'nowrap', minHeight: 40 }}
          >
            Добавить
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Записей пока нет. Добавьте первую запись выше.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
            {items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 2, py: 1.5 }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography>{item.name}</Typography>

                  {showCode && (item as Country).code && (
                    <Typography variant="body2" color="text.secondary">
                      Код: {(item as Country).code}
                    </Typography>
                  )}
                </Box>

                <IconButton
                  aria-label={`Изменить ${item.name}`}
                  onClick={() => {
                    setEditing(item);
                    setEditName(item.name);
                    setError('');
                  }}
                >
                  <EditOutlined />
                </IconButton>

                <IconButton
                  aria-label={`Удалить ${item.name}`}
                  color="error"
                  onClick={() => void handleDelete(item)}
                >
                  <DeleteOutline />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Изменить название</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleRename();
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditing(null)}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleRename()}
            disabled={saving || !editName.trim()}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default function ReferencesPage() {
  const [tab, setTab] = useState(0);

  const [countries, setCountries] = useState<Country[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [countryData, methodData, providerData] = await Promise.all([
        getCountries(),
        getPaymentMethods(),
        getProviders(),
      ]);

      setCountries(countryData);
      setPaymentMethods(methodData);
      setProviders(providerData);
      setPageError('');
    } catch {
      setPageError('Не удалось загрузить справочники из локальной базы.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Справочники
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Управление странами, методами оплаты и провайдерами.
        Данные хранятся локально в этом браузере.
      </Typography>

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {pageError}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Разделы справочников"
        >
          <Tab label="Страны" />
          <Tab label="Методы оплаты" />
          <Tab label="Провайдеры" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <ReferenceSection
          title="Страны"
          items={countries}
          loading={loading}
          showCode
          onCreate={(name, code) => createCountry({ name, code })}
          onRename={renameCountry}
          onDelete={deleteCountry}
          onRefresh={refresh}
        />
      )}

      {tab === 1 && (
        <ReferenceSection
          title="Методы оплаты"
          items={paymentMethods}
          loading={loading}
          onCreate={(name) => createPaymentMethod(name)}
          onRename={renamePaymentMethod}
          onDelete={deletePaymentMethod}
          onRefresh={refresh}
        />
      )}

      {tab === 2 && (
        <ReferenceSection
          title="Провайдеры"
          items={providers}
          loading={loading}
          onCreate={(name) => createProvider(name)}
          onRename={renameProvider}
          onDelete={deleteProvider}
          onRefresh={refresh}
        />
      )}
    </Box>
  );
}