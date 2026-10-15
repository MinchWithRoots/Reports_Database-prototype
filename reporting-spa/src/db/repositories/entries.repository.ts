import { db } from '../database';
import { DailyEntrySchema } from '../../features/reports/schemas';
import type { DailyEntry } from '../../features/reports/types';

export async function getEntriesForProvider(
  reportProviderId: string,
): Promise<DailyEntry[]> {
  return db.dailyEntries
    .where('reportProviderId')
    .equals(reportProviderId)
    .sortBy('date');
}

export async function getEntriesForDate(
  reportProviderId: string,
  date: string,
): Promise<DailyEntry | undefined> {
  return db.dailyEntries
    .where('[reportProviderId+date]')
    .equals([reportProviderId, date])
    .first();
}

export async function createEntryFromTemplate(
  reportProviderId: string,
  date: string,
): Promise<DailyEntry> {
  return db.transaction(
    'rw',
    db.reportProviders,
    db.reportGroups,
    db.providerTemplates,
    db.dailyEntries,
    async () => {
      const provider = await db.reportProviders.get(reportProviderId);

      if (!provider) {
        throw new Error('Провайдер не найден в отчёте.');
      }

      const group = await db.reportGroups.get(provider.groupId);

      if (!group) {
        throw new Error('Группа отчёта не найдена.');
      }

      const existingEntry = await db.dailyEntries
        .where('[reportProviderId+date]')
        .equals([reportProviderId, date])
        .first();

      if (existingEntry) {
        throw new Error(
          'Запись для этого агента на выбранную дату уже существует.',
        );
      }

      const template = await db.providerTemplates
        .where(
          '[countryId+paymentMethodId+providerId+subagentId+segmentType]',
        )
        .equals([
          group.countryId,
          group.paymentMethodId,
          provider.providerId,
          provider.subagentId,
          provider.segmentType,
        ])
        .first();

      const previousEntries = await db.dailyEntries
        .where('reportProviderId')
        .equals(reportProviderId)
        .filter((entry) => entry.date < date)
        .toArray();

      const previousEntry = previousEntries.sort((a, b) =>
        b.date.localeCompare(a.date),
      )[0];

      const entry = DailyEntrySchema.parse({
        id: crypto.randomUUID(),
        reportProviderId,
        date,
        successRate: null,
        successRateStatus: 'no_data',

        depositMin: previousEntry
          ? previousEntry.depositMin
          : (template?.depositMin ?? null),

        depositMax: previousEntry
          ? previousEntry.depositMax
          : (template?.depositMax ?? null),

        withdrawalMin: provider.withdrawalEnabled
          ? previousEntry
            ? previousEntry.withdrawalMin
            : (template?.withdrawalMin ?? null)
          : null,

        withdrawalMax: provider.withdrawalEnabled
          ? previousEntry
            ? previousEntry.withdrawalMax
            : (template?.withdrawalMax ?? null)
          : null,

        updatedAt: new Date().toISOString(),
      });

      await db.dailyEntries.add(entry);

      return entry;
    },
  );
}

export async function updateDailyEntry(
  id: string,
  changes: Partial<
    Pick<
      DailyEntry,
      | 'successRate'
      | 'successRateStatus'
      | 'depositMin'
      | 'depositMax'
      | 'withdrawalMin'
      | 'withdrawalMax'
    >
  >,
): Promise<DailyEntry> {
  return db.transaction('rw', db.dailyEntries, async () => {
    const existing = await db.dailyEntries.get(id);

    if (!existing) {
      throw new Error('Дневная запись не найдена.');
    }

    const normalizedChanges = {
      ...changes,
      ...(changes.successRate != null
        ? { successRate: Math.max(0, Math.min(100, Math.round(changes.successRate))) }
        : {}),
    };

    const updated = DailyEntrySchema.parse({
      ...existing,
      ...normalizedChanges,
      updatedAt: new Date().toISOString(),
    });

    await db.dailyEntries.put(updated);

    return updated;
  });
}

export async function deleteDailyEntry(id: string): Promise<void> {
  await db.dailyEntries.delete(id);
}
