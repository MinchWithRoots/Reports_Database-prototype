import type { SegmentType } from '../../features/reports/types';

export interface InitialConfigurationItem {
  country: string;
  countryCode: string;
  group: string;
  groupNotes?: string;
  agent: string;
  agentExternalId: string;
  subagent: string;
  subagentExternalId: string;
  segmentType: SegmentType;
  notes?: string;
}

export const initialConfiguration: InitialConfigurationItem[] = [
  // Тайвань — Bank Transfer
  {
    country: 'Тайвань',
    countryCode: 'TW',
    group: 'Bank Transfer',
    groupNotes: 'Обязательная верификация через Sumsub',
    agent: 'Quickpay',
    agentExternalId: '769',
    subagent: 'Bank Transfer twd Kassifoni Enterprises',
    subagentExternalId: '15918',
    segmentType: 'none',
  },
  {
    country: 'Тайвань',
    countryCode: 'TW',
    group: 'Bank Transfer',
    groupNotes: 'Обязательная верификация через Sumsub',
    agent: 'Hcash (HSBC)',
    agentExternalId: '2156',
    subagent: 'HCASH(HSBC) Bank Transfer TWD Walsdefund',
    subagentExternalId: '67657',
    segmentType: 'none',
  },
  {
    country: 'Тайвань',
    countryCode: 'TW',
    group: 'Bank Transfer',
    groupNotes: 'Обязательная верификация через Sumsub',
    agent: 'MacPay',
    agentExternalId: '1046',
    subagent: 'bank transfer taiwan Kassifoni LTD',
    subagentExternalId: '55208',
    segmentType: 'none',
  },

  // Тайвань — Bank Transfer (High Limits)
  {
    country: 'Тайвань',
    countryCode: 'TW',
    group: 'Bank Transfer (High Limits)',
    agent: 'MacPay',
    agentExternalId: '1046',
    subagent: 'bank transfer taiwan Kassifoni LTD',
    subagentExternalId: '55208',
    segmentType: 'none',
  },

  // Тайвань — Bank Transfer aff
  {
    country: 'Тайвань',
    countryCode: 'TW',
    group: 'Bank Transfer aff',
    groupNotes: 'Без верификации через Sumsub',
    agent: 'Hcash (HSBC)',
    agentExternalId: '2156',
    subagent: 'HCASH(HSBC) Bank Transfer TWD Walsdefund',
    subagentExternalId: '67657',
    segmentType: 'none',
  },

  // Тайвань — iCash Voucher
  {
    country: 'Тайвань',
    countryCode: 'TW',
    group: 'iCash Voucher',
    agent: 'iCash',
    agentExternalId: '1362',
    subagent: 'iCash TWD 1x Kassifoni',
    subagentExternalId: '54123',
    segmentType: 'none',
  },

  // Тайвань — Credit Card
  {
    country: 'Тайвань',
    countryCode: 'TW',
    group: 'Credit Card',
    agent: 'Quickpay',
    agentExternalId: '769',
    subagent: 'Credit Card kassifoni TWD',
    subagentExternalId: '58827',
    segmentType: 'none',
  },

  // Канада — Interac e-Transfer
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Interac e-Transfer',
    agent: 'PremierPayV2',
    agentExternalId: '727',
    subagent: 'eTransfer Exidna LTD',
    subagentExternalId: '68092',
    segmentType: 'none',
    notes: 'Не менее 70% на депозиты и выводы',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Interac e-Transfer',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'Webdef interac CAD Exidna Ltd',
    subagentExternalId: '57181',
    segmentType: 'none',
    notes: 'Не менее 20% на депозиты и выводы',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Interac e-Transfer',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'Webdef interac CAD our Exidna Ltd',
    subagentExternalId: '58116',
    segmentType: 'none',
    notes: 'Не менее 20% на депозиты и выводы',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Interac e-Transfer',
    agent: 'Paylab',
    agentExternalId: '1700',
    subagent: 'interac CAD Webdef Polonia ltd',
    subagentExternalId: '65495',
    segmentType: 'none',
    notes: 'Не более 13% на депозиты и выводы',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Interac e-Transfer',
    agent: 'Finvaro',
    agentExternalId: '1954',
    subagent: 'interac CAD Webdef Exidna ltd',
    subagentExternalId: '59921',
    segmentType: 'none',
    notes: 'Не более 10% на депозиты и выводы',
  },

  // Канада — Visa, Mastercard CAD
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Visa, Mastercard CAD',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'canada cards ecom USD FTD Festivex ltd',
    subagentExternalId: '55531',
    segmentType: 'primary',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Visa, Mastercard CAD',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'canada cards ecom USD FTD Festivex ltd',
    subagentExternalId: '55814',
    segmentType: 'secondary',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Visa, Mastercard CAD',
    agent: 'OdaMoney',
    agentExternalId: '1560',
    subagent: 'Cards ecom CAD Exidna ltd',
    subagentExternalId: '55570',
    segmentType: 'primary',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Visa, Mastercard CAD',
    agent: 'OdaMoney',
    agentExternalId: '1560',
    subagent: 'Cards ecom CAD Trusted Exidna ltd',
    subagentExternalId: '55571',
    segmentType: 'secondary',
  },

  // Канада — Apple Pay
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Apple Pay',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'ApplePay FTD EUR Exidna Ltd',
    subagentExternalId: '66542',
    segmentType: 'primary',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Apple Pay',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'ApplePay TID EUR Exidna Ltd',
    subagentExternalId: '66542',
    segmentType: 'secondary',
  },

  // Канада — Google Pay
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Google Pay',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'GooglePay FTD EUR Exidna Ltd',
    subagentExternalId: '66544',
    segmentType: 'primary',
  },
  {
    country: 'Канада',
    countryCode: 'CA',
    group: 'Google Pay',
    agent: 'Champay',
    agentExternalId: '1546',
    subagent: 'GooglePay TID EUR Exidna Ltd',
    subagentExternalId: '66544',
    segmentType: 'secondary',
  },
];
