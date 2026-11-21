/**
 * Chart.js doughnut charts (dashboard + analytics).
 */

const Charts = {
  dashboard: null,
  analytics: null,

  EMPTY_COLOR: '#1e293b',

  init() {
    this.dashboard = this._createDoughnut('expenseChart', {
      cutout: '74%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${Store.currency}${ctx.parsed.toFixed(2)}`,
          },
        },
      },
    });

    this.analytics = this._createDoughnut('analyticsDonutChart', {
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, boxWidth: 12 },
        },
      },
    });
  },

  /** Redraws both charts from the current expense totals. */
  render() {
    const totals = Store.getExpenseTotalsByCategory();
    const slices = [...totals]
      .filter(([, amount]) => amount > 0)
      .map(([categoryId, amount]) => {
        const category = Store.getCategory(categoryId);
        return {
          label: `${category.emoji || ''} ${category.name}`.trim(),
          amount,
          color: category.color || FALLBACK_COLOR,
        };
      });

    const hasData = slices.length > 0;
    const data = hasData
      ? { labels: slices.map((s) => s.label), values: slices.map((s) => s.amount), colors: slices.map((s) => s.color) }
      : { labels: ['No Data'], values: [1], colors: [this.EMPTY_COLOR] };

    this._update(this.dashboard, data);
    this._update(this.analytics, data);

    $('chartCenterAmount').textContent = Format.amount(slices.reduce((sum, s) => sum + s.amount, 0));
    $('noExpensesChartMsg').classList.toggle('hidden', hasData);
  },

  _createDoughnut(canvasId, extraOptions) {
    const canvas = $(canvasId);
    if (!canvas) return null;

    return new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: [], borderWidth: 2, borderColor: '#151f32' }],
      },
      options: { responsive: true, maintainAspectRatio: false, ...extraOptions },
    });
  },

  _update(chart, { labels, values, colors }) {
    if (!chart) return;
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  },
};
