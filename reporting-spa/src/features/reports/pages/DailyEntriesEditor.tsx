import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
    createEntryFromTemplate,
    deleteDailyEntry,
    getEntriesForProvider,
    updateDailyEntry,
} from '../../../db/repositories/entries.repository';

import type { DailyEntry } from '../types';

interface Props {
    reportProviderId: string;
    withdrawalEnabled: boolean;
    initialDate: string;
}

type NumericField =
    | 'successRate'
    | 'depositMin'
    | 'depositMax'
    | 'withdrawalMin'
    | 'withdrawalMax';

function formatNumber(value: number | null): string {
    return value == null ? '' : String(value);
}

export function DailyEntriesEditor({
    reportProviderId,
    withdrawalEnabled,
    initialDate,
}: Props) {
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadEntries = useCallback(async () => {
        setLoading(true);

        try {
            setEntries(await getEntriesForProvider(reportProviderId));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить дневные показатели.',
            );
        } finally {
            setLoading(false);
        }
    }, [reportProviderId]);

    useEffect(() => {
        void loadEntries();
    }, [loadEntries]);

    useEffect(() => {
        setSelectedDate(initialDate);
    }, [initialDate]);

    async function handleCreate() {
        if (!selectedDate) {
            setError('Выберите дату.');
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');

        try {
            await createEntryFromTemplate(reportProviderId, selectedDate);
            await loadEntries();
            setMessage(`Запись за ${selectedDate} создана.`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось создать дневную запись.',
            );
        } finally {
            setSaving(false);
        }
    }

    function changeLocalValue(
        entryId: string,
        field: NumericField,
        rawValue: string,
    ) {
        if (rawValue.trim() === '') {
            setEntries((current) =>
                current.map((entry) => {
                    if (entry.id !== entryId) return entry;

                    if (field === 'successRate') {
                        return {
                            ...entry,
                            successRate: null,
                            successRateStatus: 'no_data',
                        };
                    }

                    return { ...entry, [field]: null };
                }),
            );

            return;
        }

        const value = Number(rawValue);

        if (!Number.isFinite(value)) return;

        const normalizedValue =
            field === 'successRate'
                ? Math.max(0, Math.min(100, Math.round(value)))
                : value;

        setEntries((current) =>
            current.map((entry) => {
                if (entry.id !== entryId) return entry;

                if (field === 'successRate') {
                    return {
                        ...entry,
                        successRate: normalizedValue,
                        successRateStatus: 'value',
                    };
                }

                return { ...entry, [field]: normalizedValue };
            }),
        );
    }

    async function saveEntry(entry: DailyEntry) {
        setError('');
        setMessage('');

        try {
            const updated = await updateDailyEntry(entry.id, {
                successRate: entry.successRate,
                successRateStatus: entry.successRateStatus,
                depositMin: entry.depositMin,
                depositMax: entry.depositMax,
                withdrawalMin: withdrawalEnabled ? entry.withdrawalMin : null,
                withdrawalMax: withdrawalEnabled ? entry.withdrawalMax : null,
            });

            setEntries((current) =>
                current.map((item) => (item.id === updated.id ? updated : item)),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить показатели.',
            );

            await loadEntries();
        }
    }

    async function handleDelete(entry: DailyEntry) {
        if (!window.confirm(`Удалить дневную запись за ${entry.date}?`)) {
            return;
        }

        setError('');
        setMessage('');

        try {
            await deleteDailyEntry(entry.id);
            setEntries((current) =>
                current.filter((item) => item.id !== entry.id),
            );
            setMessage(`Запись за ${entry.date} удалена.`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить запись.',
            );
        }
    }

    function renderNumberField(
        entry: DailyEntry,
        field: NumericField,
        label: string,
        min?: number,
        max?: number,
    ) {
        return (
            <TextField
                label={label}
                type="number"
                size="small"
                value={formatNumber(entry[field])}
                onChange={(event) =>
                    changeLocalValue(entry.id, field, event.target.value)
                }
                onBlur={() => {
                    const current =
                        entries.find((item) => item.id === entry.id) ?? entry;

                    void saveEntry(current);
                }}
                slotProps={{
                    htmlInput: {
                        min,
                        max,
                        step: 1,
                    },
                }}
                sx={{ minWidth: 135, flex: '1 1 135px' }}
            />
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Дневные показатели
            </Typography>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                sx={{ mb: 2 }}
            >
                <TextField
                    label="Дата"
                    type="date"
                    size="small"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ minWidth: 170 }}
                />

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => void handleCreate()}
                    disabled={saving || !selectedDate}
                >
                    Создать запись
                </Button>

                {saving && <CircularProgress size={22} />}
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                    {error}
                </Alert>
            )}

            {message && (
                <Alert
                    severity="success"
                    onClose={() => setMessage('')}
                    sx={{ mb: 1.5 }}
                >
                    {message}
                </Alert>
            )}

            {loading ? (
                <CircularProgress size={24} />
            ) : entries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Дневных записей пока нет. Выберите дату и нажмите «Создать запись».
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {entries.map((entry) => (
                        <Paper key={entry.id} variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={2}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Typography fontWeight={600}>{entry.date}</Typography>

                                    <IconButton
                                        aria-label={`Удалить запись за ${entry.date}`}
                                        color="error"
                                        onClick={() => void handleDelete(entry)}
                                        size="small"
                                    >
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </Stack>

                                <Typography variant="caption" color="text.secondary">
                                    Конверсия — целое число от 0 до 100. Пустое значение означает
                                    отсутствие данных.
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1.5,
                                    }}
                                >
                                    {renderNumberField(
                                        entry,
                                        'successRate',
                                        'Конверсия, %',
                                        0,
                                        100,
                                    )}

                                    {renderNumberField(entry, 'depositMin', 'Депозит от', 0)}

                                    {renderNumberField(entry, 'depositMax', 'Депозит до', 0)}

                                    {withdrawalEnabled && (
                                        <>
                                            {renderNumberField(entry, 'withdrawalMin', 'Вывод от', 0)}

                                            {renderNumberField(entry, 'withdrawalMax', 'Вывод до', 0)}
                                        </>
                                    )}
                                </Box>

                                <Typography variant="caption" color="text.secondary">
                                    {entry.successRateStatus === 'no_data'
                                        ? 'Конверсия: нет данных.'
                                        : `Конверсия: ${entry.successRate}%`}
                                    {' '}Изменения сохраняются при выходе из поля.
                                </Typography>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
