
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { db } from '../../../db/database';
import type {
  Country,
  PaymentMethod,
  Provider,
  Subagent,
  ProviderTemplate,
} from '../../reports/types';

interface TemplateRow {
  template: ProviderTemplate;
  country?: Country;
  group?: PaymentMethod;
  provider?: Provider;
  subagent?: Subagent;
}

export default function ProviderTemplatesPage() {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [
          templates,
          countries,
          groups,
          providers,
          subagents,
        ] = await Promise.all([
          db.providerTemplates.toArray(),
          db.countries.toArray(),
          db.paymentMethods.toArray(),
          db.providers.toArray(),
          db.subagents.toArray(),
        ]);

        const result: TemplateRow[] = templates.map((template) => ({
          template,
          country: countries.find((x) => x.id === template.countryId),
          group: groups.find((x) => x.id === template.paymentMethodId),
          provider: providers.find((x) => x.id === template.providerId),
          subagent: subagents.find((x) => x.id === template.subagentId),
        }));

        result.sort((a, b) => {
          const countryCompare = (a.country?.name ?? '').localeCompare(
            b.country?.name ?? '',
          );
          if (countryCompare !== 0) return countryCompare;

          const groupCompare = (a.group?.name ?? '').localeCompare(
            b.group?.name ?? '',
          );
          if (groupCompare !== 0) return groupCompare;

          return (a.provider?.name ?? '').localeCompare(
            b.provider?.name ?? '',
          );
        });

        if (!cancelled) setRows(result);
      } catch (err) {
        console.error('Ошибка загрузки шаблонов:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Шаблоны провайдеров
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Заготовленные связки стран, групп оплаты, агентов и субагентов.
      </Typography>

      {rows.length === 0 ? (
        <Alert severity="info">
          Шаблоны не найдены. Проверь начальную конфигурацию.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Страна</TableCell>
                <TableCell>Группа</TableCell>
                <TableCell>Агент</TableCell>
                <TableCell>ID агента</TableCell>
                <TableCell>Субагент</TableCell>
                <TableCell>ID субагента</TableCell>
                <TableCell>Сегмент</TableCell>
                <TableCell>Депозит</TableCell>
                <TableCell>Вывод</TableCell>
                <TableCell>Примечания</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map(({ template, country, group, provider, subagent }) => (
                <TableRow key={template.id} hover>
                  <TableCell>{country?.name ?? '—'}</TableCell>
                  <TableCell>{group?.name ?? '—'}</TableCell>
                  <TableCell>{provider?.name ?? '—'}</TableCell>
                  <TableCell>{provider?.externalId ?? '—'}</TableCell>
                  <TableCell>{subagent?.name ?? '—'}</TableCell>
                  <TableCell>{subagent?.externalId ?? '—'}</TableCell>
                  <TableCell>
                    {template.segmentType === 'primary'
                      ? 'Primary'
                      : template.segmentType === 'secondary'
                        ? 'Secondary'
                        : 'Без сегмента'}
                  </TableCell>
                  <TableCell>
                    {template.depositMin ?? '—'} – {template.depositMax ?? '—'}
                  </TableCell>
                  <TableCell>
                    {template.withdrawalEnabled
                      ? `${template.withdrawalMin ?? '—'} – ${template.withdrawalMax ?? '—'}`
                      : 'Не предусмотрен'}
                  </TableCell>
                  <TableCell>
                    {template.notes?.trim() || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Всего шаблонов: {rows.length}
      </Typography>
    </Box>
  );
}
