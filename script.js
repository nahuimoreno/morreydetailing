// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Menú móvil toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
    
    // Animación de scroll suave para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Ajuste para el header
                const headerOffset = 60;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Reproducción del video del hero con fallback tras interacción
    const heroVideo = document.querySelector('#heroVideo');
    if (heroVideo) {
        try {
            heroVideo.muted = true; // asegurar mute en runtime
            heroVideo.playsInline = true; // iOS inline
            heroVideo.preload = 'auto';
        } catch (e) {}

        const tryPlay = () => {
            const p = heroVideo.play();
            if (p && typeof p.then === 'function') {
                p.catch(() => {
                    const once = () => {
                        heroVideo.play().catch(() => {});
                        document.removeEventListener('click', once);
                        document.removeEventListener('touchstart', once);
                        document.removeEventListener('scroll', once);
                    };
                    document.addEventListener('click', once, { once: true });
                    document.addEventListener('touchstart', once, { once: true });
                    document.addEventListener('scroll', once, { once: true });
                });
            }
        };
        heroVideo.addEventListener('canplay', tryPlay, { once: true });
        // Intento adicional por si canplay tarda
        setTimeout(tryPlay, 600);
    }
    
    // Formulario de contacto: enviar por Email o WhatsApp
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const phoneInput = contactForm.querySelector('input[type="tel"]');
        const messageInput = contactForm.querySelector('textarea');

        const btnEmail = contactForm.querySelector('.btn-email');
        const btnWhatsApp = contactForm.querySelector('.btn-whatsapp');

        const buildMessage = () => {
            const name = (nameInput?.value || '').trim();
            const email = (emailInput?.value || '').trim();
            const phone = (phoneInput?.value || '').trim();
            const msg = (messageInput?.value || '').trim();
            return `Hola Morrey Detailing,%0A%0A` +
                   `Nombre: ${encodeURIComponent(name)}%0A` +
                   `Email: ${encodeURIComponent(email)}%0A` +
                   `Teléfono: ${encodeURIComponent(phone)}%0A` +
                   `Mensaje:%0A${encodeURIComponent(msg)}%0A%0A` +
                   `Enviado desde la web.`;
        };

        const validateForm = () => {
            let valid = true;
            [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
                if (!input) return;
                if (!input.value.trim()) {
                    valid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '#333';
                }
            });
            return valid;
        };

        // Enviar por Email
        if (btnEmail) {
            btnEmail.addEventListener('click', (e) => {
                e.preventDefault();
                if (!validateForm()) return;
                const subject = encodeURIComponent('Morrey Detailing - Agenda de Cita');
                const body = buildMessage();
                const mailto = `mailto:contacto@morreydetailing.com?subject=${subject}&body=${body}`;
                window.location.href = mailto;
            });
        }

        // Enviar por WhatsApp
        if (btnWhatsApp) {
            btnWhatsApp.addEventListener('click', (e) => {
                e.preventDefault();
                if (!validateForm()) return;
                const text = buildMessage();
                const phoneNumber = '5491156359321';
                const waUrl = `https://wa.me/${phoneNumber}?text=${text}`;
                window.open(waUrl, '_blank');
            });
        }
    }
    
    // Efectos de scroll con IntersectionObserver
    const revealElements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                // Permitir retraso por data-delay
                const delay = el.getAttribute('data-delay');
                if (delay) {
                    el.style.transitionDelay = delay;
                }
                el.classList.add('is-visible');
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));

    // Arrastre con el mouse para la galería horizontal
    let lastDragTime = 0; // registro de arrastre para suprimir clic inmediato
    const gallery = document.querySelector('.gallery-grid');
    if (gallery) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let lastX;
        let velocity = 0;

        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            gallery.classList.add('active');
            startX = e.pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
            lastX = startX;
            velocity = 0;
            lastDragTime = 0;
            // Desactivar smooth durante el arrastre para respuesta inmediata
            gallery.style.scrollBehavior = 'auto';
            e.preventDefault();
        });
        gallery.addEventListener('mouseleave', () => {
            isDown = false;
            gallery.classList.remove('active');
            applyInertia();
        });
        window.addEventListener('mouseup', () => {
            isDown = false;
            gallery.classList.remove('active');
            applyInertia();
        });
        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const dx = x - lastX;
            velocity = dx;
            const walk = (x - startX) * 1.35; // ajuste para arrastre más controlado y fluido
            const newScrollLeft = scrollLeft - walk;
            gallery.scrollLeft = newScrollLeft;
            lastX = x;
            // Wrap continuo imperceptible
            if (typeof wrapIfNeeded === 'function') wrapIfNeeded();
            lastDragTime = Date.now();
        });

        // Evitar arrastre nativo de imágenes
        const galleryImages = gallery.querySelectorAll('img');
        galleryImages.forEach(img => {
            img.setAttribute('draggable', 'false');
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
        gallery.addEventListener('dragstart', (e) => e.preventDefault());

        function applyInertia() {
            // Restaurar smooth para acciones programáticas
            gallery.style.scrollBehavior = 'smooth';
            let currentVelocity = velocity;
            function step() {
                if (Math.abs(currentVelocity) < 0.5) return;
                gallery.scrollLeft -= currentVelocity;
                // Wrap continuo durante inercia
                if (typeof wrapIfNeeded === 'function') wrapIfNeeded();
                currentVelocity *= 0.975; // fricción más suave para extender el deslizamiento
                requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        // Paginación por puntitos (grupos de 3 imágenes) y scroll infinito fluido
        const originalItems = Array.from(gallery.querySelectorAll('.gallery-item'));
        // Marcar originales y establecer índice para lightbox
        originalItems.forEach((item, i) => {
            item.classList.add('gallery-item--original');
            const img = item.querySelector('img');
            if (img) img.dataset.index = i;
        });
        // Calcular ancho del segmento original
        const first = originalItems[0];
        const last = originalItems[originalItems.length - 1];
        const segmentWidth = last.offsetLeft - first.offsetLeft + last.offsetWidth;
        // Clonar a izquierda y derecha para efecto cinta sin trabas
        const fragLeft = document.createDocumentFragment();
        const fragRight = document.createDocumentFragment();
        originalItems.forEach((item) => {
            const c1 = item.cloneNode(true);
            const c2 = item.cloneNode(true);
            // Propagar dataset.index al clon
            const imgOriginal = item.querySelector('img');
            const img1 = c1.querySelector('img');
            const img2 = c2.querySelector('img');
            if (imgOriginal && img1) img1.dataset.index = imgOriginal.dataset.index;
            if (imgOriginal && img2) img2.dataset.index = imgOriginal.dataset.index;
            // Asegurar que los clones NO estén marcados como originales
            c1.classList.remove('gallery-item--original');
            c2.classList.remove('gallery-item--original');
            fragLeft.appendChild(c1);
            fragRight.appendChild(c2);
        });
        gallery.insertBefore(fragLeft, gallery.firstChild);
        gallery.appendChild(fragRight);
        // Posicionar vista en el segmento central (original)
        gallery.scrollLeft = segmentWidth;

        // Ajuste de wrap continuo imperceptible
        function wrapIfNeeded() {
            if (gallery.scrollLeft < segmentWidth * 0.5) {
                gallery.scrollLeft += segmentWidth;
            } else if (gallery.scrollLeft > segmentWidth * 1.5) {
                gallery.scrollLeft -= segmentWidth;
            }
        }

        const items = Array.from(document.querySelectorAll('.gallery-item--original'));
        const pagination = document.createElement('div');
        pagination.className = 'gallery-pagination';
        gallery.parentNode.insertBefore(pagination, gallery.nextSibling);

        const groupSize = 3;
        const groupCount = Math.ceil(items.length / groupSize);
        const dots = Array.from({ length: groupCount }, (_, groupIndex) => {
            const dot = document.createElement('span');
            dot.className = 'gallery-dot';
            dot.setAttribute('aria-label', `Ir al grupo ${groupIndex + 1}`);
            pagination.appendChild(dot);
            return dot;
        });

        function setActiveDot(activeIndex) {
            const activeGroup = Math.floor(activeIndex / groupSize);
            dots.forEach((d, i) => {
                if (i === activeGroup) d.classList.add('active');
                else d.classList.remove('active');
            });
        }

        function updateActiveDot() {
            if (!items.length) return;
            // Cada punto representa 3 fotos: usar centro de la vista para determinar el grupo
            let step;
            if (items.length > 1) {
                step = items[1].offsetLeft - items[0].offsetLeft;
            } else {
                const cs = getComputedStyle(gallery);
                const gap = parseFloat(cs.gap || '0') || 0;
                step = items[0].clientWidth + gap;
            }
            const base = items[0].offsetLeft;
            const center = gallery.scrollLeft + gallery.clientWidth / 2;
            const deltaCenter = center - base;
            const centerItemIdx = Math.round(deltaCenter / step);
            let groupIdx = Math.floor(centerItemIdx / groupSize);
            // Normalizar dentro de [0, groupCount)
            groupIdx = ((groupIdx % groupCount) + groupCount) % groupCount;
            const itemIdx = Math.min(items.length - 1, groupIdx * groupSize);
            setActiveDot(itemIdx);
        }

        // Inicializar estado activo
        updateActiveDot();
        gallery.addEventListener('scroll', updateActiveDot);

        // Navegación manual con animación fluida
        const advanceDuration = 600; // animación más rápida y suave al navegar
        let currentIndex = 0;

        function computeClosestIndex() {
            const center = gallery.scrollLeft + gallery.clientWidth / 2;
            let closestIndex = 0;
            let closestDist = Infinity;
            items.forEach((item, i) => {
                const itemCenter = item.offsetLeft + item.clientWidth / 2;
                const dist = Math.abs(itemCenter - center);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIndex = i;
                }
            });
            return closestIndex;
        }

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animateScrollTo(targetLeft, duration, onComplete) {
            const startLeft = gallery.scrollLeft;
            const delta = targetLeft - startLeft;
            const startTime = performance.now();
            // Asegurar desplazamiento controlado por RAF
            gallery.style.scrollBehavior = 'auto';

            function step(now) {
                const elapsed = now - startTime;
                const t = Math.min(1, elapsed / duration);
                const eased = easeInOutCubic(t);
                gallery.scrollLeft = startLeft + delta * eased;

                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    if (typeof onComplete === 'function') onComplete();
                }
            }
            requestAnimationFrame(step);
        }

        function scrollToIndexAnimated(index, onComplete) {
            const clamped = Math.max(0, Math.min(items.length - 1, index));
            const target = items[clamped].offsetLeft;
            animateScrollTo(target, advanceDuration, () => {
                setActiveDot(clamped);
                currentIndex = clamped;
                if (typeof onComplete === 'function') onComplete();
            });
        }

        // Solo navegación manual: puntitos y arrastre

        // Actualizar punto activo durante scroll manual
        gallery.addEventListener('scroll', updateActiveDot);

        // Sin auto-play: no se reinicia automáticamente

        // Click en puntitos (por grupo de 3)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const targetIndex = index * groupSize;
                scrollToIndexAnimated(targetIndex, () => {
                    // No auto-play
                });
            });
        });

        // Sin flechas: navegación por puntitos, arrastre e teclado con wrap

        // Navegación con teclado, por grupos de 3 con wrap infinito
        document.addEventListener('keydown', (e) => {
            // Evitar interferir con el lightbox
            const lb = document.getElementById('lightbox');
            if (lb && lb.classList.contains('active')) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const currentGroup = Math.floor(currentIndex / groupSize);
                const nextGroup = (currentGroup + 1) % groupCount;
                const nextIndex = nextGroup * groupSize;
                scrollToIndexAnimated(nextIndex);
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const currentGroup = Math.floor(currentIndex / groupSize);
                const prevGroup = (currentGroup - 1 + groupCount) % groupCount;
                const prevIndex = prevGroup * groupSize;
                scrollToIndexAnimated(prevIndex);
            }
        });
        // Sin inicio automático: el usuario controla el pase
    }

    // Lightbox para galería de trabajos
    const galleryImgsOriginal = Array.from(document.querySelectorAll('.gallery-grid .gallery-item--original img'));
    const galleryImgsAll = Array.from(document.querySelectorAll('.gallery-grid .gallery-item img'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-image') : null;
    const btnClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const btnPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const btnNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    let currentLightboxIndex = 0;

    function openLightbox(index) {
        if (!lightbox || !lightboxImg) return;
        currentLightboxIndex = index;
        lightboxImg.src = galleryImgsOriginal[currentLightboxIndex].src;
        lightboxImg.alt = galleryImgsOriginal[currentLightboxIndex].alt || 'Imagen ampliada';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        if (!galleryImgsOriginal.length) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + galleryImgsOriginal.length) % galleryImgsOriginal.length;
        lightboxImg.src = galleryImgsOriginal[currentLightboxIndex].src;
        lightboxImg.alt = galleryImgsOriginal[currentLightboxIndex].alt || 'Imagen ampliada';
    }

    function showNext() {
        if (!galleryImgsOriginal.length) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % galleryImgsOriginal.length;
        lightboxImg.src = galleryImgsOriginal[currentLightboxIndex].src;
        lightboxImg.alt = galleryImgsOriginal[currentLightboxIndex].alt || 'Imagen ampliada';
    }

    if (galleryImgsOriginal.length && lightbox && lightboxImg) {
        galleryImgsAll.forEach((img) => {
            // Suprimir apertura si hubo arrastre reciente; clic abre el lightbox
            img.addEventListener('click', (e) => {
                if (Date.now() - lastDragTime < 200) {
                    e.preventDefault();
                    return;
                }
                const idx = parseInt(img.dataset.index, 10) || 0;
                openLightbox(idx);
            });
        });

        if (btnClose) btnClose.addEventListener('click', closeLightbox);
        if (btnPrev) btnPrev.addEventListener('click', showPrev);
        if (btnNext) btnNext.addEventListener('click', showNext);

        // Cerrar al hacer clic fuera de la imagen
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }
});