import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/corsConfig.mjs';


const app = express();
const PORT = process.env.PORT || 3001;


// CORS first
app.use(cors(corsOptions));
// (optional, helps explicit preflight on some setups)
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
}); 


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
export default app;