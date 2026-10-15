import { db } from '../database';
import { ReportSchema } from '../../features/reports/schemas';
import type { Report, ReportMode } from '../../features/reports/types';

interface CreateReportInput {
  title: string;
  mode: ReportMode;
  periodStart: string;
  periodEnd: string | null;
}

export async function createReport(
  input: CreateReportInput,
): Promise<Report> {
  const now = new Date().toISOString();

  const report = ReportSchema.parse({
    id: crypto.randomUUID(),
    title: input.title,
    mode: input.mode,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    createdAt: now,
    updatedAt: now,
  });

  await db.reports.add(report);

  return report;
}

export async function getReport(
  id: string,
): Promise<Report | undefined> {
  return db.reports.get(id);
}

export async function getAllReports(): Promise<Report[]> {
  return db.reports.orderBy('updatedAt').reverse().toArray();
}

export async function updateReport(
  id: string,
  changes: Partial<
    Pick<Report, 'title' | 'mode' | 'periodStart' | 'periodEnd'>
  >,
): Promise<Report> {
  const existing = await db.reports.get(id);

  if (!existing) {
    throw new Error('Отчёт не найден');
  }

  const updated = ReportSchema.parse({
    ...existing,
    ...changes,
    updatedAt: new Date().toISOString(),
  });

  await db.reports.put(updated);

  return updated;
}

export async function deleteReport(id: string): Promise<void> {
  await db.transaction(
    'rw',
    db.reports,
    db.reportGroups,
    db.reportProviders,
    db.dailyEntries,
    async () => {
      const groups = await db.reportGroups
        .where('reportId')
        .equals(id)
        .toArray();

      const groupIds = groups.map((group) => group.id);

      const reportProviders = groupIds.length
        ? await db.reportProviders
            .where('groupId')
            .anyOf(groupIds)
            .toArray()
        : [];

      const reportProviderIds = reportProviders.map(
        (provider) => provider.id,
      );

      if (reportProviderIds.length) {
        await db.dailyEntries
          .where('reportProviderId')
          .anyOf(reportProviderIds)
          .delete();
      }

      if (groupIds.length) {
        await db.reportProviders
          .where('groupId')
          .anyOf(groupIds)
          .delete();
      }

      await db.reportGroups.where('reportId').equals(id).delete();
      await db.reports.delete(id);
    },
  );
}