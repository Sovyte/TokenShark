/**
 * TokenShark Canvas Charts
 * Cost chart, donut chart, sparklines
 */

(function() {
    'use strict';

    // ── Cost Line Chart ─────────────────────────────────────
    const costCanvas = document.getElementById('costChart');
    if (costCanvas) {
        const ctx = costCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        function resizeCanvas() {
            const container = costCanvas.parentElement;
            costCanvas.width = container.clientWidth * dpr;
            costCanvas.height = container.clientHeight * dpr;
            ctx.scale(dpr, dpr);
            drawCostChart();
        }

        // Mock data: 30 days of cost
        const costData = [
            120, 145, 132, 178, 165, 190, 210, 195, 230, 245,
            220, 260, 275, 240, 290, 310, 285, 320, 340, 315,
            360, 380, 350, 400, 420, 390, 450, 470, 440, 485
        ];
        const requestData = costData.map(c => c * 220); // Rough multiplier

        function drawCostChart() {
            const width = costCanvas.width / dpr;
            const height = costCanvas.height / dpr;
            const padding = { top: 20, right: 20, bottom: 40, left: 60 };
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;

            ctx.clearRect(0, 0, width, height);

            // Grid lines
            const gridCount = 5;
            ctx.strokeStyle = 'rgba(128,128,128,0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= gridCount; i++) {
                const y = padding.top + (chartHeight / gridCount) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }

            // Y-axis labels
            const maxCost = Math.max(...costData);
            ctx.fillStyle = 'var(--color-text-muted)';
            ctx.font = '11px var(--font-mono)';
            ctx.textAlign = 'right';
            for (let i = 0; i <= gridCount; i++) {
                const value = Math.round((maxCost / gridCount) * (gridCount - i));
                const y = padding.top + (chartHeight / gridCount) * i + 4;
                ctx.fillText('$' + value, padding.left - 10, y);
            }

            // X-axis labels (every 5 days)
            ctx.textAlign = 'center';
            for (let i = 0; i < costData.length; i += 5) {
                const x = padding.left + (i / (costData.length - 1)) * chartWidth;
                ctx.fillText('Day ' + (i + 1), x, height - 15);
            }

            // Cost area fill
            const costGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            costGradient.addColorStop(0, 'rgba(166,112,107,0.3)');
            costGradient.addColorStop(1, 'rgba(166,112,107,0.02)');

            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom);
            for (let i = 0; i < costData.length; i++) {
                const x = padding.left + (i / (costData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - (costData[i] / maxCost) * chartHeight;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width - padding.right, height - padding.bottom);
            ctx.closePath();
            ctx.fillStyle = costGradient;
            ctx.fill();

            // Cost line
            ctx.beginPath();
            for (let i = 0; i < costData.length; i++) {
                const x = padding.left + (i / (costData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - (costData[i] / maxCost) * chartHeight;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(166,112,107,0.8)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Request line (secondary, lighter)
            const maxRequests = Math.max(...requestData);
            ctx.beginPath();
            for (let i = 0; i < requestData.length; i++) {
                const x = padding.left + (i / (requestData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - (requestData[i] / maxRequests) * chartHeight;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(128,128,128,0.3)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Legend
            ctx.font = '12px var(--font-sans)';
            ctx.textAlign = 'left';

            // Cost legend
            ctx.fillStyle = 'rgba(166,112,107,0.8)';
            ctx.fillRect(width - 140, 10, 12, 3);
            ctx.fillStyle = 'var(--color-text-muted)';
            ctx.fillText('Cost', width - 120, 14);

            // Request legend
            ctx.strokeStyle = 'rgba(128,128,128,0.3)';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(width - 60, 11);
            ctx.lineTo(width - 48, 11);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'var(--color-text-muted)';
            ctx.fillText('Requests', width - 40, 14);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    // ── Donut Chart ─────────────────────────────────────────
    const donutCanvas = document.getElementById('modelDonut');
    if (donutCanvas) {
        const ctx = donutCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        function resizeDonut() {
            const container = donutCanvas.parentElement;
            donutCanvas.width = container.clientWidth * dpr;
            donutCanvas.height = container.clientHeight * dpr;
            ctx.scale(dpr, dpr);
            drawDonut();
        }

        function drawDonut() {
            const width = donutCanvas.width / dpr;
            const height = donutCanvas.height / dpr;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - 20;
            const innerRadius = radius * 0.6;

            const data = [
                { label: 'gpt-4o', value: 64.1, color: '#a6706b' },
                { label: 'claude-3-sonnet', value: 24.1, color: '#d4a5a0' },
                { label: 'mistral-large', value: 11.8, color: '#c08a85' }
            ];

            let currentAngle = -Math.PI / 2;
            const total = data.reduce((sum, d) => sum + d.value, 0);

            data.forEach((segment, index) => {
                const sliceAngle = (segment.value / total) * 2 * Math.PI;
                const endAngle = currentAngle + sliceAngle;

                // Draw segment
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                ctx.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true);
                ctx.closePath();
                ctx.fillStyle = segment.color;
                ctx.fill();

                // Gap between segments
                ctx.strokeStyle = 'var(--color-surface)';
                ctx.lineWidth = 3;
                ctx.stroke();

                currentAngle = endAngle;
            });

            // Center text
            ctx.fillStyle = 'var(--color-text)';
            ctx.font = 'bold 20px var(--font-mono)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$12.8K', centerX, centerY - 8);

            ctx.fillStyle = 'var(--color-text-muted)';
            ctx.font = '12px var(--font-sans)';
            ctx.fillText('Total', centerX, centerY + 12);
        }

        resizeDonut();
        window.addEventListener('resize', resizeDonut);
    }

})();
