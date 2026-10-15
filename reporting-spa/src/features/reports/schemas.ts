import { z } from 'zod';

const idSchema = z.string().min(1);
const dateSchema = z.iso.date();
const nullableAmount = z.number().finite().nonnegative().nullable();
const segmentSchema = z.enum(['none', 'primary', 'secondary']);

function validateRanges(
  data: {
    depositMin: number | null;
    depositMax: number | null;
    withdrawalMin: number | null;
    withdrawalMax: number | null;
  },
  ctx: z.RefinementCtx,
) {
  const ranges = [
    ['depositMin', 'depositMax', 'депозита'],
    ['withdrawalMin', 'withdrawalMax', 'вывода'],
  ] as const;

  for (const [minKey, maxKey, label] of ranges) {
    const min = data[minKey];
    const max = data[maxKey];

    if (min !== null && max !== null && min > max) {
      ctx.addIssue({
        code: 'custom',
        path: [maxKey],
        message: `Максимум ${label} не может быть меньше минимума`,
      });
    }

  }
}

export const ReportSchema = z
  .object({
    id: idSchema,
    title: z.string().trim().min(1),
    mode: z.enum(['periodic', 'continuous']),
    periodStart: dateSchema,
    periodEnd: dateSchema.nullable(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .superRefine((report, ctx) => {
    if (report.mode === 'periodic' && !report.periodEnd) {
      ctx.addIssue({
        code: 'custom',
        path: ['periodEnd'],
        message: 'Для периодического отчёта укажите дату окончания',
      });
    }

    if (report.mode === 'continuous' && report.periodEnd !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['periodEnd'],
        message: 'У долгосрочного отчёта нет даты окончания',
      });
    }

    if (report.periodEnd && report.periodEnd < report.periodStart) {
      ctx.addIssue({
        code: 'custom',
        path: ['periodEnd'],
        message: 'Дата окончания не может быть раньше начала',
      });
    }

  });

export const CountrySchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  code: z.string().optional(),
  sortOrder: z.number().int(),
});

export const PaymentMethodSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  sortOrder: z.number().int(),
});

export const ProviderSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  externalId: z.string().nullable().optional(),
  sortOrder: z.number().int(),
});

export const SubagentSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  externalId: z.string().nullable(),
  sortOrder: z.number().int(),
});

export const ReportGroupSchema = z.object({
  id: idSchema,
  reportId: idSchema,
  countryId: idSchema,
  paymentMethodId: idSchema,
  sortOrder: z.number().int(),
  notes: z.string().optional(),
});

export const ReportProviderSchema = z.object({
  id: idSchema,
  groupId: idSchema,
  providerId: idSchema,
  subagentId: z.string(),
  segmentType: segmentSchema,
  sortOrder: z.number().int(),
  withdrawalEnabled: z.boolean(),
});

export const ProviderTemplateSchema = z
  .object({
    id: idSchema,
    countryId: idSchema,
    paymentMethodId: idSchema,
    providerId: idSchema,
    subagentId: z.string(),
    segmentType: segmentSchema,
    depositMin: nullableAmount,
    depositMax: nullableAmount,
    withdrawalMin: nullableAmount,
    withdrawalMax: nullableAmount,
    successRateDefault: z.number().min(0).max(100).nullable(),
    withdrawalEnabled: z.boolean(),
    notes: z.string(),
    updatedAt: z.string().min(1),
  })
  .superRefine((template, ctx) => {
    validateRanges(template, ctx);

    if (
      !template.withdrawalEnabled &&
      (template.withdrawalMin !== null || template.withdrawalMax !== null)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['withdrawalEnabled'],
        message: 'Если вывод отключён, диапазон вывода должен быть пустым',
      });
    }

  });

export const DailyEntrySchema = z
  .object({
    id: idSchema,
    reportProviderId: idSchema,
    date: dateSchema,
    successRate: z.number().int().min(0).max(100).nullable(),
    successRateStatus: z.enum(['value', 'no_data']),
    depositMin: nullableAmount,
    depositMax: nullableAmount,
    withdrawalMin: nullableAmount,
    withdrawalMax: nullableAmount,
    updatedAt: z.string().min(1),
  })
  .superRefine((entry, ctx) => {
    if (entry.successRateStatus === 'value' && entry.successRate === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['successRate'],
        message: 'Укажите процент либо выберите отсутствие данных',
      });
    }

    if (
      entry.successRateStatus === 'no_data' &&
      entry.successRate !== null
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['successRate'],
        message: 'При отсутствии данных процент должен быть пустым',
      });
    }

    validateRanges(entry, ctx);

  });