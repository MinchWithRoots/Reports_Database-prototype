import Dexie, { type Table } from 'dexie';

import type {
Report,
Country,
PaymentMethod,
Provider,
Subagent,
ReportGroup,
ReportProvider,
ProviderTemplate,
DailyEntry,
} from '../features/reports/types';

export class ReportingDatabase extends Dexie {
reports!: Table<Report, string>;
countries!: Table<Country, string>;
paymentMethods!: Table<PaymentMethod, string>;
providers!: Table<Provider, string>;
subagents!: Table<Subagent, string>;
reportGroups!: Table<ReportGroup, string>;
reportProviders!: Table<ReportProvider, string>;
providerTemplates!: Table<ProviderTemplate, string>;
dailyEntries!: Table<DailyEntry, string>;

constructor() {
super('reporting-spa-db');

this.version(1).stores({
  reports: 'id, mode, periodStart, periodEnd, updatedAt',
  countries: 'id, &name, &code, sortOrder',
  paymentMethods: 'id, &name, sortOrder',
  providers: 'id, &name, sortOrder',
  reportGroups:
    'id, reportId, countryId, paymentMethodId, sortOrder, &[reportId+countryId+paymentMethodId]',
  reportProviders:
    'id, groupId, providerId, segmentType, sortOrder, &[groupId+providerId+segmentType]',
  providerTemplates:
    'id, countryId, paymentMethodId, providerId, segmentType, &[countryId+paymentMethodId+providerId+segmentType]',
  dailyEntries: 'id, reportProviderId, date, &[reportProviderId+date]',
});

this.version(2)
  .stores({
    reports: 'id, mode, periodStart, periodEnd, updatedAt',
    countries: 'id, &name, &code, sortOrder',
    paymentMethods: 'id, &name, sortOrder',
    providers: 'id, &name, externalId, sortOrder',
    subagents: 'id, name, externalId, sortOrder',
    reportGroups:
      'id, reportId, countryId, paymentMethodId, sortOrder, &[reportId+countryId+paymentMethodId]',
    reportProviders:
      'id, groupId, providerId, subagentId, segmentType, sortOrder, &[groupId+providerId+subagentId+segmentType]',
    providerTemplates:
      'id, countryId, paymentMethodId, providerId, subagentId, segmentType, &[countryId+paymentMethodId+providerId+subagentId+segmentType]',
    dailyEntries: 'id, reportProviderId, date, &[reportProviderId+date]',
  })
  .upgrade(async (transaction) => {
    await transaction
      .table('reportProviders')
      .toCollection()
      .modify((item) => {
        if (item.subagentId === undefined || item.subagentId === null) {
          item.subagentId = '';
        }
      });

    await transaction
      .table('providerTemplates')
      .toCollection()
      .modify((item) => {
        if (item.subagentId === undefined || item.subagentId === null) {
          item.subagentId = '';
        }

        if (item.withdrawalEnabled === undefined) {
          item.withdrawalEnabled =
            item.withdrawalMin !== null ||
            item.withdrawalMax !== null;
        }

        if (item.notes === undefined) {
          item.notes = '';
        }
      });
  });

}
}

export const db = new ReportingDatabase();