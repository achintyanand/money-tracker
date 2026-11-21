/**
 * Tailwind CDN configuration.
 * Must load AFTER the Tailwind CDN script and BEFORE the page body is parsed.
 */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080c14',
          surface: '#0f172a',
          card: '#151f32',
          cardBorder: '#1e293b',
          accent: '#6366f1',
          income: '#10b981',
          expense: '#f43f5e',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
