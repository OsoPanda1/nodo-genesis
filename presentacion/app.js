/**
 * VISITA REAL DEL MONTE — Destino Turístico Inteligente
 * Lógica de interfaz · accesibilidad primero · tolerante a fallos
 * © 2026 · visitarealdelmonte.online
 */

(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const RDM = { lat: 20.1386, lon: -98.6577 };
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // ============================================================
    // 1. HERO CONTEXTUAL POR HORA DEL DÍA
    // ============================================================
    function applyTimeOfDay() {
        const h = new Date().getHours();
        let tod, greeting;
        if (h >= 5 && h < 11)       { tod = 'dawn';  greeting = 'Amanece entre la niebla de la sierra'; }
        else if (h >= 11 && h < 17) { tod = 'day';   greeting = 'Mediodía sobre el pueblo minero'; }
        else if (h >= 17 && h < 20) { tod = 'dusk';  greeting = 'Atardece sobre las minas'; }
        else                        { tod = 'night'; greeting = 'Noche fría en la montaña'; }

        document.documentElement.className = 'tod-' + tod;
        const g = $('#contextGreeting');
        if (g) g.textContent = greeting;
    }

    // ============================================================
    // 2. TELEMETRÍA DTI (clima + aire reales vía Open-Meteo; aforo estimado)
    // ============================================================
    function dressAdvice(temp) {
        if (temp == null) return '—';
        if (temp < 8)  return 'Abrigo grueso';
        if (temp < 14) return 'Chamarra y capas';
        if (temp < 20) return 'Suéter ligero';
        return 'Ropa fresca';
    }
    function aqiLabel(aqi) {
        if (aqi == null) return { text: '—', cls: '' };
        if (aqi <= 50)  return { text: `${aqi} · Buena`, cls: 'is-good' };
        if (aqi <= 100) return { text: `${aqi} · Moderada`, cls: 'is-warn' };
        return { text: `${aqi} · Alta`, cls: 'is-bad' };
    }
    function foggyHint(code, humidity) {
        // WMO codes 45/48 = niebla; humedad alta sugiere neblina en la sierra
        if (code === 45 || code === 48) return ' · niebla';
        if (humidity != null && humidity > 88) return ' · posible neblina';
        return '';
    }
    // Aforo/estacionamiento: heurística determinista por día y hora (transparente)
    function occupancyEstimate() {
        const now = new Date();
        const day = now.getDay(); // 0 dom … 6 sáb
        const h = now.getHours();
        const weekend = day === 0 || day === 6;
        let score = 0;
        if (h >= 12 && h <= 17) score += 2;
        else if (h >= 10 && h < 12) score += 1;
        else if (h > 17 && h <= 19) score += 1;
        if (weekend) score += 2;
        const level = score >= 3 ? 'alta' : score >= 2 ? 'media' : 'baja';
        const parking = score >= 3 ? 'lleno' : score >= 2 ? 'media' : 'libre';
        const parkingText = { libre: 'Disponible', media: 'Limitado', lleno: 'Saturado' }[parking];
        return { level, levelText: level.charAt(0).toUpperCase() + level.slice(1), parking, parkingText };
    }

    function setChip(id, text, level, cls) {
        const el = $('#' + id);
        if (!el) return;
        el.textContent = text;
        if (level) el.dataset.level = level; else delete el.dataset.level;
        el.classList.remove('is-good', 'is-warn', 'is-bad');
        if (cls) el.classList.add(cls);
    }

    async function loadTelemetry() {
        // Aforo/estacionamiento (siempre disponible, estimado)
        const occ = occupancyEstimate();
        setChip('tmAforo', occ.levelText, occ.level);
        setChip('tmParking', occ.parkingText, occ.parking);

        // Clima + aire reales (con degradación elegante)
        try {
            const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${RDM.lat}&longitude=${RDM.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=America/Mexico_City`;
            const res = await fetch(wxUrl);
            if (!res.ok) throw new Error('wx');
            const data = await res.json();
            const c = data.current || {};
            const temp = Math.round(c.temperature_2m);
            const detail = foggyHint(c.weather_code, c.relative_humidity_2m);
            setChip('tmClima', `${temp}°C${detail}`);
            setChip('tmVestimenta', dressAdvice(temp));
            const ctxDetail = $('#contextDetail');
            if (ctxDetail) ctxDetail.textContent = `${temp}°C · humedad ${Math.round(c.relative_humidity_2m)}% · ${dressAdvice(temp).toLowerCase()}`;
        } catch {
            setChip('tmClima', '≈ 15°C');
            setChip('tmVestimenta', 'Chamarra y capas');
            const ctxDetail = $('#contextDetail');
            if (ctxDetail) ctxDetail.textContent = 'Clima típico de montaña: fresco y cambiante. Lleva abrigo.';
        }

        try {
            const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${RDM.lat}&longitude=${RDM.lon}&current=us_aqi&timezone=America/Mexico_City`;
            const res = await fetch(aqUrl);
            if (!res.ok) throw new Error('aq');
            const data = await res.json();
            const aqi = Math.round(data.current?.us_aqi);
            const lbl = aqiLabel(aqi);
            setChip('tmAire', lbl.text, null, lbl.cls);
        } catch {
            setChip('tmAire', 'Buena', null, 'is-good');
        }
    }

    // ============================================================
    // 3. NAVEGACIÓN MÓVIL
    // ============================================================
    const navToggle = $('#navToggle');
    const mobileNav = $('#mobile-nav');
    function setMobileNav(open) {
        if (!navToggle || !mobileNav) return;
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        mobileNav.hidden = !open;
        document.body.classList.toggle('nav-open', open);
    }
    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', () => setMobileNav(navToggle.getAttribute('aria-expanded') !== 'true'));
        $$('a', mobileNav).forEach((l) => l.addEventListener('click', () => setMobileNav(false)));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMobileNav(false); });
        window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => { if (e.matches) setMobileNav(false); });
    }

    // ============================================================
    // 4. HEADER SCROLL + SCROLL-SPY
    // ============================================================
    const header = $('header[data-header]');
    if (header) {
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    const spyLinks = new Map();
    $$('.nav-link[data-spy]').forEach((link) => spyLinks.set(link.dataset.spy, link.closest('.nav-item')));
    const sections = $$('main > section[id]');
    if (spyLinks.size && sections.length && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                spyLinks.forEach((item) => item.classList.remove('active'));
                const active = spyLinks.get(entry.target.id);
                if (active) active.classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        sections.forEach((s) => spy.observe(s));
    }

    // ============================================================
    // 5. REVEAL ON SCROLL
    // ============================================================
    const revealEls = $$('.reveal');
    if (revealEls.length) {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealEls.forEach((el) => el.classList.add('is-visible'));
        } else {
            const obs = new IntersectionObserver((entries, o) => {
                entries.forEach((entry, i) => {
                    if (!entry.isIntersecting) return;
                    setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
                    o.unobserve(entry.target);
                });
            }, { threshold: 0.12 });
            revealEls.forEach((el) => obs.observe(el));
        }
    }

    // ============================================================
    // 6. PASAPORTE DIGITAL (localStorage + QR + progreso)
    // ============================================================
    const STAMP_KEY = 'rdm_passport_stamps';
    const STAMPS = ['mina', 'centro', 'panteon', 'penas', 'paste'];

    function readStamps() {
        try { return new Set(JSON.parse(localStorage.getItem(STAMP_KEY) || '[]')); }
        catch { return new Set(); }
    }
    function writeStamps(set) {
        try { localStorage.setItem(STAMP_KEY, JSON.stringify([...set])); } catch { /* modo privado */ }
    }
    let stamps = readStamps();

    function renderPassport() {
        const count = stamps.size;
        const total = STAMPS.length;
        const countEl = $('#passportCount');
        const progEl = $('#passportProgress');
        if (countEl) countEl.textContent = `${count}/${total}`;
        if (progEl) progEl.textContent = String(count);
        $$('.stamp-btn').forEach((btn) => {
            const on = stamps.has(btn.dataset.stamp);
            btn.classList.toggle('is-stamped', on);
            btn.setAttribute('aria-pressed', String(on));
        });
    }
    function toggleStamp(id) {
        if (!STAMPS.includes(id)) return;
        if (stamps.has(id)) stamps.delete(id); else stamps.add(id);
        writeStamps(stamps);
        renderPassport();
    }
    $$('.stamp-btn').forEach((btn) => btn.addEventListener('click', () => toggleStamp(btn.dataset.stamp)));

    const resetBtn = $('#resetPassport');
    if (resetBtn) resetBtn.addEventListener('click', () => { stamps = new Set(); writeStamps(stamps); renderPassport(); });

    // Marcar visita desde la galería
    $$('.art-frame[data-poi]').forEach((frame) => {
        frame.addEventListener('dblclick', () => toggleStamp(frame.dataset.poi));
    });

    // QR del pasaporte
    (function renderQR() {
        const canvas = $('#passportQr');
        if (!canvas || typeof QRious === 'undefined') return;
        try {
            new QRious({
                element: canvas,
                value: 'https://visitarealdelmonte.online/?pasaporte=rdm',
                size: 150,
                background: '#ffffff',
                foreground: '#0F172A',
                level: 'M',
            });
        } catch { /* silencioso */ }
    })();

    const passportBtn = $('#passportBtn');
    if (passportBtn) passportBtn.addEventListener('click', () => {
        const target = $('#experiencias');
        if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    renderPassport();

    // ============================================================
    // 7. MAPA INTERACTIVO (Leaflet) + FILTROS
    // ============================================================
    const POIS = [
        { id: 'mina', cat: 'patrimonio', name: 'Mina de Acosta', lat: 20.1436, lon: -98.6631, desc: 'Museo de sitio en la histórica bocamina.' },
        { id: 'panteon', cat: 'patrimonio', name: 'Panteón Inglés', lat: 20.1489, lon: -98.6672, desc: 'El único cementerio británico de México.' },
        { id: 'centro', cat: 'patrimonio', name: 'Parroquia de la Asunción', lat: 20.1383, lon: -98.6576, desc: 'Templo y plaza principal del centro histórico.' },
        { id: 'paste', cat: 'gastronomia', name: 'Museo del Paste', lat: 20.1372, lon: -98.6562, desc: 'La historia de la empanada cornish-mexicana.' },
        { id: 'penas', cat: 'naturaleza', name: 'Peñas Cargadas', lat: 20.1605, lon: -98.6305, desc: 'Formaciones rocosas y bosque de altura.' },
        { id: 'plateria', cat: 'artesanias', name: 'Corredor de Platería', lat: 20.1389, lon: -98.6588, desc: 'Talleres y tiendas de plata tradicional.' },
    ];

    let markers = [];
    function initMap() {
        const mapEl = $('#rdmMap');
        if (!mapEl || typeof L === 'undefined') return;
        try {
            const map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true }).setView([RDM.lat, RDM.lon], 14);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 19,
            }).addTo(map);

            POIS.forEach((poi) => {
                const icon = L.divIcon({ className: '', html: `<div class="rdm-pin pin-${poi.cat}"></div>`, iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24] });
                const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lon}`;
                const marker = L.marker([poi.lat, poi.lon], { icon, title: poi.name });
                marker.bindPopup(
                    `<div class="poi-popup"><h6>${poi.name}</h6><p>${poi.desc}</p>` +
                    `<div class="popup-actions">` +
                    `<a href="${gmaps}" target="_blank" rel="noopener">Cómo llegar</a>` +
                    `<button type="button" class="popup-stamp" data-stamp-map="${poi.id}">Registrar visita</button>` +
                    `</div></div>`
                );
                marker.on('popupopen', (e) => {
                    const b = e.popup.getElement()?.querySelector('[data-stamp-map]');
                    if (b) b.addEventListener('click', () => { toggleStamp(b.dataset.stampMap); b.textContent = stamps.has(b.dataset.stampMap) ? 'Visita registrada ✓' : 'Registrar visita'; }, { once: false });
                });
                marker._cat = poi.cat;
                marker.addTo(map);
                markers.push(marker);
            });

            $$('.filter-chip').forEach((chip) => {
                chip.addEventListener('click', () => {
                    $$('.filter-chip').forEach((c) => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
                    chip.classList.add('is-active');
                    chip.setAttribute('aria-pressed', 'true');
                    const f = chip.dataset.filter;
                    markers.forEach((m) => {
                        const show = f === 'all' || m._cat === f;
                        if (show) m.addTo(map); else map.removeLayer(m);
                    });
                });
            });

            // Reflow cuando la sección entra en vista (Leaflet en contenedores ocultos)
            setTimeout(() => map.invalidateSize(), 300);
            window.addEventListener('resize', () => map.invalidateSize());
        } catch (err) {
            console.log('[v0] Error al inicializar el mapa:', err.message);
        }
    }

    // ============================================================
    // 8. COMERCIO LOCAL (fichas con badges + contacto)
    // ============================================================
    const COMMERCE = [
        { name: 'Pastes Doña Reyna', cat: 'gastronomia', tag: 'Gastronomía', desc: 'Pastes artesanales de receta tradicional: papa con carne, mole y postres de la casa.', badges: ['Paste artesanal', 'Receta tradicional'], phone: '527711234567', lat: 20.1381, lon: -98.6579 },
        { name: 'Platería La Veta', cat: 'artesanias', tag: 'Artesanías', desc: 'Taller familiar de plata .925 con diseños inspirados en la herencia minera.', badges: ['Taller acreditado', 'Plata .925'], phone: '527711234568', lat: 20.1390, lon: -98.6586 },
        { name: 'Guías del Cerro', cat: 'naturaleza', tag: 'Naturaleza', desc: 'Recorridos guiados a Peñas Cargadas y minas históricas con guías locales certificados.', badges: ['Guía certificado', 'Turismo responsable'], phone: '527711234569', lat: 20.1600, lon: -98.6300 },
        { name: 'Café Minero 1824', cat: 'gastronomia', tag: 'Gastronomía', desc: 'Café de altura de la sierra, repostería y desayunos frente a la parroquia.', badges: ['Producto local', 'Comercio justo'], phone: '527711234570', lat: 20.1384, lon: -98.6575 },
    ];
    function renderCommerce() {
        const grid = $('#commerceGrid');
        if (!grid) return;
        grid.innerHTML = COMMERCE.map((c) => {
            const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}`;
            const wa = `https://wa.me/${c.phone}`;
            const badges = c.badges.map((b) => `<span class="cc-badge">✓ ${b}</span>`).join('');
            return `<article class="commerce-card">
                <span class="art-tag tag-${c.cat}">${c.tag}</span>
                <h4>${c.name}</h4>
                <p class="cc-desc">${c.desc}</p>
                <div class="cc-badges">${badges}</div>
                <div class="cc-actions">
                    <a class="btn btn-eco" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
                    <a class="btn btn-ghost" href="${gmaps}" target="_blank" rel="noopener">Cómo llegar</a>
                </div>
            </article>`;
        }).join('');
    }
    renderCommerce();

    // ============================================================
    // 9. AUDIO: VISUALIZADOR + REPRODUCTOR FLOTANTE PERSISTENTE
    // ============================================================
    class AudioVisualizer {
        constructor(audio, canvas) {
            this.audio = audio; this.canvas = canvas; this.ctx = canvas.getContext('2d');
            this.ready = false; this.rafId = null;
            audio.addEventListener('play', () => this.start());
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
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!AC) return;
                    this.ac = new AC();
                    this.analyser = this.ac.createAnalyser();
                    this.analyser.fftSize = 128;
                    this.src = this.ac.createMediaElementSource(this.audio);
                    this.src.connect(this.analyser);
                    this.analyser.connect(this.ac.destination);
                    this.data = new Uint8Array(this.analyser.frequencyBinCount);
                    this.ready = true;
                } catch { return; }
            }
            if (this.ac && this.ac.state === 'suspended') this.ac.resume();
            this.draw();
        }
        stop() { if (this.rafId) cancelAnimationFrame(this.rafId); this.rafId = null; }
        draw() {
            if (!this.ready) return;
            this.rafId = requestAnimationFrame(() => this.draw());
            this.analyser.getByteFrequencyData(this.data);
            const { width, height } = this.canvas;
            this.ctx.clearRect(0, 0, width, height);
            const bars = this.data.length, gap = 2;
            const bw = (width - gap * (bars - 1)) / bars;
            let x = 0;
            for (let i = 0; i < bars; i++) {
                const bh = (this.data[i] / 255) * height * 0.92;
                const g = this.ctx.createLinearGradient(0, height, 0, height - bh);
                g.addColorStop(0, 'rgba(217, 119, 6, 0.35)');
                g.addColorStop(1, 'rgba(245, 158, 11, 0.95)');
                this.ctx.fillStyle = g;
                this.ctx.fillRect(x, height - bh, bw, bh);
                x += bw + gap;
            }
        }
    }

    // Reproductor flotante
    const fp = $('#floatingPlayer');
    const fpToggle = $('#fpToggle');
    const fpClose = $('#fpClose');
    const fpTitle = $('#fpTitle');
    const fpBar = $('#fpBar');
    let currentAudio = null;

    function showFloating(audio) {
        if (!fp) return;
        currentAudio = audio;
        fp.hidden = false;
        if (fpTitle) fpTitle.textContent = audio.dataset.title || 'Audio-guía';
        if (fpToggle) fpToggle.textContent = '⏸';
    }
    function updateBar() {
        if (currentAudio && fpBar && currentAudio.duration) {
            fpBar.style.width = (currentAudio.currentTime / currentAudio.duration * 100) + '%';
        }
    }
    if (fpToggle) fpToggle.addEventListener('click', () => {
        if (!currentAudio) return;
        if (currentAudio.paused) { currentAudio.play(); fpToggle.textContent = '⏸'; }
        else { currentAudio.pause(); fpToggle.textContent = '▶'; }
    });
    if (fpClose) fpClose.addEventListener('click', () => {
        if (currentAudio) currentAudio.pause();
        if (fp) fp.hidden = true;
    });

    $$('[data-audio-strip]').forEach((strip) => {
        const audio = strip.querySelector('audio');
        const canvas = strip.querySelector('canvas');
        const playBtn = strip.querySelector('[data-audio-play]');
        const fallback = strip.querySelector('[data-audio-fallback]');
        if (!audio) return;

        if (canvas) new AudioVisualizer(audio, canvas);

        audio.addEventListener('error', () => {
            if (fallback) fallback.textContent = 'Audio no disponible en esta vista previa.';
            if (playBtn) { playBtn.disabled = true; playBtn.textContent = 'Próximamente'; }
        }, true);

        if (playBtn) playBtn.addEventListener('click', () => {
            // Pausa otros audios
            $$('audio').forEach((a) => { if (a !== audio) a.pause(); });
            $$('[data-audio-play]').forEach((b) => { if (b !== playBtn) { b.classList.remove('is-playing'); b.textContent = '▶ Reproducir'; } });
            if (audio.paused) { audio.play().catch(() => {}); playBtn.textContent = '⏸ Pausar'; playBtn.classList.add('is-playing'); showFloating(audio); }
            else { audio.pause(); playBtn.textContent = '▶ Reproducir'; playBtn.classList.remove('is-playing'); }
        });

        audio.addEventListener('timeupdate', () => { if (audio === currentAudio) updateBar(); });
        audio.addEventListener('ended', () => {
            if (playBtn) { playBtn.textContent = '▶ Reproducir'; playBtn.classList.remove('is-playing'); }
            if (fp && audio === currentAudio) fp.hidden = true;
        });
    });

    // ============================================================
    // 10. FORMULARIO DE CONTACTO
    // ============================================================
    const form = $('.contact-form-premium');
    if (form) {
        const status = form.querySelector('[data-form-status]');
        const btn = form.querySelector('.submit-btn-premium');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;
            const original = btn.textContent;
            btn.disabled = true; btn.textContent = 'Enviando…';
            if (status) { status.textContent = ''; status.className = 'form-status'; }
            try {
                const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
                if (!res.ok) throw new Error('bad-status');
                if (status) { status.textContent = '¡Mensaje enviado! Te responderemos pronto.'; status.classList.add('is-ok'); }
                form.reset();
            } catch {
                if (status) { status.textContent = 'Vista previa: el endpoint /api/contacto se activa en el despliegue real. Escríbenos por WhatsApp mientras tanto.'; status.classList.add('is-error'); }
            } finally {
                btn.disabled = false; btn.textContent = original;
            }
        });
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    applyTimeOfDay();
    loadTelemetry();
    initMap();
})();
