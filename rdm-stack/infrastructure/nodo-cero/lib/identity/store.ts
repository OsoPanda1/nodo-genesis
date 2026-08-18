/* ================================================================== */
/* IDENTIDAD YUN — Almacén en memoria del runtime (server-only)        */
/* ================================================================== */
/* Registro soberano de vecinos y comercios. Mismo patrón que el store */
/* de gamification: globalThis para sobrevivir a HMR; persistencia     */
/* real conectando Supabase/Postgres en un adaptador.                  */
/* ================================================================== */

import type { RegisterBusinessInput, RegisterUserInput } from './contracts';
import { publishEvent } from '@/lib/core/events';
import { registerHydrator, schedulePersist } from '@/lib/core/persistence';
import { loadActors, upsertActor } from './repository';

export interface BusinessProfile {
  ownerName: string;
  ownerPhone: string;
  services: string;
  description: string;
  address?: string;
  geo?: { lat: number; lng: number };
  hours: string;
  serviceDays: string[];
  offers?: string;
  homeDelivery: boolean;
  photos: string[];
  contactPhone: string;
  website?: string;
  socials?: { facebook?: string; instagram?: string; tiktok?: string; whatsapp?: string };
}

export interface SubscriptionState {
  plan: 'mensual' | 'semestral' | 'premium';
  paymentRef: string;
  amount: number;
  months: number;
  startedAt: number;
  expiresAt: number;
  status: 'active' | 'expired';
}

export interface RegisteredUserRecord {
  id: string;
  kind: 'user' | 'business';
  name: string;
  email: string;
  role?: string;
  businessName?: string;
  category?: string;
  createdAt: number;
  /** Sólo verdadero para comercios con suscripción pagada y verificada. */
  published?: boolean;
  /** Perfil completo del comercio (demo en memoria). */
  profile?: BusinessProfile;
  /** Suscripción activa (comercio) o Premium (usuario). */
  subscription?: SubscriptionState;
  /** Usuario premium (cupones, descuentos, monetización de gamificación). */
  premium?: boolean;
}

interface IdentityStoreShape {
  users: Map<string, RegisteredUserRecord>;
  byEmail: Map<string, string>;
}

const STORE_KEY = '__rdmIdentityStore';

const g = globalThis as unknown as { [STORE_KEY]?: IdentityStoreShape };

function getStore(): IdentityStoreShape {
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { users: new Map(), byEmail: new Map() };
  }
  return g[STORE_KEY] as IdentityStoreShape;
}

/** Carga inicial desde Postgres (idempotente): no pisa registros ya en
 *  memoria más recientes; solo rellena los ausentes. */
registerHydrator('identity', async () => {
  const records = await loadActors();
  const store = getStore();
  for (const record of records) {
    if (!store.users.has(record.id)) {
      store.users.set(record.id, record);
      store.byEmail.set(record.email.toLowerCase(), record.id);
    }
  }
});

function nextId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}

export function findRegistered(email: string): RegisteredUserRecord | null {
  const store = getStore();
  const id = store.byEmail.get(email.toLowerCase());
  if (!id) return null;
  return store.users.get(id) ?? null;
}

/** Registra un vecino; rechaza emails duplicados (idempotente por email).
 *  `subscription` sólo se pasa cuando el usuario contrata Premium y su pago
 *  ya fue verificado contra el ledger en la ruta. */
export function registerUser(
  input: RegisterUserInput,
  subscription?: SubscriptionState,
): { ok: true; user: RegisteredUserRecord } | { ok: false; reason: string } {
  const store = getStore();
  const email = input.email.toLowerCase();
  if (store.byEmail.has(email)) return { ok: false, reason: 'EMAIL_ALREADY_REGISTERED' };

  const user: RegisteredUserRecord = {
    id: nextId('usr'),
    kind: 'user',
    name: input.name,
    email,
    role: input.role,
    createdAt: Date.now(),
    premium: Boolean(subscription),
    subscription,
  };
  store.users.set(user.id, user);
  store.byEmail.set(email, user.id);
  schedulePersist('identity.user', () => upsertActor(user));

  publishEvent({
    type: 'identity.user.registered',
    source: 'yun-identity',
    domain: 'identity',
    severity: 'info',
    data: { id: user.id, role: user.role, premium: user.premium, createdAt: user.createdAt },
    meta: { entityId: user.id },
  });
  return { ok: true, user };
}

/** Registra un negocio; rechaza emails duplicados. Sólo se invoca desde la
 *  ruta cuando la suscripción ya fue verificada contra el ledger, por eso el
 *  comercio queda `published: true` (aparece en mapa, catálogo, banners y en
 *  las recomendaciones de Isabella). Sin `subscription` no se debe llamar. */
export function registerBusiness(
  input: RegisterBusinessInput,
  subscription: SubscriptionState,
): { ok: true; user: RegisteredUserRecord } | { ok: false; reason: string } {
  const store = getStore();
  const email = input.email.toLowerCase();
  if (store.byEmail.has(email)) return { ok: false, reason: 'EMAIL_ALREADY_REGISTERED' };

  const business: RegisteredUserRecord = {
    id: nextId('biz'),
    kind: 'business',
    name: input.businessName,
    email,
    businessName: input.businessName,
    category: input.category,
    createdAt: Date.now(),
    published: true,
    subscription,
    profile: {
      ownerName: input.ownerName,
      ownerPhone: input.ownerPhone,
      services: input.services,
      description: input.description,
      address: input.address,
      geo: input.geo,
      hours: input.hours,
      serviceDays: input.serviceDays,
      offers: input.offers,
      homeDelivery: input.homeDelivery,
      photos: input.photos,
      contactPhone: input.contactPhone,
      website: input.website,
      socials: input.socials,
    },
  };
  store.users.set(business.id, business);
  store.byEmail.set(email, business.id);
  schedulePersist('identity.business', () => upsertActor(business));

  publishEvent({
    type: 'identity.business.registered',
    source: 'yun-identity',
    domain: 'identity',
    severity: 'info',
    data: {
      id: business.id,
      category: business.category,
      plan: subscription.plan,
      published: true,
      createdAt: business.createdAt,
    },
    meta: { entityId: business.id },
  });
  return { ok: true, user: business };
}

/** Comercios publicados (suscripción pagada): alimenta el mapa interactivo,
 *  el catálogo de comercios, los banners de publicidad y las recomendaciones
 *  de Isabella. Nunca expone emails ni datos personales sensibles. */
export function listPublishedBusinesses() {
  const store = getStore();
  const out: Array<{
    id: string;
    businessName: string;
    category: string;
    profile?: BusinessProfile;
    plan: string;
  }> = [];
  for (const r of store.users.values()) {
    if (r.kind === 'business' && r.published) {
      out.push({
        id: r.id,
        businessName: r.businessName ?? r.name,
        category: r.category ?? 'Otro',
        profile: r.profile,
        plan: r.subscription?.plan ?? 'mensual',
      });
    }
  }
  return out;
}

/** Resumen para el monitor (sin emails). */
export function identitySummary() {
  const store = getStore();
  let users = 0;
  let businesses = 0;
  for (const record of store.users.values()) {
    if (record.kind === 'user') users += 1;
    else businesses += 1;
  }
  return { total: store.users.size, users, businesses };
}

/** Limpia el registro (uso en pruebas). */
export function resetIdentityForTests(): void {
  const store = getStore();
  store.users.clear();
  store.byEmail.clear();
}
