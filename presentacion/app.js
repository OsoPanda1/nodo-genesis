/**
 * RDM Digital Hub — Lógica de Interfaz de Alta Fidelidad
 * Arquitectura: Ultra-Minimalismo / Brutalismo Sofisticado
 * © 2026 Ecosistema Territorial SOBERANO
 */

// ============================================
// 1. PERSISTENCIA DE PASAPORTE (localStorage)
// ============================================

let localIdentityActive = false;

// Cargar estado guardado al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedIdentity = localStorage.getItem('rdm_passport_identity');
    if (savedIdentity === 'local') {
        togglePassportIdentity(true);
    }
    
    // Inicializar visualizadores de audio
    initAudioVisualizers();
    
    // Configurar animación de números del dashboard
    initDashboardAnimations();
});

// Función de mutación de identidad
function togglePassportIdentity(forceState = null) {
    const label = document.getElementById('passportLabel');
    const dot = document.getElementById('passportDot');
    const heroText = document.getElementById('main-hero-txt');
    const leadOficina = document.getElementById('oficina-lead');
    const passportBtn = document.getElementById('passportBtn');
    
    if (forceState !== null) {
        localIdentityActive = forceState;
    } else {
        localIdentityActive = !localIdentityActive;
    }
    
    // Persistir en localStorage
    localStorage.setItem('rdm_passport_identity', localIdentityActive ? 'local' : 'guest');
    
    if (localIdentityActive) {
        // Modo LOCAL / COMUNERO
        label.innerText = "PASAPORTE: LOCAL / COMUNERO";
        dot.style.backgroundColor = "var(--color-gold)";
        heroText.innerHTML = "Panel Comunal:<br><em>Gobernanza y Datos del Territorio</em>";
        if (leadOficina) {
            leadOficina.innerText = "Vistas optimizadas para la gestión comunal, asambleas ciudadanas e infraestructura interna.";
        }
        passportBtn.style.borderColor = "var(--color-gold)";
    } else {
        // Modo HUÉSPED
        label.innerText = "PASAPORTE: HUÉSPED";
        dot.style.backgroundColor = "#4A90E2";
        heroText.innerHTML = "Real del Monte:<br><em>Identidad y Soberanía Territorial</em>";
        if (leadOficina) {
            leadOficina.innerText = "Un recorrido estético por las leyendas, el comercio de alta gama y la geografía inmersiva de la montaña.";
        }
        passportBtn.style.borderColor = "var(--color-text)";
    }
}

// ============================================
// 2. SCROLL SUAVE MATEMÁTICO (fallback para navegadores sin CSS smooth)
// ============================================

function scrollToSection(id) {
    const target = document.getElementById(id);
    if (target) {
        const headerOffset = 90;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// ============================================
// 3. VISUALIZADORES DE AUDIO (Web Audio API)
// ============================================

class AudioVisualizer {
    constructor(audioElement, canvasElement) {
        this.audio = audioElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.animationId = null;
        
        // Inicializar cuando el usuario interactúe con el audio
        this.audio.addEventListener('play', () => this.initAudioContext());
    }
    
    initAudioContext() {
        if (this.audioContext) return;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.analyser.fftSize = 256;
        
        this.draw();
    }
    
    draw() {
        if (!this.analyser) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const renderFrame = () => {
            this.animationId = requestAnimationFrame(renderFrame);
            this.analyser.getByteFrequencyData(dataArray);
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const barWidth = (this.canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                
                // Gradiente dorado
                const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
                gradient.addColorStop(0, 'rgba(142, 115, 69, 0.3)');
                gradient.addColorStop(1, 'rgba(197, 168, 114, 0.9)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        renderFrame();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

function initAudioVisualizers() {
    const audioStrips = document.querySelectorAll('.audio-strip');
    
    audioStrips.forEach((strip) => {
        const audio = strip.querySelector('audio');
        const canvas = strip.querySelector('canvas');
        
        if (audio && canvas) {
            new AudioVisualizer(audio, canvas);
        }
    });
}

// ============================================
// 4. ANIMACIÓN DE NÚMEROS (Dashboard)
// ============================================

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / Math.max(range, 1)));
    
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current.toLocaleString('es-MX');
        
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

function initDashboardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.dataset.value, 10);
                
                // Animación con easing personalizado
                animateValue(target, 0, endValue, 2000);
                
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.big-number').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// 5. SCROLL-SPY DE ALTA FIDELIDAD (fallback para navegadores antiguos)
// ============================================

const hasNativeScrollSpy = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('scroll-target-group', 'auto');

if (!hasNativeScrollSpy) {
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.canvas-section');
        const navItems = document.querySelectorAll('.nav-item');
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 160) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('.nav-link');
            if (link && link.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });
}

// ============================================
// 6. OPTIMIZACIÓN DE PERFORMANCE (Lazy Loading de Imágenes)
// ============================================

if ('loading' in HTMLImageElement.prototype === false) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// 7. MANEJO DE FORMULARIO (Contacto)
// ============================================

document.querySelector('.contact-form-premium')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.submit-btn-premium');
    
    // Estado de carga
    submitBtn.textContent = 'ENVIANDO...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/contacto', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            submitBtn.textContent = 'ENVIADO';
            submitBtn.style.backgroundColor = 'var(--color-gold)';
            form.reset();
            
            setTimeout(() => {
                submitBtn.textContent = 'ENVIAR MENSAJE';
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = 'var(--color-text)';
            }, 3000);
        } else {
            throw new Error('Error en el envío');
        }
    } catch (error) {
        submitBtn.textContent = 'ERROR';
        submitBtn.style.backgroundColor = '#C41E3A';
        
        setTimeout(() => {
            submitBtn.textContent = 'ENVIAR MENSAJE';
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = 'var(--color-text)';
        }, 3000);
    }
});
