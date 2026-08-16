"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Facebook,
  Gift,
  Globe,
  Image as ImageIcon,
  Instagram,
  Loader2,
  LockKeyhole,
  MapPin,
  Music2,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Truck,
  UserPlus,
  WalletCards,
  X,
} from "lucide-react";
import { SectionHeader } from "@/components/design-system/SectionHeader";
import { GradientDivider } from "@/components/design-system/GradientDivider";
import {
  BUSINESS_CATEGORIES,
  BUSINESS_PLANS,
  IDENTITY_ROLES,
  PREMIUM_USER_PLAN,
  WEEKDAYS,
  type BusinessPlanId,
  type Weekday,
} from "@/lib/identity/contracts";

type RegisterKind = "user" | "business";
type PayMethod = "card" | "spei" | "paypal";
type BusinessStep = 1 | 2;

interface RegisterResult {
  ok: boolean;
  id?: string;
  kind?: string;
  published?: boolean;
  plan?: string;
  premium?: boolean;
  error?: string;
}

const WEEKDAY_LABELS: Record<Weekday, string> = {
  lun: "Lun",
  mar: "Mar",
  mie: "Mié",
  jue: "Jue",
  vie: "Vie",
  sab: "Sáb",
  dom: "Dom",
};

const PHOTO_SUGGESTIONS = [
  "/images/gastronomia-1.jpg",
  "/images/gastronomia-2.jpg",
  "/images/gastronomia-3.jpg",
  "/images/plaza-principal.jpg",
  "/images/callejon.jpg",
  "/images/centro.jpg",
];

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-[#e8edef] outline-none transition placeholder:text-[#647a84] hover:border-white/25 focus:border-[#2e9cff] focus:ring-4 focus:ring-[#2e9cff]/15";

const labelClass =
  "text-[11px] font-bold uppercase tracking-[0.13em] text-[#93a5ad]";

const paymentOptions: Array<{
  id: PayMethod;
  title: string;
  description: string;
}> = [
  {
    id: "card",
    title: "Tarjeta",
    description: "Débito o crédito",
  },
  {
    id: "spei",
    title: "SPEI",
    description: "Transferencia bancaria",
  },
  {
    id: "paypal",
    title: "PayPal",
    description: "Pago protegido",
  },
];

function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className={labelClass}>
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[#93a5ad]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function StepIndicator({ step }: { step: BusinessStep }) {
  const isDataActive = step === 1;
  const isPaymentActive = step === 2;

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
      <div className="flex items-center">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
              isDataActive
                ? "bg-[#0d4652] text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {isDataActive ? "1" : <CheckCircle2 className="h-4 w-4" />}
          </span>
          <div>
            <p
              className={`text-xs font-bold ${
                isDataActive ? "text-[#2e9cff]" : "text-[#c9d0d4]"
              }`}
            >
              Información
            </p>
            <p className="hidden text-[11px] text-[#93a5ad] sm:block">
              Perfil y datos del comercio
            </p>
          </div>
        </div>

        <div className="mx-4 h-px flex-1 bg-white/15" />

        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
              isPaymentActive
                ? "bg-[#0d4652] text-white"
                : "bg-white/15 text-[#647a84]"
            }`}
          >
            2
          </span>
          <div>
            <p
              className={`text-xs font-bold ${
                isPaymentActive ? "text-[#2e9cff]" : "text-[#93a5ad]"
              }`}
            >
              Publicación
            </p>
            <p className="hidden text-[11px] text-[#93a5ad] sm:block">
              Plan y pago seguro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: {
      wrapper: "border-rose-400/30 bg-rose-500/10 text-rose-200",
      icon: "text-rose-300",
    },
    success: {
      wrapper: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
      icon: "text-emerald-300",
    },
    info: {
      wrapper: "border-[#d97832]/30 bg-[#d97832]/10 text-[#d97832]",
      icon: "text-[#d97832]",
    },
  };

  const style = styles[tone];

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${style.wrapper}`}
    >
      {tone === "success" ? (
        <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
      ) : tone === "error" ? (
        <X className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
      ) : (
        <LockKeyhole className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
      )}
      <div className="leading-6">{children}</div>
    </div>
  );
}

