/**
 * RDM Digital Hub — Lógica de interfaz
 * Arquitectura: ultra-minimalismo editorial · accesibilidad primero
 * © 2026 Ecosistema Territorial Soberano
 */

(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============================================================
    // 1. PASAPORTE DE IDENTIDAD (persistencia en localStorage)
    // ============================================================
    const passportBtn = document.getElementById('passportBtn');
    const passportLabel = document.getElementById('passportLabel');
    const heroText = document.getElementById('main-hero-txt');
    const leadOficina = document.getElementById('oficina-lead');

    let localIdentityActive = false;

    const HERO_COPY = {
        guest: 'Real del Monte: <em>Identidad y Soberanía Territorial</em>',
        local: 'Panel Comunal: <em>Gobernanza y Datos del Territorio</em>',
    };
    const OFICINA_COPY = {
        guest: 'Un recorrido estético por las leyendas, el comercio de alta gama y la geografía inmersiva de la montaña.',
        local: 'Vistas optimizadas para la gestión comunal, asambleas ciudadanas e infraestructura interna.',
    };

    function readStoredIdentity() {
        try { return localStorage.getItem('rdm_passport_identity'); }
        catch { return null; }
    }
    function storeIdentity(value) {
        try { localStorage.setItem('rdm_passport_identity', value); }
        catch { /* modo privado: se ignora sin romper */ }
    }

    function applyIdentity(isLocal) {
        localIdentityActive = isLocal;
        const key = isLocal ? 'local' : 'guest';

        if (passportLabel) passportLabel.textContent = isLocal ? 'Pasaporte: Local / Comunero' : 'Pasaporte: Huésped';
        if (passportBtn) passportBtn.setAttribute('aria-pressed', String(isLocal));
        if (heroText) heroText.innerHTML = HERO_COPY[key];
        if (leadOficina) leadOficina.textContent = OFICINA_COPY[key];
    }

    if (passportBtn) {
        passportBtn.addEventListener('click', () => {
            const next = !localIdentityActive;
            applyIdentity(next);
            storeIdentity(next ? 'local' : 'guest');
        });
    }

    // ============================================================
    // 2. NAVEGACIÓN MÓVIL
    // ============================================================
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobile-nav');

    function setMobileNav(open) {
        if (!navToggle || !mobileNav) return;
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        mobileNav.hidden = !open;
        document.body.classList.toggle('nav-open', open);
    }

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', () => {
            setMobileNav(navToggle.getAttribute('aria-expanded') !== 'true');
        });
        mobileNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMobileNav(false));
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMobileNav(false);
        });
        // Cerrar si se regresa a viewport de escritorio
        window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
            if (e.matches) setMobileNav(false);
        });
    }

    // ============================================================
    // 3. DROPDOWN ACCESIBLE POR TECLADO
    // ============================================================
    document.querySelectorAll('.has-dropdown > .nav-link').forEach((trigger) => {
        const item = trigger.parentElement;
        item.addEventListener('focusin', () => trigger.setAttribute('aria-expanded', 'true'));
        item.addEventListener('focusout', (e) => {
            if (!item.contains(e.relatedTarget)) trigger.setAttribute('aria-expanded', 'false');
        });
        item.addEventListener('mouseenter', () => trigger.setAttribute('aria-expanded', 'true'));
        item.addEventListener('mouseleave', () => trigger.setAttribute('aria-expanded', 'false'));
    });

    // ============================================================
    // 4. HEADER: sombra al hacer scroll
    // ============================================================
    const header = document.querySelector('header[data-header]');
    if (header) {
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ============================================================
    // 5. SCROLL-SPY (IntersectionObserver → resalta el enlace activo)
    // ============================================================
    const spyLinks = new Map();
    document.querySelectorAll('.nav-link[data-spy]').forEach((link) => {
        spyLinks.set(link.dataset.spy, link.closest('.nav-item'));
    });
    const sections = document.querySelectorAll('.canvas-section');

    if (spyLinks.size && sections.length && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                spyLinks.forEach((item) => item.classList.remove('active'));
                const active = spyLinks.get(entry.target.id);
                if (active) active.classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach((section) => spy.observe(section));
    }

    // ============================================================
    // 6. REVEAL ON SCROLL (entrada escalonada)
    // ============================================================
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealEls.forEach((el) => el.classList.add('is-visible'));
        } else {
            const revealObs = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry, i) => {
                    if (!entry.isIntersecting) return;
                    setTimeout(() => entry.target.classList.add('is-visible'), i * 90);
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.15 });
            revealEls.forEach((el) => revealObs.observe(el));
        }
    }

    // ============================================================
    // 7. VISUALIZADOR DE AUDIO (Web Audio API, tolerante a fallos)
    // ============================================================
    class AudioVisualizer {
        constructor(audio, canvas) {
            this.audio = audio;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.ready = false;
            this.rafId = null;
            audio.addEventListener('play', () => this.start(), { once: false });
            audio.addEventListener('pause', () => this.stop());
            audio.addEventListener('ended', () => this.stop());
            window.addEventListener('resize', () => this.resize());
            this.resize();
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = this.canvas.getBoundingClientRect();
            if (!rect.width) return;
            this.canvas.width = Math.round(rect.width * dpr);
            this.canvas.height = Math.round(rect.height * dpr);
        }

        start() {
            if (!this.ready) {
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (!AudioCtx) return;
                    this.audioContext = new AudioCtx();
                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 128;
                    this.source = this.audioContext.createMediaElementSource(this.audio);
                    this.source.connect(this.analyser);
                    this.analyser.connect(this.audioContext.destination);
                    this.data = new Uint8Array(this.analyser.frequencyBinCount);
                    this.ready = true;
                } catch {
                    // Navegador sin soporte o fuente ya conectada: silencioso
                    return;
                }
            }
            if (this.audioContext && this.audioContext.state === 'suspended') this.audioContext.resume();
            this.draw();
        }

        stop() { if (this.rafId) cancelAnimationFrame(this.rafId); this.rafId = null; }

        draw() {
            if (!this.ready) return;
            this.rafId = requestAnimationFrame(() => this.draw());
            this.analyser.getByteFrequencyData(this.data);

            const { width, height } = this.canvas;
            this.ctx.clearRect(0, 0, width, height);

            const bars = this.data.length;
            const gap = 2;
            const barWidth = (width - gap * (bars - 1)) / bars;
            let x = 0;
            for (let i = 0; i < bars; i++) {
                const barHeight = (this.data[i] / 255) * height * 0.92;
                const g = this.ctx.createLinearGradient(0, height, 0, height - barHeight);
                g.addColorStop(0, 'rgba(142, 115, 69, 0.35)');
                g.addColorStop(1, 'rgba(197, 168, 114, 0.95)');
                this.ctx.fillStyle = g;
                this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                x += barWidth + gap;
            }
        }
    }

    document.querySelectorAll('[data-audio-strip]').forEach((strip) => {
        const audio = strip.querySelector('audio');
        const canvas = strip.querySelector('canvas');
        const fallback = strip.querySelector('[data-audio-fallback]');
        if (!audio || !canvas) return;

        // Si la fuente de audio no existe, indica el estado demo con claridad
        audio.addEventListener('error', () => {
            if (fallback) fallback.textContent = 'Audio no disponible en esta vista previa estática.';
        }, true);

        new AudioVisualizer(audio, canvas);
    });

    // ============================================================
    // 8. ANIMACIÓN DE NÚMEROS (dashboard)
    // ============================================================
    function animateValue(el, end, suffix, duration) {
        const start = performance.now();
        const format = (n) => Math.round(n).toLocaleString('es-MX') + suffix;
        if (prefersReducedMotion) { el.textContent = format(end); return; }
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            el.textContent = format(end * eased);
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    const numbers = document.querySelectorAll('.big-number[data-value]');
    if (numbers.length && 'IntersectionObserver' in window) {
        const numObs = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                animateValue(el, parseInt(el.dataset.value, 10) || 0, el.dataset.suffix || '', 1800);
                obs.unobserve(el);
            });
        }, { threshold: 0.5 });
        numbers.forEach((el) => numObs.observe(el));
    } else {
        numbers.forEach((el) => { el.textContent = (parseInt(el.dataset.value, 10) || 0).toLocaleString('es-MX') + (el.dataset.suffix || ''); });
    }

    // ============================================================
    // 9. FORMULARIO DE CONTACTO (con estado honesto)
    // ============================================================
    const form = document.querySelector('.contact-form-premium');
    if (form) {
        const status = form.querySelector('[data-form-status]');
        const btn = form.querySelector('.submit-btn-premium');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;

            const original = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Enviando…';
            if (status) { status.textContent = ''; status.className = 'form-status'; }

            try {
                const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
                if (!res.ok) throw new Error('bad-status');
                if (status) { status.textContent = 'Mensaje enviado. Gracias por tu interés.'; status.classList.add('is-ok'); }
                form.reset();
            } catch {
                if (status) {
                    status.textContent = 'Vista previa estática: el endpoint /api/contacto se conecta en el despliegue real.';
                    status.classList.add('is-error');
                }
            } finally {
                btn.disabled = false;
                btn.textContent = original;
            }
        });
    }

    // ============================================================
    // 10. ESTADO INICIAL DEL PASAPORTE
    // ============================================================
    applyIdentity(readStoredIdentity() === 'local');
})();
