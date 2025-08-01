/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'roadmap-blue': '#4F46E5',
        'deadline-red': '#EF4444',
        'capacity-orange': '#F59E0B',
      },
    },
  },
  plugins: [],
};
