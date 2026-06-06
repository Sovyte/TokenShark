/**
 * TokenShark Core JavaScript
 * Theme, mobile nav, flash messages, scroll effects
 */

(function() {
    'use strict';

    // ── Theme Toggle ────────────────────────────────────────
    const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-app');

    function toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);

        // Persist preference
        fetch('/toggle-theme', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }).catch(() => {});

        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', next === 'dark' ? '#0a0a0a' : '#fafafa');
        }
    }

    themeToggles.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });

    // ── Mobile Navigation ───────────────────────────────────
    const mobileToggle = document.getElementById('nav-mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !expanded);
            navLinks.classList.toggle('open');

            // Animate hamburger
            const lines = mobileToggle.querySelectorAll('.hamburger-line');
            if (!expanded) {
                lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                lines[1].style.opacity = '0';
                lines[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                lines[0].style.transform = '';
                lines[1].style.opacity = '1';
                lines[2].style.transform = '';
            }
        });
    }

    // ── Flash Messages Auto-Dismiss ───────────────────────
    const flashContainer = document.getElementById('flash-container');
    if (flashContainer) {
        const flashes = flashContainer.querySelectorAll('.flash');
        flashes.forEach(flash => {
            const dismissTime = parseInt(flash.dataset.autoDismiss) || 5000;
            const closeBtn = flash.querySelector('.flash-close');

            // Auto dismiss
            const timer = setTimeout(() => {
                dismissFlash(flash);
            }, dismissTime);

            // Manual close
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    clearTimeout(timer);
                    dismissFlash(flash);
                });
            }
        });
    }

    function dismissFlash(flash) {
        flash.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => flash.remove(), 300);
    }

    // ── Smooth Scroll for Anchor Links ───────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Navbar Scroll Effect ──────────────────────────────
    const nav = document.getElementById('marketing-nav');
    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > 50) {
                nav.style.background = 'rgba(10,10,10,0.95)';
                nav.style.backdropFilter = 'blur(16px)';
            } else {
                nav.style.background = 'rgba(10,10,10,0.8)';
                nav.style.backdropFilter = 'blur(12px)';
            }
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ── Copy to Clipboard ───────────────────────────────────
    document.querySelectorAll('[data-clipboard], .code-copy').forEach(btn => {
        btn.addEventListener('click', async function() {
            const codeBlock = this.closest('.code-panel, .code-block, .api-key-display')?.querySelector('code, .api-key-value');
            const text = codeBlock ? codeBlock.textContent : '';

            try {
                await navigator.clipboard.writeText(text);
                const original = this.innerHTML;
                this.classList.add('copied');
                if (this.querySelector('span')) {
                    this.querySelector('span').textContent = 'Copied!';
                }

                setTimeout(() => {
                    this.classList.remove('copied');
                    this.innerHTML = original;
                }, 2000);

                showToast('Copied to clipboard', 'success');
            } catch (err) {
                showToast('Failed to copy', 'error');
            }
        });
    });

    // ── Toast System ────────────────────────────────────────
    window.showToast = function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${getToastIcon(type)}</div>
            <span class="toast-message">${message}</span>
        `;
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            font-size: var(--text-sm);
            animation: slideInRight 0.3s ease;
            cursor: pointer;
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);

        toast.addEventListener('click', () => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        });
    };

    function getToastIcon(type) {
        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        return icons[type] || icons.info;
    }

    // ── Password Strength Meter ─────────────────────────────
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener('input', function() {
            const val = this.value;
            let strength = 0;
            if (val.length >= 8) strength += 25;
            if (val.length >= 12) strength += 25;
            if (/[A-Z]/.test(val)) strength += 25;
            if (/[0-9!@#$%^&*]/.test(val)) strength += 25;

            strengthBar.style.width = strength + '%';

            if (strength <= 25) {
                strengthBar.style.background = 'var(--color-error)';
                strengthText.textContent = 'Weak';
                strengthText.style.color = 'var(--color-error)';
            } else if (strength <= 50) {
                strengthBar.style.background = 'var(--color-warning)';
                strengthText.textContent = 'Fair';
                strengthText.style.color = 'var(--color-warning)';
            } else if (strength <= 75) {
                strengthBar.style.background = 'var(--color-info)';
                strengthText.textContent = 'Good';
                strengthText.style.color = 'var(--color-info)';
            } else {
                strengthBar.style.background = 'var(--color-success)';
                strengthText.textContent = 'Strong';
                strengthText.style.color = 'var(--color-success)';
            }
        });
    }

    // ── Password Visibility Toggle ──────────────────────────
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.target);
            if (target) {
                const type = target.type === 'password' ? 'text' : 'password';
                target.type = type;
                this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
            }
        });
    });

    // ── FAQ Accordion ───────────────────────────────────────
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const expanded = q.getAttribute('aria-expanded') === 'true';
            // Close all others
            document.querySelectorAll('.faq-question').forEach(other => {
                other.setAttribute('aria-expanded', 'false');
            });
            // Toggle current
            q.setAttribute('aria-expanded', !expanded);
        });
    });

    // ── Code Tabs ───────────────────────────────────────────
    document.querySelectorAll('.code-tabs').forEach(tabGroup => {
        const tabs = tabGroup.querySelectorAll('.code-tab');
        const panels = tabGroup.closest('.code-showcase, .onboarding-body')?.querySelectorAll('.code-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (panels) {
                    panels.forEach(p => {
                        p.classList.toggle('active', p.dataset.panel === target);
                    });
                }
            });
        });
    });

    // ── Onboarding Steps ────────────────────────────────────
    document.querySelectorAll('[data-next-step]').forEach(btn => {
        btn.addEventListener('click', () => {
            const current = document.querySelector('.onboarding-step.active');
            const next = current?.nextElementSibling;
            if (next && next.classList.contains('onboarding-step')) {
                current.classList.remove('active');
                next.classList.add('active');
            }
        });
    });

    document.querySelectorAll('[data-prev-step]').forEach(btn => {
        btn.addEventListener('click', () => {
            const current = document.querySelector('.onboarding-step.active');
            const prev = current?.previousElementSibling;
            if (prev && prev.classList.contains('onboarding-step')) {
                current.classList.remove('active');
                prev.classList.add('active');
            }
        });
    });

    // ── Print Styles ────────────────────────────────────────
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('print');
        mediaQuery.addEventListener('change', (mql) => {
            if (mql.matches) {
                document.body.style.background = '#fff';
            }
        });
    }

    console.log('🦈 TokenShark loaded');
})();
