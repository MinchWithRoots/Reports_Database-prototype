
import { db } from '../database';
import { ReportProviderSchema } from '../../features/reports/schemas';
import type {
  ReportProvider,
  SegmentType,
} from '../../features/reports/types';

export interface CreateReportProviderInput {
  groupId: string;
  providerId: string;
  subagentId: string;
  segmentType: SegmentType;
  withdrawalEnabled: boolean;
}

export async function getReportProviders(
  groupId: string,
): Promise<ReportProvider[]> {
  return db.reportProviders
    .where('groupId')
    .equals(groupId)
    .sortBy('sortOrder');
}

export async function createReportProvider(
  input: CreateReportProviderInput,
): Promise<ReportProvider> {
  return db.transaction(
    'rw',
    db.reportGroups,
    db.providers,
    db.subagents,
    db.reportProviders,
    async () => {
      const group = await db.reportGroups.get(input.groupId);

      if (!group) {
        throw new Error('Группа отчёта не найдена.');
      }

      const provider = await db.providers.get(input.providerId);

      if (!provider) {
        throw new Error('Выбранный агент не найден в справочнике.');
      }

      if (input.subagentId) {
        const subagent = await db.subagents.get(input.subagentId);

        if (!subagent) {
          throw new Error('Выбранный субагент не найден в справочнике.');
        }
      }

      const existing = await db.reportProviders
        .where('[groupId+providerId+subagentId+segmentType]')
        .equals([
          input.groupId,
          input.providerId,
          input.subagentId,
          input.segmentType,
        ])
        .first();

      if (existing) {
        throw new Error(
          'Такая комбинация агента, субагента и сегмента уже есть в группе.',
        );
      }

      const item = ReportProviderSchema.parse({
        id: crypto.randomUUID(),
        groupId: input.groupId,
        providerId: input.providerId,
        subagentId: input.subagentId,
        segmentType: input.segmentType,
        sortOrder:
          (await db.reportProviders
            .where('groupId')
            .equals(input.groupId)
            .count()) + 1,
        withdrawalEnabled: input.withdrawalEnabled,
      });

      await db.reportProviders.add(item);

      return item;
    },
  );
}

export async function deleteReportProvider(
  reportProviderId: string,
): Promise<void> {
  await db.transaction(
    'rw',
    db.reportProviders,
    db.dailyEntries,
    async () => {
      await db.dailyEntries
        .where('reportProviderId')
        .equals(reportProviderId)
        .delete();

      await db.reportProviders.delete(reportProviderId);
    },
  );
}
