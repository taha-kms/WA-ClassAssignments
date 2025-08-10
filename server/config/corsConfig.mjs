// server/config/corsConfig.mjs
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

export const corsOptions = {
  origin: [FRONTEND],          // allow your Vite dev server (or whatever you set)
  credentials: true,           // allow cookies (needed for sessions)
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','X-Requested-With','Accept','Origin'],
  optionsSuccessStatus: 204    // for legacy browsers handling of 204 on preflight
};
