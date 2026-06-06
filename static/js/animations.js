/**
 * TokenShark Scroll & Reveal Animations
 * Intersection Observer, parallax, scroll-triggered effects
 */

(function() {
    'use strict';

    // ── Intersection Observer for Scroll Reveal ───────────
    const revealElements = document.querySelectorAll(
        '.feature-card, .testimonial-card, .pricing-card, .about-card, ' +
        '.feature-block, .stat-card, .hero-stat'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                entry.target.style.opacity = '1';
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animationDelay = `${index * 0.05}s`;
        revealObserver.observe(el);
    });

    // ── Parallax Effect for Hero ──────────────────────────
    const heroPreview = document.getElementById('hero-preview');
    if (heroPreview) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const rate = scrollY * 0.15;
            heroPreview.style.transform = `translateY(${rate}px)`;
        }, { passive: true });
    }

    // ── Counter Animation for Stats ─────────────────────────
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();
        const isFloat = target % 1 !== 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * easeOut;

            if (isFloat) {
                element.textContent = current.toFixed(2);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Observe stat values for counter animation
    const statValues = document.querySelectorAll('.hero-stat-value, .about-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;

                // Extract numeric value
                let numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (text.includes('B')) numericValue *= 1000000000;
                if (text.includes('M')) numericValue *= 1000000;
                if (text.includes('K')) numericValue *= 1000;

                if (!isNaN(numericValue)) {
                    const originalText = text;
                    el.textContent = '0';
                    animateCounter(el, numericValue, 2000);

                    // Restore suffix after animation
                    setTimeout(() => {
                        if (text.includes('+')) el.textContent += '+';
                        if (text.includes('%')) el.textContent += '%';
                        if (text.includes('$')) el.textContent = '$' + el.textContent;
                        if (text.includes('B')) el.textContent = (numericValue / 1000000000).toFixed(1) + 'B+';
                        if (text.includes('M')) el.textContent = (numericValue / 1000000).toFixed(1) + 'M';
                    }, 2000);
                }

                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(el => counterObserver.observe(el));

    // ── Sparkline Animation ─────────────────────────────────
    document.querySelectorAll('.mini-sparkline').forEach(canvas => {
        const values = JSON.parse(canvas.dataset.values || '[]');
        if (!values.length) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;

        // Draw with animation
        let progress = 0;
        function drawSparkline() {
            progress += 0.02;
            if (progress > 1) progress = 1;

            ctx.clearRect(0, 0, width, height);

            const visiblePoints = Math.floor(values.length * progress);
            if (visiblePoints < 2) {
                requestAnimationFrame(drawSparkline);
                return;
            }

            // Gradient fill
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(166,112,107,0.3)');
            gradient.addColorStop(1, 'rgba(166,112,107,0)');

            ctx.beginPath();
            ctx.moveTo(0, height - ((values[0] - min) / range) * (height - 4) - 2);

            for (let i = 1; i < visiblePoints; i++) {
                const x = (i / (values.length - 1)) * width;
                const y = height - ((values[i] - min) / range) * (height - 4) - 2;
                ctx.lineTo(x, y);
            }

            ctx.lineTo((visiblePoints - 1) / (values.length - 1) * width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.moveTo(0, height - ((values[0] - min) / range) * (height - 4) - 2);
            for (let i = 1; i < visiblePoints; i++) {
                const x = (i / (values.length - 1)) * width;
                const y = height - ((values[i] - min) / range) * (height - 4) - 2;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(166,112,107,0.6)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            if (progress < 1) {
                requestAnimationFrame(drawSparkline);
            }
        }

        // Start animation when visible
        const sparklineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    drawSparkline();
                    sparklineObserver.unobserve(canvas);
                }
            });
        }, { threshold: 0.5 });

        sparklineObserver.observe(canvas);
    });

    // ── Smooth Reveal for Hero Elements ────────────────────
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-cta, .hero-stats');
    heroElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.animation = `fadeInUp 0.7s ease ${i * 0.1}s forwards`;
    });

    // ── Navbar Hide on Scroll Down ─────────────────────────
    let lastScrollY = 0;
    let ticking = false;

    const marketingNav = document.getElementById('marketing-nav');
    if (marketingNav) {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    if (currentScrollY > lastScrollY && currentScrollY > 100) {
                        marketingNav.style.transform = 'translateY(-100%)';
                    } else {
                        marketingNav.style.transform = 'translateY(0)';
                    }
                    lastScrollY = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ── Glow Pulse on CTA Card ────────────────────────────
    const ctaGlow = document.querySelector('.cta-glow');
    if (ctaGlow) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    ctaGlow.style.animation = 'pulse-glow 3s ease-in-out infinite';
                }
            });
        });
        ctaObserver.observe(ctaGlow.closest('.cta-card'));
    }

})();
