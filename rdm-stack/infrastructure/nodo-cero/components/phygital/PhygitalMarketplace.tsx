"use client";

import React, { useState } from 'react';
import { RDM_POIS } from '@/lib/data/rdm-data';
import { Store, ShoppingBag, QrCode, Award, ShieldCheck, Sparkles, Check, ChevronRight } from 'lucide-react';

interface CommerceItem {
  id: string;
  name: string;
  merchant: string;
  category: 'paste' | 'plata' | 'tour' | 'hotel';
  price: number;
  rating: number;
  image: string;
  badge: string;
  description: string;
}

const marketplaceItems: CommerceItem[] = [
  {
    id: 'prod-01',
    name: 'Paste Cornish Tradicional (Carne con Papa y Chile)',
    merchant: 'Pasteles El Portal & Museo del Paste',
    category: 'paste',
    price: 35,
    rating: 4.9,
    image: '/images/gastronomia-1.jpg',
    badge: 'Receta Tradicional 1824',
    description: 'Paste artesanal horneado con el auténtico trenzado lateral de Cornualles.',
  },
  {
    id: 'prod-02',
    name: 'Dije de Plata Ley .925 Mina de Acosta',
    merchant: 'Taller de Platería Arte Minero',
    category: 'plata',
    price: 890,
    rating: 4.95,
    image: '/images/real-2.jpg',
    badge: 'Sello Cripto .925',
    description: 'Joyería forjada a mano con plata purificada de la comarca minera.',
  },
  {
    id: 'prod-03',
    name: 'Boleto Tour Guiado Socavón Mina de Acosta',
    merchant: 'Patronato Minero RDM',
    category: 'tour',
    price: 120,
    rating: 4.88,
    image: '/images/mina-acosta.jpg',
    badge: 'Pasaporte RDM Válido',
    description: 'Entrada completa con casco de minero, lámpara e historiador certificado.',
  },
  {
    id: 'prod-04',
    name: 'Paste Dulce de Arroz con Leche y Pasas',
    merchant: 'Pastelería Real Cornish',
    category: 'paste',
    price: 35,
    rating: 4.85,
    image: '/images/gastronomia-4.jpg',
    badge: 'Insignia Dulce Monte',
    description: 'El postre tradicional de la cocina hidalguense.',
  },
  {
    id: 'prod-05',
    name: 'Anillo de Plata Esculpida con Cuarzo de Mina',
    merchant: 'Platería El Galeón Real',
    category: 'plata',
    price: 1450,
    rating: 4.92,
    image: '/images/plaza-principal.jpg',
    badge: 'Certificado Inmutable',
    description: 'Diseño exclusivo inspirado en la arquitectura churrigueresca de la Parroquia.',
  },
  {
    id: 'prod-06',
    name: 'Noche de Hospedaje Hotel Boutique Casona Minera',
    merchant: 'Hotel Casona Minera RDM',
    category: 'hotel',
    price: 1850,
    rating: 4.9,
    image: '/images/centro.jpg',
    badge: 'Sello Confort Soberano',
    description: 'Casona del siglo XIX restaurada con chimenea de piedra y vista al bosque de oyameles.',
  },
];

export default function PhygitalMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ item: CommerceItem; qty: number }[]>([]);
  const [showQRModal, setShowQRModal] = useState<CommerceItem | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? marketplaceItems
    : marketplaceItems.filter(i => i.category === selectedCategory);

  const addToCart = (item: CommerceItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const totalPrice = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);

  return (
    <div className="space-y-6">
      
      {/* Category Tabs & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-400" />
            Marketplace Phygital Real del Monte
          </h3>
          <p className="text-xs text-slate-300 font-mono">
            Comercio soberano sin comisiones abusivas // Productos garantizados con sello digital
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {[
            { id: 'all', label: 'Todo' },
            { id: 'paste', label: 'Pastes' },
            { id: 'plata', label: 'Platería' },
            { id: 'tour', label: 'Tours' },
            { id: 'hotel', label: 'Hoteles' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="group rounded-2xl glass-panel-interactive border border-white/10 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Product Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg glass-panel border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {item.badge}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-slate-950/80 text-xs font-bold text-amber-400">
                  ★ {item.rating}
                </div>
              </div>

              {/* Product Content */}
              <div className="p-5 space-y-2">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  {item.merchant}
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Price & Action Footer */}
            <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Precio Público</span>
                <span className="text-lg font-black text-white">${item.price} MXN</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQRModal(item)}
                  className="p-2.5 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 hover:text-white transition-all"
                  title="Ver Sello QR Phygital"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  onClick={() => addToCart(item)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-lg flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Adquirir
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Cart Summary Bar if Items added */}
      {cart.length > 0 && (
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/40 bg-amber-950/40 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-sm font-bold text-white">
                Carrito Phygital RDM ({cart.reduce((a, c) => a + c.qty, 0)} artículos)
              </div>
              <div className="text-xs text-amber-200 font-mono">
                Sello de Transacción Cripto-Firmado con Registro en Ledger
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xl font-black text-white">${totalPrice} MXN</span>
            <button
              onClick={() => alert(`Transacción simulada iniciada para RDM Digital Hub. Total: $${totalPrice} MXN. ¡Sello Criptográfico emitido!`)}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-all shadow-md"
            >
              Completar Pago Phygital
            </button>
          </div>
        </div>
      )}

      {/* QR Phygital Code Inspection Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 glass-panel rounded-2xl border border-cyan-500/40 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">{showQRModal.name}</h3>
            <p className="text-xs text-slate-300 font-mono">{showQRModal.merchant}</p>

            {/* Simulated QR Box */}
            <div className="p-6 bg-white rounded-xl w-48 h-48 mx-auto flex items-center justify-center shadow-2xl">
              <div className="w-full h-full border-4 border-slate-950 p-2 flex flex-col justify-between items-center font-mono text-[9px] text-slate-950">
                <div className="w-full flex justify-between font-bold">
                  <span>RDM-SOBERANO</span>
                  <span>.925</span>
                </div>
                <div className="w-20 h-20 bg-slate-950 p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-white p-1">
                    <div className="w-full h-full bg-slate-950" />
                  </div>
                </div>
                <div className="font-bold">SELLO PHYGITAL RDM</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-cyan-300">
              Insignia: {showQRModal.badge} &bull; Hash de autenticidad auditado
            </div>

            <button
              onClick={() => setShowQRModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-white font-bold text-xs transition-all"
            >
              Cerrar Inspección
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
