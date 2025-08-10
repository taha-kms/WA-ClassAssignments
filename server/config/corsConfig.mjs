// server/config/corsConfig.mjs
export const corsOptions = {
  origin: ['http://localhost:5173'], // your React dev server
  credentials: true,                   // allow sending cookies
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','X-Requested-With','Accept','Origin'],
};
