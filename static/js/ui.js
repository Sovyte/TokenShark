/**
 * TokenShark UI Interactions
 * Command palette, keyboard shortcuts, dropdowns, modals
 */

(function() {
    'use strict';

    // ── Command Palette ─────────────────────────────────────
    const paletteOverlay = document.getElementById('command-palette-overlay');
    const paletteTrigger = document.getElementById('command-palette-trigger');
    const paletteInput = document.getElementById('command-palette-input');
    const paletteResults = document.getElementById('command-palette-results');
    let selectedIndex = -1;
    let paletteItems = [];

    function openPalette() {
        if (!paletteOverlay) return;
        paletteOverlay.classList.add('open');
        paletteOverlay.setAttribute('aria-hidden', 'false');
        setTimeout(() => paletteInput?.focus(), 50);
        document.body.style.overflow = 'hidden';
        selectedIndex = -1;
        updateSelection();
    }

    function closePalette() {
        if (!paletteOverlay) return;
        paletteOverlay.classList.remove('open');
        paletteOverlay.setAttribute('aria-hidden', 'true');
        if (paletteInput) paletteInput.value = '';
        document.body.style.overflow = '';
        selectedIndex = -1;
    }

    if (paletteTrigger) {
        paletteTrigger.addEventListener('click', openPalette);
    }

    if (paletteOverlay) {
        paletteOverlay.addEventListener('click', (e) => {
            if (e.target === paletteOverlay || e.target.classList.contains('command-palette-overlay')) {
                closePalette();
            }
        });
    }

    // Filter palette items
    if (paletteInput) {
        paletteInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            paletteItems = [];

            document.querySelectorAll('.command-palette-item').forEach((item, index) => {
                const text = item.textContent.toLowerCase();
                const section = item.closest('.command-palette-section');

                if (text.includes(query)) {
                    item.style.display = 'flex';
                    paletteItems.push(item);
                    if (section) section.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }

                // Hide empty sections
                if (section) {
                    const visibleItems = section.querySelectorAll('.command-palette-item:not([style*="none"])');
                    section.style.display = visibleItems.length > 0 ? 'block' : 'none';
                }
            });

            selectedIndex = query ? 0 : -1;
            updateSelection();
        });
    }

    function updateSelection() {
        paletteItems.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndex);
        });
    }

    function activateSelected() {
        if (selectedIndex >= 0 && paletteItems[selectedIndex]) {
            const item = paletteItems[selectedIndex];
            if (item.tagName === 'A') {
                window.location.href = item.href;
            } else if (item.tagName === 'BUTTON') {
                const action = item.dataset.action;
                if (action === 'toggle-theme') {
                    document.getElementById('theme-toggle')?.click();
                } else if (action === 'copy-api-key') {
                    showToast('API key copied', 'success');
                }
            }
            closePalette();
        }
    }

    // ── Keyboard Shortcuts ──────────────────────────────────
    const shortcutsModal = document.getElementById('keyboard-shortcuts-modal');

    function openShortcuts() {
        if (shortcutsModal) {
            shortcutsModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeShortcuts() {
        if (shortcutsModal) {
            shortcutsModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('[data-close-modal]').forEach(el => {
        el.addEventListener('click', closeShortcuts);
    });

    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.includes('Mac');
        const cmdKey = isMac ? e.metaKey : e.ctrlKey;

        // Command Palette: Cmd/Ctrl + K
        if (cmdKey && e.key === 'k' && !e.shiftKey) {
            e.preventDefault();
            if (paletteOverlay?.classList.contains('open')) {
                closePalette();
            } else {
                openPalette();
            }
        }

        // Close palette/modal: Escape
        if (e.key === 'Escape') {
            if (paletteOverlay?.classList.contains('open')) {
                closePalette();
            } else if (shortcutsModal?.classList.contains('open')) {
                closeShortcuts();
            }
        }

        // Help: ?
        if (e.key === '?' && !e.shiftKey && !cmdKey && document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            openShortcuts();
        }

        // Theme toggle: T
        if (e.key === 't' && !cmdKey && !e.shiftKey && document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('theme-toggle')?.click();
        }

        // Focus search: /
        if (e.key === '/' && !cmdKey && document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input, .command-palette-trigger');
            searchInput?.focus();
        }

        // Navigate palette
        if (paletteOverlay?.classList.contains('open')) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, paletteItems.length - 1);
                updateSelection();
                paletteItems[selectedIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
                paletteItems[selectedIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                activateSelected();
            }
        }

        // Sidebar toggle: Cmd/Ctrl + B
        if (cmdKey && e.key === 'b') {
            e.preventDefault();
            document.getElementById('sidebar-toggle')?.click();
        }

        // Navigation shortcuts: G + letter
        if (e.key === 'g' && !cmdKey && !e.shiftKey && document.activeElement?.tagName !== 'INPUT') {
            // Wait for next key
            const handler = (e2) => {
                const routes = {
                    'd': '/dashboard/',
                    'e': '/dashboard/events',
                    'a': '/dashboard/analytics',
                    'l': '/dashboard/alerts',
                    'k': '/dashboard/api-keys',
                    't': '/dashboard/team',
                    's': '/dashboard/settings',
                };
                if (routes[e2.key] && !e2.ctrlKey && !e2.metaKey) {
                    e2.preventDefault();
                    window.location.href = routes[e2.key];
                }
                document.removeEventListener('keydown', handler);
            };
            document.addEventListener('keydown', handler);
            setTimeout(() => document.removeEventListener('keydown', handler), 500);
        }

        // Notifications: N
        if (e.key === 'n' && !cmdKey && !e.shiftKey && document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('notification-btn')?.click();
        }
    });

    // ── User Dropdown ───────────────────────────────────────
    const userMenuTrigger = document.getElementById('user-menu-trigger');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuTrigger && userDropdown) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = userMenuTrigger.getAttribute('aria-expanded') === 'true';
            userMenuTrigger.setAttribute('aria-expanded', !expanded);
            userDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
                userMenuTrigger.setAttribute('aria-expanded', 'false');
                userDropdown.classList.remove('open');
            }
        });
    }

    // ── Sidebar Toggle ──────────────────────────────────────
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    const appLayout = document.querySelector('.app-layout');

    if (sidebarToggle && sidebar && appLayout) {
        sidebarToggle.addEventListener('click', () => {
            appLayout.classList.toggle('sidebar-collapsed');
            sidebar.classList.toggle('collapsed');

            // Animate sidebar width
            const isCollapsed = appLayout.classList.contains('sidebar-collapsed');
            sidebar.style.width = isCollapsed ? '64px' : '260px';

            // Store preference
            localStorage.setItem('sidebar-collapsed', isCollapsed);
        });

        // Restore preference
        const wasCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (wasCollapsed) {
            appLayout.classList.add('sidebar-collapsed');
            sidebar.classList.add('collapsed');
            sidebar.style.width = '64px';
        }
    }

    // ── Segmented Control ─────────────────────────────────
    document.querySelectorAll('.segmented-control').forEach(control => {
        const segments = control.querySelectorAll('.segment');
        segments.forEach(seg => {
            seg.addEventListener('click', () => {
                segments.forEach(s => s.classList.remove('active'));
                seg.classList.add('active');
            });
        });
    });

    // ── Table Row Interactions ──────────────────────────────
    document.querySelectorAll('.table-row-interactive').forEach(row => {
        row.addEventListener('click', () => {
            row.style.background = 'var(--color-surface-active)';
            setTimeout(() => {
                row.style.background = '';
            }, 200);
        });
    });

    // ── Search Input Focus ──────────────────────────────────
    const eventSearch = document.getElementById('event-search');
    if (eventSearch) {
        eventSearch.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#events-table tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // ── Alert Item Click ────────────────────────────────────
    document.querySelectorAll('.alert-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.remove('alert-item-unread');
            const dot = item.querySelector('.alert-unread-dot');
            if (dot) dot.remove();
        });
    });

})();
