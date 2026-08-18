export type CurrencyCode = 'USD' | 'EUR' | 'MXN'; // extensible

export type LicenseModel =
  | 'free'
  | 'one-time'
  | 'subscription'
  | 'usage-based';

export type BillingPeriod = 'monthly' | 'yearly';

export type PriceModelBase = {
  model: LicenseModel;
  currency?: CurrencyCode;      // por defecto 'USD' si lo normalizas
};

export type OneTimePriceModel = PriceModelBase & {
  model: 'one-time';
  amountUsd: number;
};

export type SubscriptionPriceModel = PriceModelBase & {
  model: 'subscription';
  amountUsd: number;
  period: BillingPeriod;
};

export type UsageBasedPriceModel = PriceModelBase & {
  model: 'usage-based';
  perUnitUsd: number;
  unitLabel?: string;           // p.ej. "api_call", "gb", "seat"
};

export type FreePriceModel = PriceModelBase & {
  model: 'free';
};

export type PriceModel =
  | FreePriceModel
  | OneTimePriceModel
  | SubscriptionPriceModel
  | UsageBasedPriceModel;

export type MarketplaceListing = {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  provider: string;
  publisher: string;
  status: string;
  price: PriceModel;
  rating: number;
  ratingCount: number;
  downloads: number;
  tags: string[];
  compatibleDomains: string[];
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  listingId: string;
  licensee: string;
  licensedAt: string;
  expiresAt?: string;
  status: string;
  usageCount: number;
};

export type LicenseCheckResult = {
  allowed: boolean;
  reason: string;
  subscriptionId?: string;
  remaining?: number;
};

