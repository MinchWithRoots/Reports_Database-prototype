import { db } from '../database';
import type { ProviderTemplate } from '../../features/reports/types';
import { ProviderTemplateSchema } from '../../features/reports/schemas';

export type ProviderTemplateInput = Omit<
    ProviderTemplate,
    'id' | 'updatedAt'
>
;

export async function getAllProviderTemplates(): Promise<ProviderTemplate[]> {
    return db.providerTemplates.toArray();
}

export async function getProviderTemplate(
    countryId: string,
    paymentMethodId: string,
    providerId: string,
    segmentType: ProviderTemplate['segmentType'],
    subagentId = '',
): Promise<ProviderTemplate | undefined> {
    return db.providerTemplates
        .where('[countryId+paymentMethodId+providerId+subagentId+segmentType]')
        .equals([
            countryId,
            paymentMethodId,
            providerId,
            subagentId,
            segmentType,
        ])
        .first();
}

export async function saveProviderTemplate(
    input: ProviderTemplateInput,
): Promise<ProviderTemplate> {
    const existing = await getProviderTemplate(
        input.countryId,
        input.paymentMethodId,
        input.providerId,
        input.segmentType,
        input.subagentId,
    );

    const template = ProviderTemplateSchema.parse({
        ...input,
        id: existing?.id ?? crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
    });

    await db.providerTemplates.put(template);

    return template;
}

export async function deleteProviderTemplate(id: string): Promise<void> {
    await db.providerTemplates.delete(id);
}