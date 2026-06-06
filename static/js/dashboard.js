/**
 * TokenShark Dashboard-Specific JavaScript
 * Real-time updates, data fetching, interactive features
 */

(function() {
    'use strict';

    // ── Real-time Clock ─────────────────────────────────────
    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        // Could display in a header element if needed
    }
    setInterval(updateClock, 1000);

    // ── Auto-refresh Stats (every 30s) ─────────────────────
    function refreshStats() {
        // In production, this would fetch from /api/v1/stats
        // For demo, we simulate small changes
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(el => {
            el.style.transition = 'opacity 0.3s';
            el.style.opacity = '0.7';
            setTimeout(() => {
                el.style.opacity = '1';
            }, 300);
        });
    }
    // setInterval(refreshStats, 30000); // Uncomment for production

    // ── Table Sorting ───────────────────────────────────────
    document.querySelectorAll('.data-table thead th').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const table = th.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const index = Array.from(th.parentElement.children).indexOf(th);
            const isNumeric = th.textContent.toLowerCase().includes('cost') || 
                             th.textContent.toLowerCase().includes('tokens') ||
                             th.textContent.toLowerCase().includes('latency');

            const isAscending = !th.classList.contains('sort-asc');

            // Remove sort classes from all headers
            table.querySelectorAll('th').forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

            rows.sort((a, b) => {
                const aVal = a.children[index].textContent.trim();
                const bVal = b.children[index].textContent.trim();

                if (isNumeric) {
                    const aNum = parseFloat(aVal.replace(/[^0-9.]/g, '')) || 0;
                    const bNum = parseFloat(bVal.replace(/[^0-9.]/g, '')) || 0;
                    return isAscending ? aNum - bNum : bNum - aNum;
                }

                return isAscending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });

            rows.forEach(row => tbody.appendChild(row));
        });
    });

    // ── Export Data ─────────────────────────────────────────
    document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Export started — CSV will download shortly', 'info');

            // Simulate export
            setTimeout(() => {
                const csv = 'Date,Provider,Model,Tokens,Cost,Latency\n' +
                    '2024-01-01,openai,gpt-4o,1243,0.0124,234\n' +
                    '2024-01-01,anthropic,claude-3-sonnet,892,0.0089,189\n' +
                    '2024-01-01,openai,gpt-3.5-turbo,456,0.0009,89\n';

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tokenshark-export.csv';
                a.click();
                URL.revokeObjectURL(url);

                showToast('Export complete', 'success');
            }, 1500);
        });
    });

    // ── Notification Panel ──────────────────────────────────
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showToast('Notifications panel coming soon', 'info');
        });
    }

    // ── Usage Widget Animation ──────────────────────────────
    const usageFill = document.querySelector('.usage-fill');
    if (usageFill) {
        const targetWidth = usageFill.style.width;
        usageFill.style.width = '0';
        setTimeout(() => {
            usageFill.style.transition = 'width 1.5s ease-out';
            usageFill.style.width = targetWidth;
        }, 500);
    }

    // ── Panel Hover Effects ─────────────────────────────────
    document.querySelectorAll('.panel').forEach(panel => {
        panel.addEventListener('mouseenter', () => {
            panel.style.borderColor = 'var(--color-border-subtle)';
        });
        panel.addEventListener('mouseleave', () => {
            panel.style.borderColor = '';
        });
    });

    // ── Keyboard Navigation for Table ───────────────────────
    document.querySelectorAll('.data-table tbody').forEach(tbody => {
        let focusedRow = 0;
        const rows = tbody.querySelectorAll('tr');

        tbody.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                focusedRow = Math.min(focusedRow + 1, rows.length - 1);
                rows[focusedRow]?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                focusedRow = Math.max(focusedRow - 1, 0);
                rows[focusedRow]?.focus();
            }
        });

        rows.forEach((row, i) => {
            row.setAttribute('tabindex', '0');
            row.addEventListener('focus', () => {
                focusedRow = i;
                row.style.outline = '2px solid var(--color-accent)';
                row.style.outlineOffset = '-2px';
            });
            row.addEventListener('blur', () => {
                row.style.outline = '';
                row.style.outlineOffset = '';
            });
        });
    });

    // ── Live Indicator ──────────────────────────────────────
    const liveIndicator = document.createElement('div');
    liveIndicator.className = 'live-indicator';
    liveIndicator.innerHTML = `
        <span class="live-dot"></span>
        <span class="live-text">Live</span>
    `;
    liveIndicator.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--color-text-muted);
        z-index: var(--z-tooltip);
        box-shadow: var(--shadow-md);
    `;

    const liveDot = document.createElement('style');
    liveDot.textContent = `
        .live-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--color-success);
            animation: pulse 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(liveDot);

    // Only show on dashboard pages
    if (document.querySelector('.dashboard-page')) {
        document.body.appendChild(liveIndicator);
    }

})();
