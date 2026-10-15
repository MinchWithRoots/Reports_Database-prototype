import { DailyEntriesEditor } from './DailyEntriesEditor';
import { useCallback, useEffect, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Chip,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import {
    createReportProvider,
    deleteReportProvider,
    getReportProviders,
} from '../../../db/repositories/report-providers.repository';

import type {
    Country,
    PaymentMethod,
    Provider,
    ReportGroup,
    ReportProvider,
    SegmentType,
    Subagent,
} from '../types';

interface Props {
    initialDate: string;
    group: ReportGroup;
    country?: Country;
    paymentMethod?: PaymentMethod;
    providers: Provider[];
    subagents: Subagent[];
    onDeleteGroup: (groupId: string) => void;
}

const segmentOptions: { value: SegmentType; label: string }[] = [
    { value: 'none', label: 'Без сегмента' },
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
];

export function ReportGroupCard({
    group,
    country,
    paymentMethod,
    providers,
    subagents,
    initialDate,
    onDeleteGroup,
}: Props) {
    const [items, setItems] = useState<ReportProvider[]>([]);
    const [providerId, setProviderId] = useState(providers[0]?.id ?? '');
    const [subagentId, setSubagentId] = useState('');
    const [segmentType, setSegmentType] = useState<SegmentType>('none');
    const [withdrawalEnabled, setWithdrawalEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadItems = useCallback(async () => {
        setLoading(true);

        try {
            setItems(await getReportProviders(group.id));
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить провайдеров группы.');
        } finally {
            setLoading(false);
        }
    }, [group.id]);

    useEffect(() => {
        void loadItems();
    }, [loadItems]);

    async function handleAdd() {
        if (!providerId) {
            setError('Добавьте агента в справочник и выберите его.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await createReportProvider({
                groupId: group.id,
                providerId,
                subagentId,
                segmentType,
                withdrawalEnabled,
            });

            setItems(await getReportProviders(group.id));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось добавить провайдера.',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(itemId: string) {
        if (
            !window.confirm(
                'Удалить эту комбинацию из отчёта вместе с её дневными показателями?',
            )
        ) {
            return;
        }

        setError('');

        try {
            await deleteReportProvider(itemId);
            setItems(await getReportProviders(group.id));
        } catch (err) {
            console.error(err);
            setError('Не удалось удалить провайдера.');
        }
    }

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack spacing={2.5}>
                <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography variant="h6">
                            {country?.name ?? 'Неизвестная страна'}
                            {' · '}
                            {paymentMethod?.name ?? 'Неизвестный способ оплаты'}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Провайдеров: {items.length}
                        </Typography>
                    </Box>

                    <IconButton
                        aria-label="Удалить группу"
                        color="error"
                        onClick={() => onDeleteGroup(group.id)}
                    >
                        <DeleteOutlineOutlinedIcon />
                    </IconButton>
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}

                <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                        Добавить провайдера
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            select
                            label="Агент / провайдер"
                            value={providerId}
                            onChange={(event) => setProviderId(event.target.value)}
                            fullWidth
                            disabled={saving || providers.length === 0}
                        >
                            {providers.map((provider) => (
                                <MenuItem key={provider.id} value={provider.id}>
                                    {provider.name}
                                    {provider.externalId ? ` (${provider.externalId})` : ''}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Субагент"
                            value={subagentId}
                            onChange={(event) => setSubagentId(event.target.value)}
                            fullWidth
                            disabled={saving}
                        >
                            <MenuItem value="">Без субагента</MenuItem>
                            {subagents.map((subagent) => (
                                <MenuItem key={subagent.id} value={subagent.id}>
                                    {subagent.name}
                                    {subagent.externalId ? ` (${subagent.externalId})` : ''}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Тип клиента"
                            value={segmentType}
                            onChange={(event) =>
                                setSegmentType(event.target.value as SegmentType)
                            }
                            fullWidth
                            disabled={saving}
                        >
                            {segmentOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={withdrawalEnabled}
                                    onChange={(event) =>
                                        setWithdrawalEnabled(event.target.checked)
                                    }
                                    disabled={saving}
                                />
                            }
                            label="Вывод средств включён"
                        />

                        {providers.length === 0 && (
                            <Alert severity="warning">
                                Сначала добавьте провайдера в справочнике.
                            </Alert>
                        )}

                        <Box>
                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={() => void handleAdd()}
                                disabled={saving || providers.length === 0 || !providerId}
                            >
                                Добавить в группу
                            </Button>
                        </Box>
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        Провайдеры группы
                    </Typography>

                    {loading ? (
                        <Typography color="text.secondary">Загрузка…</Typography>
                    ) : items.length === 0 ? (
                        <Typography color="text.secondary">
                            Провайдеры пока не добавлены.
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {items.map((item) => {
                                const provider = providers.find(
                                    (candidate) => candidate.id === item.providerId,
                                );
                                const subagent = subagents.find(
                                    (candidate) => candidate.id === item.subagentId,
                                );
                                const segmentLabel =
                                    segmentOptions.find(
                                        (option) => option.value === item.segmentType,
                                    )?.label ?? item.segmentType;

                                return (
                                    <Paper
                                        key={item.id}
                                        variant="outlined"
                                        sx={{ p: 1.5 }}
                                    >
                                        <Stack spacing={2}>
                                            <Stack
                                                direction={{ xs: 'column', sm: 'row' }}
                                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                justifyContent="space-between"
                                                spacing={1}
                                            >
                                                <Box>
                                                    <Typography fontWeight={600}>
                                                        {provider?.name ?? 'Неизвестный провайдер'}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary">
                                                        {subagent?.name ?? 'Без субагента'}
                                                    </Typography>

                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        useFlexGap
                                                        flexWrap="wrap"
                                                        sx={{ mt: 1 }}
                                                    >
                                                        <Chip
                                                            size="small"
                                                            label={segmentLabel}
                                                            variant="outlined"
                                                        />

                                                        <Chip
                                                            size="small"
                                                            label={
                                                                item.withdrawalEnabled
                                                                    ? 'Вывод включён'
                                                                    : 'Вывод отключён'
                                                            }
                                                            color={
                                                                item.withdrawalEnabled ? 'success' : 'default'
                                                            }
                                                            variant="outlined"
                                                        />
                                                    </Stack>
                                                </Box>

                                                <Button
                                                    color="error"
                                                    size="small"
                                                    onClick={() => void handleDelete(item.id)}
                                                >
                                                    Удалить
                                                </Button>
                                            </Stack>

                                            <DailyEntriesEditor
                                                reportProviderId={item.id}
                                                withdrawalEnabled={item.withdrawalEnabled}
                                                initialDate={initialDate}
                                            />
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
}
