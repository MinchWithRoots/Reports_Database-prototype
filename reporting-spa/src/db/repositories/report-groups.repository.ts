
import { db } from '../database';
import { ReportGroupSchema } from '../../features/reports/schemas';
import type { ReportGroup } from '../../features/reports/types';

export interface CreateReportGroupInput {
  reportId: string;
  countryId: string;
  paymentMethodId: string;
  notes?: string;
}

export async function getReportGroups(
  reportId: string,
): Promise<ReportGroup[]> {
  return db.reportGroups
    .where('reportId')
    .equals(reportId)
    .sortBy('sortOrder');
}

export async function createReportGroup(
  input: CreateReportGroupInput,
): Promise<ReportGroup> {
  return db.transaction(
    'rw',
    db.reports,
    db.countries,
    db.paymentMethods,
    db.reportGroups,
    async () => {
      const report = await db.reports.get(input.reportId);

      if (!report) {
        throw new Error('Отчёт не найден.');
      }

      const country = await db.countries.get(input.countryId);

      if (!country) {
        throw new Error('Выбранная страна не найдена.');
      }

      const paymentMethod = await db.paymentMethods.get(
        input.paymentMethodId,
      );

      if (!paymentMethod) {
        throw new Error('Выбранный способ оплаты не найден.');
      }

      const existing = await db.reportGroups
        .where('[reportId+countryId+paymentMethodId]')
        .equals([
          input.reportId,
          input.countryId,
          input.paymentMethodId,
        ])
        .first();

      if (existing) {
        throw new Error(
          'Эта страна и способ оплаты уже добавлены в отчёт.',
        );
      }

      const group = ReportGroupSchema.parse({
        id: crypto.randomUUID(),
        reportId: input.reportId,
        countryId: input.countryId,
        paymentMethodId: input.paymentMethodId,
        sortOrder:
          (await db.reportGroups
            .where('reportId')
            .equals(input.reportId)
            .count()) + 1,
        notes: input.notes?.trim() || undefined,
      });

      await db.reportGroups.add(group);

      return group;
    },
  );
}

export async function deleteReportGroup(
  groupId: string,
): Promise<void> {
  await db.transaction(
    'rw',
    db.reportGroups,
    db.reportProviders,
    db.dailyEntries,
    async () => {
      const providers = await db.reportProviders
        .where('groupId')
        .equals(groupId)
        .toArray();

      const providerIds = providers.map((provider) => provider.id);

      if (providerIds.length > 0) {
        await db.dailyEntries
          .where('reportProviderId')
          .anyOf(providerIds)
          .delete();

        await db.reportProviders
          .where('groupId')
          .equals(groupId)
          .delete();
      }

      await db.reportGroups.delete(groupId);
    },
  );
}
