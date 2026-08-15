'use client';

import { useState } from 'react';
import { HandCoins, CreditCard, Store, CheckCircle2, Loader2, Heart, Wallet } from 'lucide-react';

type Method = 'card' | 'paypal' | 'crypto' | 'spei';
type PaymentType = 'donation' | 'purchase' | 'subscription';

const DONATION_AMOUNTS = [25, 50, 100, 250, 500];
const SAMPLE_MERCHANTS = [
  { id: 'pasteria-cornish', label: 'Pastería La Cornish' },
  { id: 'plateria-acosta', label: 'Platería Acosta' },
  { id: 'cafe-minero', label: 'Café El Minero' },
  { id: 'tienda-artesanal', label: 'Tienda Artesanal del Monte' },
];

const METHOD_LABELS: Record<Method, string> = {
  card: 'Tarjeta',
  paypal: 'PayPal',
  crypto: 'Cripto',
  spei: 'SPEI',
};

interface CheckoutResult {
  ok: boolean;
  ref?: string;
  status?: string;
  error?: string;
  payoutId?: string;
  balanceRemaining?: number;
}

export default function PaymentsSection() {
  const [tab, setTab] = useState<'donations' | 'users' | 'merchants'>('donations');
  const [type, setType] = useState<PaymentType>('donation');
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState<Method>('card');
  const [concept, setConcept] = useState('');
  const [merchantId, setMerchantId] = useState(SAMPLE_MERCHANTS[0].id);
  const [payoutMerchant, setPayoutMerchant] = useState(SAMPLE_MERCHANTS[0].id);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'spei' | 'paypal'>('spei');
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [merchantSecret, setMerchantSecret] = useState('');

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const submitCheckout = async () => {
    setError(null);
    setResult(null);
    if (!finalAmount || finalAmount <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: finalAmount,
          method,
          concept: concept || undefined,
          merchantId: type === 'purchase' ? merchantId : undefined,
        }),
      });
      const data = (await res.json()) as CheckoutResult;
      if (!res.ok) {
        setError(data.error ?? 'No se pudo procesar el pago.');
        return;
      }
      setResult(data);
      if (typeof (data as unknown as { merchantKey?: string }).merchantKey === 'string') {
        setMerchantSecret((data as unknown as { merchantKey: string }).merchantKey);
      }
    } catch {
      setError('Error de red al procesar el pago.');
    } finally {
      setBusy(false);
    }
  };

  const submitPayout = async () => {
    setError(null);
    setResult(null);
    const amountValue = Number(payoutAmount);
    if (!amountValue || amountValue <= 0) {
      setError('Ingresa un monto de retiro válido.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/payments/merchant/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rdm-merchant-secret': merchantSecret,
        },
        body: JSON.stringify({ merchantId: payoutMerchant, amount: amountValue, method: payoutMethod }),
      });
      const data = (await res.json()) as CheckoutResult;
      if (!res.ok) {
        setError(data.error ?? 'No se pudo solicitar el retiro.');
        return;
      }
      setResult(data);
    } catch {
      setError('Error de red al solicitar el retiro.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
          <HandCoins className="h-6 w-6 text-emerald-400" />
          Pagos y Donaciones del Nodo
        </h2>
        <p className="font-mono text-xs text-slate-400">
          Economía phygital: donaciones ciudadanas, pagos de usuarios y retiros de comercios del territorio.
        </p>
      </header>

      {/* Pestañas */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'donations', label: 'Donaciones', icon: <Heart className="h-4 w-4 text-rose-400" /> },
          { id: 'users', label: 'Pagos de Usuarios', icon: <CreditCard className="h-4 w-4 text-cyan-400" /> },
          { id: 'merchants', label: 'Comercios', icon: <Store className="h-4 w-4 text-amber-400" /> },
        ] as const).map(item => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
              setResult(null);
              setError(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              tab === item.id
                ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                : 'border border-white/10 text-slate-300 hover:bg-white/5'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {result?.ok && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              {result.payoutId
                ? `Retiro ${result.payoutId} solicitado`
                : `Pago ${result.ref} confirmado`}
            </p>
            <p className="font-mono text-xs text-emerald-400/80">
              Referencia {result.ref ?? ''} · Estado {result.status ?? ''}
              {typeof result.balanceRemaining === 'number' && ` · Saldo restante: $${result.balanceRemaining} MXN`}
            </p>
          </div>
        </div>
      )}

      {/* PESTAÑA DONACIONES */}
      {tab === 'donations' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-panel space-y-4 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-[#f5f0e8]">Apoya el Nodo Cero</h3>
            <p className="text-xs text-slate-400">
              Tu aportación sostiene el gemelo digital, la conservación patrimonial y el acceso abierto
              a la plataforma del Pueblo Mágico.
            </p>
            <div className="flex flex-wrap gap-2">
              {DONATION_AMOUNTS.map(value => (
                <button
                  key={value}
                  onClick={() => {
                    setAmount(value);
                    setCustomAmount('');
                    setType('donation');
                  }}
                  className={`rounded-lg border px-3 py-2 font-mono text-sm transition-all ${
                    amount === value && !customAmount
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  ${value} MXN
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="Monto personalizado (MXN)"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="Concepto (opcional, máx. 80)"
              maxLength={80}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {(['card', 'paypal', 'crypto', 'spei'] as Method[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                    method === m
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
            <button
              onClick={submitCheckout}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all hover:shadow-[0_0_32px_rgba(16,185,129,0.6)] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
              Donar ${finalAmount} MXN
            </button>
          </section>

          <section className="glass-panel rounded-2xl p-5">
            <h3 className="mb-3 text-lg font-semibold text-[#d4b26a]">Cómo se usa tu aportación</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                • Sostenimiento de la infraestructura soberana del Nodo Cero (gemelo digital, Isabella AI).
              </li>
              <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                • Conservación patrimonial y digitalización de oficios de la Comarca Minera.
              </li>
              <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                • Fondo de becas para artesanos y comercios locales verificados.
              </li>
            </ul>
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              Cada aportación queda registrada con referencia verificable en el ledger público del Nodo.
            </div>
          </section>
        </div>
      )}

      {/* PESTAÑA PAGOS DE USUARIOS */}
      {tab === 'users' && (
        <div className="glass-panel max-w-xl space-y-4 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-[#f5f0e8]">Compra en el comercio phygital</h3>
          <div className="flex gap-2">
            {(['purchase', 'subscription'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                  type === t
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {t === 'purchase' ? 'Compra' : 'Suscripción'}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Monto (MXN)</label>
            <input
              type="number"
              min={1}
              value={customAmount || amount}
              onChange={e => setCustomAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Comercio</label>
            <select
              value={merchantId}
              onChange={e => setMerchantId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              {SAMPLE_MERCHANTS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={concept}
            onChange={e => setConcept(e.target.value)}
            placeholder="Concepto (opcional)"
            maxLength={80}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {(['card', 'paypal', 'crypto', 'spei'] as Method[]).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                  method === m
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {METHOD_LABELS[m]}
              </button>
            ))}
          </div>
          <button
            onClick={submitCheckout}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pagar ${customAmount || amount} MXN
          </button>
        </div>
      )}

      {/* PESTAÑA COMERCIOS */}
      {tab === 'merchants' && (
        <div className="glass-panel max-w-xl space-y-4 rounded-2xl p-5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-[#f5f0e8]">
            <Wallet className="h-5 w-5 text-amber-400" />
            Retiro de saldo para comercios
          </h3>
          <p className="text-xs text-slate-400">
            Los comercios reciben el 100% del importe de cada venta phygital. Solicita tu retiro por SPEI o PayPal
            firmándolo con la clave secreta de tu comercio (se emite con cada venta confirmada).
          </p>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Comercio</label>
            <select
              value={payoutMerchant}
              onChange={e => setPayoutMerchant(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              {SAMPLE_MERCHANTS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Monto a retirar (MXN)</label>
            <input
              type="number"
              min={1}
              value={payoutAmount}
              onChange={e => setPayoutAmount(e.target.value)}
              placeholder="Ej. 500"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          {merchantSecret && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-300 break-all">
              Clave de comercio activa: {merchantSecret.slice(0, 18)}… (se envía en cada retiro)
            </div>
          )}
          <div className="flex gap-2">
            {(['spei', 'paypal'] as const).map(m => (
              <button
                key={m}
                onClick={() => setPayoutMethod(m)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                  payoutMethod === m
                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={submitPayout}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(245,158,11,0.35)] transition-all hover:shadow-[0_0_32px_rgba(245,158,11,0.6)] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
            Solicitar retiro
          </button>
        </div>
      )}
    </div>
  );
}
