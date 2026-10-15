import { db } from '../database';
import type {
  Country,
  PaymentMethod,
  Provider,
  Subagent,
} from '../../features/reports/types';
import {
  CountrySchema,
  PaymentMethodSchema,
  ProviderSchema,
} from '../../features/reports/schemas';

function createId(): string {
  return crypto.randomUUID();
}



// Страны

export async function getCountries(): Promise<Country[]> {
  return db.countries.orderBy('sortOrder').toArray();
}

export async function createCountry(
  input: Pick<Country, 'name' | 'code'>,
): Promise<Country> {
  const country: Country = {
    id: createId(),
    name: input.name.trim(),
    code: input.code?.trim() || undefined,
    sortOrder: (await db.countries.count()) + 1,
  };

  const validated = CountrySchema.parse(country);
  await db.countries.add(validated);
  return validated;
}

export async function deleteCountry(id: string): Promise<void> {
  const groups = await db.reportGroups.where('countryId').equals(id).count();
  const templates = await db.providerTemplates.where('countryId').equals(id).count();

  if (groups > 0 || templates > 0) {
    throw new Error(
      'Нельзя удалить страну, которая используется в отчетах или шаблонах.',
    );
  }

  await db.countries.delete(id);
}

// Методы оплаты

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return db.paymentMethods.orderBy('sortOrder').toArray();
}

export async function createPaymentMethod(
  name: string,
): Promise<PaymentMethod> {
  const method: PaymentMethod = {
    id: createId(),
    name: name.trim(),
    sortOrder: (await db.paymentMethods.count()) + 1,
  };

  const validated = PaymentMethodSchema.parse(method);
  await db.paymentMethods.add(validated);
  return validated;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const groups = await db.reportGroups.where('paymentMethodId').equals(id).count();
  const templates = await db.providerTemplates
    .where('paymentMethodId')
    .equals(id)
    .count();

  if (groups > 0 || templates > 0) {
    throw new Error(
      'Нельзя удалить метод оплаты, который используется в отчетах или шаблонах.',
    );
  }

  await db.paymentMethods.delete(id);
}

// Провайдеры

export async function getProviders(): Promise<Provider[]> {
  return db.providers.orderBy('sortOrder').toArray();
}

export async function createProvider(name: string): Promise<Provider> {
  const provider: Provider = {
    id: createId(),
    name: name.trim(),
    sortOrder: (await db.providers.count()) + 1,
  };

  const validated = ProviderSchema.parse(provider);
  await db.providers.add(validated);
  return validated;
}

export async function deleteProvider(id: string): Promise<void> {
  const reportProviders = await db.reportProviders
    .where('providerId')
    .equals(id)
    .count();

  const templates = await db.providerTemplates
    .where('providerId')
    .equals(id)
    .count();

  if (reportProviders > 0 || templates > 0) {
    throw new Error(
      'Нельзя удалить провайдера, который используется в отчетах или шаблонах.',
    );
  }

  await db.providers.delete(id);
}

// Изменение названий

export async function renameCountry(
  id: string,
  name: string,
): Promise<void> {
  const country = await db.countries.get(id);
  if (!country) throw new Error('Страна не найдена.');

  const updated = CountrySchema.parse({
    ...country,
    name: name.trim(),
  });

  await db.countries.put(updated);
}

export async function renamePaymentMethod(
  id: string,
  name: string,
): Promise<void> {
  const method = await db.paymentMethods.get(id);
  if (!method) throw new Error('Метод оплаты не найден.');

  const updated = PaymentMethodSchema.parse({
    ...method,
    name: name.trim(),
  });

  await db.paymentMethods.put(updated);
}

export async function renameProvider(
  id: string,
  name: string,
): Promise<void> {
  const provider = await db.providers.get(id);
  if (!provider) throw new Error('Провайдер не найден.');

  const updated = ProviderSchema.parse({
    ...provider,
    name: name.trim(),
  });

  await db.providers.put(updated);
}


export async function getSubagents(): Promise<Subagent[]> {
  return db.subagents.orderBy('sortOrder').toArray();
}
