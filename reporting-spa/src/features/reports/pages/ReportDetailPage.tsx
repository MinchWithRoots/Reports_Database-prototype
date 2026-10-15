import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

import { getReport } from '../../../db/repositories/reports.repository';
import {
    getCountries,
    getPaymentMethods,
    getProviders,
    getSubagents,
} from '../../../db/repositories/reference.repository';
import {
    createReportGroup,
    deleteReportGroup,
    getReportGroups,
} from '../../../db/repositories/report-groups.repository';

import type {
    Country,
    PaymentMethod,
    Provider,
    Report,
    ReportGroup,
    Subagent,
} from '../types';

import { ReportGroupCard } from './ReportGroupCard';

export function ReportDetailPage() {
    const { reportId } = useParams<{ reportId: string }>();
    const navigate = useNavigate();

    const [report, setReport] = useState<Report | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [subagents, setSubagents] = useState<Subagent[]>([]);
    const [groups, setGroups] = useState<ReportGroup[]>([]);

    const [selectedCountryId, setSelectedCountryId] = useState('');
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');

    const [loading, setLoading] = useState(true);
    const [savingGroup, setSavingGroup] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        if (!reportId) {
            setError('Не указан идентификатор отчёта.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const [
                loadedReport,
                loadedCountries,
                loadedPaymentMethods,
                loadedGroups,
                loadedProviders,
                loadedSubagents,
            ] = await Promise.all([
                getReport(reportId),
                getCountries(),
                getPaymentMethods(),
                getReportGroups(reportId),
                getProviders(),
                getSubagents(),
            ]);

            if (!loadedReport) {
                setReport(null);
                setError('Отчёт не найден.');
                return;
            }

            setReport(loadedReport);
            setCountries(loadedCountries);
            setPaymentMethods(loadedPaymentMethods);
            setGroups(loadedGroups);
            setProviders(loadedProviders);
            setSubagents(loadedSubagents);

            setSelectedCountryId((current) =>
                loadedCountries.some((item) => item.id === current)
                    ? current
                    : loadedCountries[0]?.id ?? '',
            );

            setSelectedPaymentMethodId((current) =>
                loadedPaymentMethods.some((item) => item.id === current)
                    ? current
                    : loadedPaymentMethods[0]?.id ?? '',
            );
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить данные отчёта.',
            );
        } finally {
            setLoading(false);
        }
    }, [reportId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleCreateGroup = async () => {
        if (!reportId || !selectedCountryId || !selectedPaymentMethodId) {
            setError('Выберите страну и способ оплаты.');
            return;
        }

        setSavingGroup(true);
        setError('');

        try {
            await createReportGroup({
                reportId,
                countryId: selectedCountryId,
                paymentMethodId: selectedPaymentMethodId,
            });

            setGroups(await getReportGroups(reportId));
        } catch (createError) {
            setError(
                createError instanceof Error
                    ? createError.message
                    : 'Не удалось создать группу.',
            );
        } finally {
            setSavingGroup(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!window.confirm('Удалить группу и все связанные с ней записи?')) {
            return;
        }

        setError('');

        try {
            await deleteReportGroup(groupId);

            if (reportId) {
                setGroups(await getReportGroups(reportId));
            }
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Не удалось удалить группу.',
            );
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!report) {
        return (
            <Stack spacing={2}>
                <Alert severity="error">{error || 'Отчёт не найден.'}</Alert>
                <Box>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/reports')}
                    >
                        К списку отчётов
                    </Button>
                </Box>
            </Stack>
        );
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/reports')}
                    sx={{ mb: 1 }}
                >
                    К списку отчётов
                </Button>

                <Typography variant="h4" component="h1">
                    {report.title}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {report.mode === 'periodic'
                        ? 'Периодический отчёт'
                        : 'Непрерывный отчёт'}
                    {' · '}
                    Начало периода: {report.periodStart}
                    {report.periodEnd ? ` · Конец периода: ${report.periodEnd}` : ''}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">
                        Добавить группу
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Группа объединяет страну и способ оплаты. Внутри неё можно
                        настроить агентов, субагентов и сегменты.
                    </Typography>

                    <TextField
                        select
                        label="Страна"
                        value={selectedCountryId}
                        onChange={(event) => setSelectedCountryId(event.target.value)}
                        fullWidth
                        disabled={countries.length === 0}
                    >
                        {countries.map((country) => (
                            <MenuItem key={country.id} value={country.id}>
                                {country.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Способ оплаты"
                        value={selectedPaymentMethodId}
                        onChange={(event) =>
                            setSelectedPaymentMethodId(event.target.value)
                        }
                        fullWidth
                        disabled={paymentMethods.length === 0}
                    >
                        {paymentMethods.map((method) => (
                            <MenuItem key={method.id} value={method.id}>
                                {method.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {(countries.length === 0 || paymentMethods.length === 0) && (
                        <Alert severity="warning">
                            Чтобы создавать группы, сначала добавьте страны и способы
                            оплаты в справочниках.
                        </Alert>
                    )}

                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => void handleCreateGroup()}
                            disabled={
                                savingGroup ||
                                !selectedCountryId ||
                                !selectedPaymentMethodId
                            }
                        >
                            {savingGroup ? 'Добавление…' : 'Добавить группу'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            <Stack spacing={2}>
                <Typography variant="h5" component="h2">
                    Группы отчёта ({groups.length})
                </Typography>

                {groups.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography color="text.secondary">
                            Групп пока нет. Выберите страну и способ оплаты, чтобы добавить
                            первую группу.
                        </Typography>
                    </Paper>
                ) : (
                    groups.map((group) => (
                        <ReportGroupCard
                            key={group.id}
                            group={group}
                            country={countries.find((item) => item.id === group.countryId)}
                            paymentMethod={paymentMethods.find(
                                (item) => item.id === group.paymentMethodId,
                            )}
                            providers={providers}
                            subagents={subagents}
                            initialDate={report.periodStart}
                            onDeleteGroup={(groupId) => void handleDeleteGroup(groupId)}
                        />
                    ))
                )}
            </Stack>
        </Stack>
    );
}