export default function RegisterSection() {
  const [kind, setKind] = useState<RegisterKind>("business");
  const [step, setStep] = useState<BusinessStep>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<RegisterResult | null>(null);

  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uRole, setURole] =
    useState<(typeof IDENTITY_ROLES)[number]>("vecino");
  const [uNeighborhood, setUNeighborhood] = useState("");
  const [uOccupation, setUOccupation] = useState("");
  const [wantPremium, setWantPremium] = useState(false);

  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [bEmail, setBEmail] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<string>(BUSINESS_CATEGORIES[0]);
  const [services, setServices] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [hours, setHours] = useState("");
  const [serviceDays, setServiceDays] = useState<Weekday[]>([
    "lun",
    "mar",
    "mie",
    "jue",
    "vie",
  ]);
  const [offers, setOffers] = useState("");
  const [homeDelivery, setHomeDelivery] = useState(false);
  const [photos, setPhotos] = useState<string[]>(["", "", ""]);
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [social, setSocial] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
    whatsapp: "",
  });

  const [plan, setPlan] = useState<BusinessPlanId>("mensual");
  const [method, setMethod] = useState<PayMethod>("card");

  const cleanPhotos = useMemo(
    () => photos.map((photo) => photo.trim()).filter(Boolean),
    [photos],
  );

  const planPrice = BUSINESS_PLANS[plan].price;

  const resetFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const changeKind = (nextKind: RegisterKind) => {
    setKind(nextKind);
    setStep(1);
    resetFeedback();
  };

  const toggleDay = (day: Weekday) => {
    setServiceDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  };

  const setPhoto = (index: number, value: string) => {
    setPhotos((current) =>
      current.map((photo, photoIndex) =>
        photoIndex === index ? value : photo,
      ),
    );
  };

  const goToPayment = () => {
    resetFeedback();

    if (!ownerName.trim() || !ownerPhone.trim() || !bEmail.trim()) {
      setError("Completa los datos de contacto del propietario.");
      return;
    }

    if (
      !businessName.trim() ||
      !services.trim() ||
      !hours.trim() ||
      !contactPhone.trim()
    ) {
      setError(
        "Completa el nombre, servicios, horarios y teléfono del comercio.",
      );
      return;
    }

    if (!serviceDays.length) {
      setError("Selecciona al menos un día de atención.");
      return;
    }

    if (!cleanPhotos.length) {
      setError("Agrega al menos una imagen de presentación.");
      return;
    }

    if (description.length > 250) {
      setError("La descripción no puede superar los 250 caracteres.");
      return;
    }

    setStep(2);
  };

  const payAndRegisterBusiness = async () => {
    resetFeedback();
    setBusy(true);

    try {
      const checkoutResponse = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscription",
          amount: planPrice,
          method,
          concept: `Suscripción comercio ${BUSINESS_PLANS[plan].label}`,
        }),
      });

      const payment = await checkoutResponse.json();

      if (
        !checkoutResponse.ok ||
        !payment.ok ||
        payment.status !== "confirmed"
      ) {
        setError(
          "No fue posible confirmar el pago. Tu comercio no ha sido registrado.",
        );
        return;
      }

      const socials = Object.fromEntries(
        Object.entries(social)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => value),
      );

      const geo =
        lat.trim() &&
        lng.trim() &&
        !Number.isNaN(Number(lat)) &&
        !Number.isNaN(Number(lng))
          ? { lat: Number(lat), lng: Number(lng) }
          : undefined;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "business",
          ownerName: ownerName.trim(),
          ownerPhone: ownerPhone.trim(),
          email: bEmail.trim(),
          businessName: businessName.trim(),
          category,
          services: services.trim(),
          description: description.trim(),
          address: address.trim() || undefined,
          geo,
          hours: hours.trim(),
          serviceDays,
          offers: offers.trim() || undefined,
          homeDelivery,
          photos: cleanPhotos,
          contactPhone: contactPhone.trim(),
          website: website.trim() || undefined,
          socials: Object.keys(socials).length ? socials : undefined,
          subscription: {
            plan,
            paymentRef: payment.ref,
          },
          acceptTerms: true,
        }),
      });

      const data = (await response.json()) as RegisterResult;

      if (!response.ok) {
        setError(
          data.error === "EMAIL_ALREADY_REGISTERED"
            ? "Este correo ya está registrado en Nodo Cero."
            : "No pudimos publicar el comercio. Revisa los datos e inténtalo de nuevo.",
        );
        return;
      }

      setSuccess(data);
      setStep(1);
    } catch {
      setError(
        "Ocurrió un problema de conexión. Verifica tu red e inténtalo nuevamente.",
      );
    } finally {
      setBusy(false);
    }
  };

  const registerUserFlow = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();
    setBusy(true);

    try {
      let premiumRef: string | undefined;

      if (wantPremium) {
        const checkoutResponse = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscription",
            amount: PREMIUM_USER_PLAN.price,
            method,
            concept: "Suscripción usuario Premium",
          }),
        });

        const payment = await checkoutResponse.json();

        if (
          !checkoutResponse.ok ||
          !payment.ok ||
          payment.status !== "confirmed"
        ) {
          setError(
            "No se pudo confirmar el pago Premium. La cuenta no fue creada.",
          );
          return;
        }

        premiumRef = payment.ref;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "user",
          name: uName.trim(),
          email: uEmail.trim(),
          role: uRole,
          neighborhood: uNeighborhood.trim() || undefined,
          occupation: uOccupation.trim() || undefined,
          interests: [],
          premium: premiumRef ? { paymentRef: premiumRef } : undefined,
          acceptTerms: true,
        }),
      });

      const data = (await response.json()) as RegisterResult;

      if (!response.ok) {
        setError(
          data.error === "EMAIL_ALREADY_REGISTERED"
            ? "Este correo ya está registrado en Nodo Cero."
            : "No fue posible completar tu registro.",
        );
        return;
      }

      setSuccess(data);
    } catch {
      setError(
        "Ocurrió un problema de conexión. Verifica tu red e inténtalo nuevamente.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#0d1c26] p-4 shadow-[0_24px_80px_rgba(8,47,59,0.08)] sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_right,rgba(217,120,50,0.18),transparent_45%),radial-gradient(circle_at_top_left,rgba(46,156,255,0.10),transparent_42%)]" />

      <div className="relative">
        <SectionHeader
          badge="PLANO III · IDENTIDAD Y ECONOMÍA LOCAL"
          title="Únete al ecosistema de Real del Monte"
          description="Crea una cuenta para participar en la comunidad o registra tu comercio para hacerlo visible en el mapa, catálogo y recomendaciones del Nodo Cero."
        />

        <div className="mx-auto mt-8 flex w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.04] p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => changeKind("user")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
              kind === "user"
                ? "bg-[#0d4652] text-white shadow-lg shadow-[#0d4652]/20"
                : "text-[#647a84] hover:bg-white/[0.06] hover:text-[#2e9cff]"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Soy visitante o vecino
          </button>

          <button
            type="button"
            onClick={() => changeKind("business")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
              kind === "business"
                ? "bg-[#0d4652] text-white shadow-lg shadow-[#0d4652]/20"
                : "text-[#647a84] hover:bg-white/[0.06] hover:text-[#2e9cff]"
            }`}
          >
            <Store className="h-4 w-4" />
            Tengo un comercio
          </button>
        </div>

        <div className="mx-auto mt-8 max-w-6xl space-y-5">
          {error && <Notice tone="error">{error}</Notice>}

          {success?.ok && (
            <Notice tone="success">
              <p className="font-bold">
                {success.kind === "business"
                  ? "Tu comercio ya está publicado en Nodo Cero."
                  : success.premium
                    ? "Tu cuenta Premium ha sido activada."
                    : "Tu cuenta ha sido creada correctamente."}
              </p>

              <p className="mt-1 text-xs opacity-80">
                {success.kind === "business"
                  ? `Tu ficha está disponible en mapa, catálogo y recomendaciones. Plan activo: ${success.plan ?? "activo"}.`
                  : `Tu identificador de registro es: ${success.id ?? "generado"}.`}
              </p>
            </Notice>
          )}

          {kind === "business" ? (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="rounded-[1.75rem] border border-white/15 bg-white/[0.04] p-5 shadow-sm sm:p-7">
                  <StepIndicator step={step} />

                  <div className="mt-7">
                    {step === 1 ? (
                      <BusinessDetailsForm
                        ownerName={ownerName}
                        setOwnerName={setOwnerName}
                        ownerPhone={ownerPhone}
                        setOwnerPhone={setOwnerPhone}
                        bEmail={bEmail}
                        setBEmail={setBEmail}
                        businessName={businessName}
                        setBusinessName={setBusinessName}
                        category={category}
                        setCategory={setCategory}
                        services={services}
                        setServices={setServices}
                        description={description}
                        setDescription={setDescription}
                        address={address}
                        setAddress={setAddress}
                        lat={lat}
                        setLat={setLat}
                        lng={lng}
                        setLng={setLng}
                        hours={hours}
                        setHours={setHours}
                        serviceDays={serviceDays}
                        toggleDay={toggleDay}
                        offers={offers}
                        setOffers={setOffers}
                        homeDelivery={homeDelivery}
                        setHomeDelivery={setHomeDelivery}
                        photos={photos}
                        setPhoto={setPhoto}
                        contactPhone={contactPhone}
                        setContactPhone={setContactPhone}
                        website={website}
                        setWebsite={setWebsite}
                        social={social}
                        setSocial={setSocial}
                        onContinue={goToPayment}
                      />
                    ) : (
                      <BusinessPaymentStep
                        plan={plan}
                        setPlan={setPlan}
                        method={method}
                        setMethod={setMethod}
                        planPrice={planPrice}
                        busy={busy}
                        onBack={() => setStep(1)}
                        onPay={payAndRegisterBusiness}
                      />
                    )}
                  </div>
                </div>
              </div>

              <RegisterSidebar kind="business" />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <UserForm
                uName={uName}
                setUName={setUName}
                uEmail={uEmail}
                setUEmail={setUEmail}
                uRole={uRole}
                setURole={setURole}
                uNeighborhood={uNeighborhood}
                setUNeighborhood={setUNeighborhood}
                uOccupation={uOccupation}
                setUOccupation={setUOccupation}
                wantPremium={wantPremium}
                setWantPremium={setWantPremium}
                method={method}
                setMethod={setMethod}
                busy={busy}
                onSubmit={registerUserFlow}
              />

              <RegisterSidebar kind="user" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BusinessDetailsForm({
  ownerName,
  setOwnerName,
  ownerPhone,
  setOwnerPhone,
  bEmail,
  setBEmail,
  businessName,
  setBusinessName,
  category,
  setCategory,
  services,
  setServices,
  description,
  setDescription,
  address,
  setAddress,
  lat,
  setLat,
  lng,
  setLng,
  hours,
  setHours,
  serviceDays,
  toggleDay,
  offers,
  setOffers,
  homeDelivery,
  setHomeDelivery,
  photos,
  setPhoto,
  contactPhone,
  setContactPhone,
  website,
  setWebsite,
  social,
  setSocial,
  onContinue,
}: {
  ownerName: string;
  setOwnerName: (value: string) => void;
  ownerPhone: string;
  setOwnerPhone: (value: string) => void;
  bEmail: string;
  setBEmail: (value: string) => void;
  businessName: string;
  setBusinessName: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  services: string;
  setServices: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  lat: string;
  setLat: (value: string) => void;
  lng: string;
  setLng: (value: string) => void;
  hours: string;
  setHours: (value: string) => void;
  serviceDays: Weekday[];
  toggleDay: (day: Weekday) => void;
  offers: string;
  setOffers: (value: string) => void;
  homeDelivery: boolean;
  setHomeDelivery: (value: boolean) => void;
  photos: string[];
  setPhoto: (index: number, value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
  };
  setSocial: React.Dispatch<
    React.SetStateAction<{
      facebook: string;
      instagram: string;
      tiktok: string;
      whatsapp: string;
    }>
  >;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#2e9cff]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#2e9cff]">
          <BadgeCheck className="h-3.5 w-3.5 text-[#d97832]" />
          Perfil de negocio
        </span>

        <h3 className="mt-3 text-2xl font-black tracking-tight text-[#e8edef]">
          Construye una presencia confiable
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#647a84]">
          La información que registres será la base de tu ficha pública dentro
          del ecosistema territorial.
        </p>
      </div>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d4652] text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#e8edef]">
              Responsable de la cuenta
            </h4>
            <p className="text-xs text-[#93a5ad]">
              Datos para validar y administrar tu publicación.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" required>
            <input
              className={inputClass}
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
              placeholder="Nombre y apellidos"
            />
          </Field>

          <Field label="Teléfono" required>
            <input
              className={inputClass}
              value={ownerPhone}
              onChange={(event) => setOwnerPhone(event.target.value)}
              placeholder="771 000 0000"
              inputMode="tel"
            />
          </Field>
        </div>

        <Field label="Correo de acceso" required>
          <input
            type="email"
            className={inputClass}
            value={bEmail}
            onChange={(event) => setBEmail(event.target.value)}
            placeholder="negocio@ejemplo.mx"
          />
        </Field>
      </section>

      <GradientDivider />

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d97832]/15 text-[#d97832]">
            <Store className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#e8edef]">
              Información del comercio
            </h4>
            <p className="text-xs text-[#93a5ad]">
              Ayuda a visitantes y vecinos a encontrar lo que ofreces.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del comercio" required>
            <input
              className={inputClass}
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Ej. Pastería La Cornish"
            />
          </Field>

          <Field label="Categoría" required>
            <select
              className={inputClass}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {BUSINESS_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Servicios o giro comercial" required>
          <input
            className={inputClass}
            value={services}
            onChange={(event) => setServices(event.target.value)}
            placeholder="Ej. Pastes tradicionales, café de olla y repostería"
          />
        </Field>

        <Field
          label="Descripción pública"
          hint={`${description.length}/250 caracteres`}
        >
          <textarea
            className={`${inputClass} min-h-28 resize-none`}
            value={description}
            maxLength={250}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Comparte el sello, historia o especialidad que distingue a tu comercio."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dirección">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Calle, número y localidad"
              />
            </div>
          </Field>

          <Field label="Horario de atención" required>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                placeholder="Ej. 09:00 – 20:00"
              />
            </div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Latitud"
            hint="Opcional: aparecer en el mapa preciso"
          >
            <input
              className={inputClass}
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              placeholder="20.1447"
              inputMode="decimal"
            />
          </Field>

          <Field label="Longitud" hint="Opcional">
            <input
              className={inputClass}
              value={lng}
              onChange={(event) => setLng(event.target.value)}
              placeholder="-98.6672"
              inputMode="decimal"
            />
          </Field>
        </div>

        <Field label="Días de atención" required>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const selected = serviceDays.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleDay(day)}
                  className={`min-w-12 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                    selected
                      ? "bg-[#0d4652] text-white shadow-md shadow-[#0d4652]/15"
                      : "border border-white/15 bg-white/[0.04] text-[#647a84] hover:border-[#2e9cff] hover:text-[#2e9cff]"
                  }`}
                >
                  {WEEKDAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Promoción u oferta">
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={offers}
                onChange={(event) => setOffers(event.target.value)}
                placeholder="Ej. 2x1 en pastes los martes"
              />
            </div>
          </Field>

          <Field label="Contacto para pedidos" required>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                placeholder="771 111 2222"
                inputMode="tel"
              />
            </div>
          </Field>
        </div>

        <button
          type="button"
          onClick={() => setHomeDelivery(!homeDelivery)}
          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
            homeDelivery
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-white/15 bg-white/[0.04] hover:border-white/25"
          }`}
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              homeDelivery
                ? "bg-emerald-500 text-white"
                : "bg-white/[0.05] text-[#93a5ad] shadow-sm"
            }`}
          >
            <Truck className="h-5 w-5" />
          </span>

          <span className="flex-1">
            <span className="block text-sm font-bold text-[#e8edef]">
              Entrega a domicilio
            </span>
            <span className="mt-0.5 block text-xs text-[#647a84]">
              Indica si puedes atender pedidos fuera de tu ubicación.
            </span>
          </span>

          <span
            className={`relative h-7 w-12 rounded-full p-1 transition ${
              homeDelivery ? "bg-emerald-500" : "bg-white/30"
            }`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                homeDelivery ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </section>

      <GradientDivider />

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e9cff]/10 text-[#2e9cff]">
            <ImageIcon className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#e8edef]">
              Imagen y presencia digital
            </h4>
            <p className="text-xs text-[#93a5ad]">
              Una buena ficha visual ayuda a generar confianza.
            </p>
          </div>
        </div>

        <Field
          label="Galería de presentación"
          hint="Agrega hasta tres imágenes"
          required
        >
          <div className="space-y-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-2"
              >
                <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                  {photo.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.trim()}
                      alt={`Vista previa ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-[#c9d0d4]" />
                  )}
                </div>

                <input
                  className={`${inputClass} border-0 bg-transparent px-2 shadow-none focus:ring-0`}
                  value={photo}
                  onChange={(event) => setPhoto(index, event.target.value)}
                  placeholder={`URL de imagen ${index + 1}`}
                />
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              {PHOTO_SUGGESTIONS.map((source) => (
                <button
                  key={source}
                  type="button"
                  title="Usar esta imagen"
                  onClick={() => {
                    const emptyIndex = photos.findIndex(
                      (photo) => !photo.trim(),
                    );
                    setPhoto(emptyIndex === -1 ? 0 : emptyIndex, source);
                  }}
                  className="h-12 w-16 overflow-hidden rounded-xl border border-white/15 transition hover:-translate-y-0.5 hover:border-[#2e9cff] hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={source}
                    alt="Imagen sugerida"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sitio web">
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://tusitio.mx"
              />
            </div>
          </Field>

          <Field label="WhatsApp">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={social.whatsapp}
                onChange={(event) =>
                  setSocial((current) => ({
                    ...current,
                    whatsapp: event.target.value,
                  }))
                }
                placeholder="771 000 0000"
              />
            </div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Facebook">
            <div className="relative">
              <Facebook className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={social.facebook}
                onChange={(event) =>
                  setSocial((current) => ({
                    ...current,
                    facebook: event.target.value,
                  }))
                }
                placeholder="/tucomercio"
              />
            </div>
          </Field>

          <Field label="Instagram">
            <div className="relative">
              <Instagram className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={social.instagram}
                onChange={(event) =>
                  setSocial((current) => ({
                    ...current,
                    instagram: event.target.value,
                  }))
                }
                placeholder="@tucomercio"
              />
            </div>
          </Field>

          <Field label="TikTok">
            <div className="relative">
              <Music2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
              <input
                className={`${inputClass} pl-11`}
                value={social.tiktok}
                onChange={(event) =>
                  setSocial((current) => ({
                    ...current,
                    tiktok: event.target.value,
                  }))
                }
                placeholder="@tucomercio"
              />
            </div>
          </Field>
        </div>
      </section>

      <button
        type="button"
        onClick={onContinue}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0d4652] px-5 py-4 text-sm font-black text-white shadow-xl shadow-[#0d4652]/20 transition hover:-translate-y-0.5 hover:bg-[#082f3b] hover:shadow-2xl"
      >
        Continuar a publicación y suscripción
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}

function BusinessPaymentStep({
  plan,
  setPlan,
  method,
  setMethod,
  planPrice,
  busy,
  onBack,
  onPay,
}: {
  plan: BusinessPlanId;
  setPlan: (value: BusinessPlanId) => void;
  method: PayMethod;
  setMethod: (value: PayMethod) => void;
  planPrice: number;
  busy: boolean;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#d97832]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d97832]">
          <LockKeyhole className="h-3.5 w-3.5" />
          Activación segura
        </span>

        <h3 className="mt-3 text-2xl font-black tracking-tight text-[#e8edef]">
          Elige cómo quieres crecer
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#647a84]">
          Tu comercio se publica cuando la suscripción ha sido confirmada.
        </p>
      </div>

      <Notice tone="info">
        <p className="font-bold">Pago y publicación vinculados.</p>
        <p className="mt-1 text-xs opacity-80">
          La ficha no se publica ni se registra como activa hasta recibir la
          confirmación del pago.
        </p>
      </Notice>

      <section>
        <div className="mb-3">
          <p className={labelClass}>Plan de visibilidad</p>
          <p className="mt-1 text-xs text-[#93a5ad]">
            Selecciona la periodicidad que mejor funciona para tu negocio.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(BUSINESS_PLANS) as BusinessPlanId[]).map((id) => {
            const item = BUSINESS_PLANS[id];
            const selected = plan === id;
            const monthly = Math.round(item.price / item.months);
            const isRecommended = id === "semestral";

            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlan(id)}
                className={`relative overflow-hidden rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-[#d97832] bg-[#d97832]/10 ring-4 ring-[#d97832]/10"
                    : "border-white/15 bg-white/[0.04] hover:-translate-y-0.5 hover:border-[#d97832]/60 hover:shadow-lg"
                }`}
              >
                {isRecommended && (
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                    Mejor valor
                  </span>
                )}

                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#2e9cff]">
                  {item.label}
                </span>

                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-black tracking-tight text-[#e8edef]">
                    ${item.price}
                  </span>
                  <span className="mb-1 text-xs text-[#93a5ad]">MXN</span>
                </div>

                <p className="mt-2 text-xs text-[#647a84]">
                  ${monthly} MXN al mes · {item.months}{" "}
                  {item.months === 1 ? "mes" : "meses"} de cobertura
                </p>

                <span
                  className={`mt-5 flex h-5 w-5 items-center justify-center rounded-full border ${
                    selected
                      ? "border-[#d97832] bg-[#d97832] text-white"
                      : "border-white/15 bg-white/[0.04] text-transparent"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className={labelClass}>Método de pago</p>
          <p className="mt-1 text-xs text-[#93a5ad]">
            Elige la opción más conveniente para completar la activación.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {paymentOptions.map((option) => {
            const selected = option.id === method;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMethod(option.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-[#2e9cff] bg-[#2e9cff]/5 ring-2 ring-[#2e9cff]/15"
                    : "border-white/15 bg-white/[0.04] hover:border-white/25"
                }`}
              >
                <WalletCards
                  className={`h-5 w-5 ${
                    selected ? "text-[#2e9cff]" : "text-[#93a5ad]"
                  }`}
                />
                <p className="mt-3 text-sm font-bold text-[#e8edef]">
                  {option.title}
                </p>
                <p className="mt-1 text-[11px] text-[#93a5ad]">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#647a84]">
              Total a pagar
            </p>
            <p className="mt-1 text-sm text-[#647a84]">
              Plan {BUSINESS_PLANS[plan].label}
            </p>
          </div>

          <p className="text-3xl font-black text-[#e8edef]">
            ${planPrice}
            <span className="ml-1 text-sm font-semibold text-[#93a5ad]">
              MXN
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-sm font-bold text-[#93a5ad] transition hover:border-[#2e9cff] hover:text-[#2e9cff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a datos
        </button>

        <button
          type="button"
          onClick={onPay}
          disabled={busy}
          className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97832] to-[#b87946] px-5 py-4 text-sm font-black text-[#082f3b] shadow-xl shadow-[#d97832]/20 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {busy
            ? "Procesando activación..."
            : `Pagar $${planPrice} MXN y publicar`}
          {!busy && (
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </div>
  );
}

function UserForm({
  uName,
  setUName,
  uEmail,
  setUEmail,
  uRole,
  setURole,
  uNeighborhood,
  setUNeighborhood,
  uOccupation,
  setUOccupation,
  wantPremium,
  setWantPremium,
  method,
  setMethod,
  busy,
  onSubmit,
}: {
  uName: string;
  setUName: (value: string) => void;
  uEmail: string;
  setUEmail: (value: string) => void;
  uRole: (typeof IDENTITY_ROLES)[number];
  setURole: (value: (typeof IDENTITY_ROLES)[number]) => void;
  uNeighborhood: string;
  setUNeighborhood: (value: string) => void;
  uOccupation: string;
  setUOccupation: (value: string) => void;
  wantPremium: boolean;
  setWantPremium: (value: boolean) => void;
  method: PayMethod;
  setMethod: (value: PayMethod) => void;
  busy: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-7 rounded-[1.75rem] border border-white/15 bg-white/[0.04] p-5 shadow-sm sm:p-7 lg:col-span-3"
    >
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#2e9cff]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#2e9cff]">
          <UserPlus className="h-3.5 w-3.5 text-[#d97832]" />
          Identidad territorial
        </span>

        <h3 className="mt-3 text-2xl font-black tracking-tight text-[#e8edef]">
          Crea tu cuenta en Nodo Cero
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#647a84]">
          Conecta tu identidad con experiencias, cultura, beneficios y
          participación dentro de Real del Monte.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" required>
          <input
            className={inputClass}
            value={uName}
            onChange={(event) => setUName(event.target.value)}
            placeholder="Ej. María de los Ángeles"
            required
          />
        </Field>

        <Field label="Correo electrónico" required>
          <input
            type="email"
            className={inputClass}
            value={uEmail}
            onChange={(event) => setUEmail(event.target.value)}
            placeholder="tucorreo@ejemplo.mx"
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tu vínculo con la Comarca">
          <select
            className={inputClass}
            value={uRole}
            onChange={(event) =>
              setURole(
                event.target.value as (typeof IDENTITY_ROLES)[number],
              )
            }
          >
            {IDENTITY_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Barrio o comunidad">
          <input
            className={inputClass}
            value={uNeighborhood}
            onChange={(event) => setUNeighborhood(event.target.value)}
            placeholder="Ej. El Arbolito"
          />
        </Field>
      </div>

      <Field label="Oficio u ocupación">
        <input
          className={inputClass}
          value={uOccupation}
          onChange={(event) => setUOccupation(event.target.value)}
          placeholder="Ej. Guía de minas, artesanía, platería..."
        />
      </Field>

      <GradientDivider />

      <button
        type="button"
        onClick={() => setWantPremium(!wantPremium)}
        className={`w-full rounded-[1.5rem] border p-5 text-left transition ${
          wantPremium
            ? "border-[#d97832] bg-[linear-gradient(135deg,rgba(217,120,50,0.16),rgba(255,255,255,0.04))] ring-4 ring-[#d97832]/10"
            : "border-white/15 bg-white/[0.04] hover:border-[#d97832]/60 hover:bg-[#d97832]/10"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d97832]/15 text-[#d97832]">
              <Crown className="h-5 w-5" />
            </span>

            <span>
              <span className="flex items-center gap-2 text-sm font-black text-[#e8edef]">
                Cuenta Premium
                <span className="rounded-full bg-[#0d4652] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Opcional
                </span>
              </span>

              <span className="mt-1 block max-w-md text-xs leading-5 text-[#647a84]">
                Activa recompensas, cupones, descuentos y beneficios de la
                gamificación territorial.
              </span>
            </span>
          </span>

          <span className="shrink-0 text-right">
            <span className="block text-xl font-black text-[#e8edef]">
              $129
            </span>
            <span className="text-[10px] font-bold uppercase text-[#93a5ad]">
              MXN / mes
            </span>
          </span>
        </div>

        <span
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${
            wantPremium
              ? "bg-emerald-500 text-white"
              : "bg-white/[0.04] text-[#647a84] ring-1 ring-white/15"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {wantPremium
            ? "Premium seleccionado"
            : "Seleccionar cuenta Premium"}
        </span>
      </button>

      {wantPremium && (
        <section className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
          <p className={labelClass}>Método de pago Premium</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {paymentOptions.map((option) => {
              const selected = method === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMethod(option.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-[#2e9cff] bg-white/[0.04] ring-2 ring-[#2e9cff]/15"
                      : "border-white/15 bg-white/[0.04] hover:border-white/25"
                  }`}
                >
                  <p className="text-xs font-bold text-[#e8edef]">
                    {option.title}
                  </p>
                  <p className="mt-1 text-[10px] text-[#93a5ad]">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0d4652] px-5 py-4 text-sm font-black text-white shadow-xl shadow-[#0d4652]/20 transition hover:-translate-y-0.5 hover:bg-[#082f3b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}

        {wantPremium
          ? "Crear cuenta y activar Premium"
          : "Crear mi cuenta gratuita"}
      </button>
    </form>
  );
}

function RegisterSidebar({ kind }: { kind: RegisterKind }) {
  const isBusiness = kind === "business";

  return (
    <aside className="space-y-5 lg:col-span-2">
      <div className="overflow-hidden rounded-[1.75rem] bg-[#082f3b] p-6 text-white shadow-xl shadow-[#082f3b]/15">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d97832]/20 bg-[#d97832]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d97832]">
          <Sparkles className="h-3.5 w-3.5" />
          {isBusiness ? "Visibilidad territorial" : "Identidad soberana"}
        </span>

        <h3 className="mt-5 text-xl font-black leading-tight">
          {isBusiness
            ? "Tu comercio, visible donde importan las decisiones."
            : "Una cuenta para vivir el territorio de otra forma."}
        </h3>

        <p className="mt-3 text-sm leading-6 text-[#c9d0d4]">
          {isBusiness
            ? "Conecta tu oferta local con visitantes, residentes y las recomendaciones inteligentes de Isabella."
            : "Conecta con experiencias, recompensas, cultura y oportunidades dentro de la Comarca Minera."}
        </p>

        <div className="mt-6 space-y-4">
          {isBusiness ? (
            <>
              <SidebarFeature
                icon={<MapPin className="h-4 w-4" />}
                title="Mapa territorial"
                text="Ubicación visible para visitantes y residentes."
              />
              <SidebarFeature
                icon={<Store className="h-4 w-4" />}
                title="Catálogo profesional"
                text="Ficha comercial clara, visual y actualizable."
              />
              <SidebarFeature
                icon={<Sparkles className="h-4 w-4" />}
                title="Recomendaciones inteligentes"
                text="Presencia en experiencias sugeridas por Isabella."
              />
              <SidebarFeature
                icon={<Tag className="h-4 w-4" />}
                title="Promociones activas"
                text="Comunica ofertas y beneficios a tu audiencia."
              />
            </>
          ) : (
            <>
              <SidebarFeature
                icon={<Gift className="h-4 w-4" />}
                title="Bienvenida al Nodo"
                text="Recibe 250 XP al crear tu identidad."
              />
              <SidebarFeature
                icon={<Crown className="h-4 w-4" />}
                title="Beneficios Premium"
                text="Accede a cupones y experiencias exclusivas."
              />
              <SidebarFeature
                icon={<Sparkles className="h-4 w-4" />}
                title="Experiencias personalizadas"
                text="Descubre rutas y actividades según tus intereses."
              />
            </>
          )}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/15 bg-white/[0.04] p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-black text-[#e8edef]">
              Registro protegido
            </h4>
            <p className="text-xs text-[#93a5ad]">
              Información cuidada dentro del Nodo.
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-6 text-[#647a84]">
          Tu registro se integra a la arquitectura de identidad de Nodo Cero
          para gestionar acceso, beneficios y presencia territorial.
        </p>
      </div>
    </aside>
  );
}

function SidebarFeature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#d97832]">
        {icon}
      </span>

      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#c9d0d4]">{text}</p>
      </div>
    </div>
  );
}
