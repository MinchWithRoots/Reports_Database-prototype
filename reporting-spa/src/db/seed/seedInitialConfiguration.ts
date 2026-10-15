
import { db } from '../database';
import { initialConfiguration } from './initialConfiguration';
import { ProviderTemplateSchema } from '../../features/reports/schemas';

export async function ensureInitialConfigurationLoaded(): Promise<void> {
  await db.transaction(
    'rw',
    db.countries,
    db.paymentMethods,
    db.providers,
    db.subagents,
    db.providerTemplates,
    async () => {
      for (const item of initialConfiguration) {
        // Страна
        let country = await db.countries
          .where('code')
          .equals(item.countryCode)
          .first();

        if (!country) {
          country = await db.countries
            .where('name')
            .equals(item.country)
            .first();
        }

        if (!country) {
          country = {
            id: crypto.randomUUID(),
            name: item.country,
            code: item.countryCode,
            sortOrder: 0,
          };
          await db.countries.add(country);
        } else if (!country.code) {
          country = { ...country, code: item.countryCode };
          await db.countries.put(country);
        }

        // Группа методов оплаты
        let paymentMethod = await db.paymentMethods
          .where('name')
          .equals(item.group)
          .first();

        if (!paymentMethod) {
          paymentMethod = {
            id: crypto.randomUUID(),
            name: item.group,
            sortOrder: 0,
          };
          await db.paymentMethods.add(paymentMethod);
        }

        // Агент
        let provider = await db.providers
          .where('externalId')
          .equals(item.agentExternalId)
          .first();

        if (!provider) {
          provider = await db.providers
            .where('name')
            .equals(item.agent)
            .first();
        }

        if (!provider) {
          provider = {
            id: crypto.randomUUID(),
            name: item.agent,
            externalId: item.agentExternalId,
            sortOrder: 0,
          };
          await db.providers.add(provider);
        } else if (!provider.externalId) {
          provider = {
            ...provider,
            externalId: item.agentExternalId,
          };
          await db.providers.put(provider);
        }

        // Субагент: учитываем одновременно имя и внешний ID
        const allSubagents = await db.subagents.toArray();

        let subagent = allSubagents.find(
          (candidate) =>
            candidate.name === item.subagent &&
            candidate.externalId === item.subagentExternalId,
        );

        if (!subagent) {
          subagent = {
            id: crypto.randomUUID(),
            name: item.subagent,
            externalId: item.subagentExternalId,
            sortOrder: 0,
          };
          await db.subagents.add(subagent);
        }

        // Проверяем, существует ли уже шаблон
        const existingTemplate = await db.providerTemplates
          .where(
            '[countryId+paymentMethodId+providerId+subagentId+segmentType]',
          )
          .equals([
            country.id,
            paymentMethod.id,
            provider.id,
            subagent.id,
            item.segmentType,
          ])
          .first();

        if (existingTemplate) {
          continue;
        }

        const notes = [item.groupNotes, item.notes]
          .filter((value): value is string => Boolean(value?.trim()))
          .join('\n');

        const template = ProviderTemplateSchema.parse({
          id: crypto.randomUUID(),
          countryId: country.id,
          paymentMethodId: paymentMethod.id,
          providerId: provider.id,
          subagentId: subagent.id,
          segmentType: item.segmentType,
          depositMin: null,
          depositMax: null,
          withdrawalMin: null,
          withdrawalMax: null,
          withdrawalEnabled: true,
          successRateDefault: null,
          notes,
          updatedAt: new Date().toISOString(),
        });

        await db.providerTemplates.add(template);
      }
    },
  );
}
