export default {
  plugins: {
    'tailwindcss/nesting': {},
    "@tailwindcss/postcss": {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}


