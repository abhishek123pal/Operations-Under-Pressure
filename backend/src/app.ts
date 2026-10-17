// import express, { Application, Request, Response } from 'express';
// import cors from 'cors';
// import 'dotenv/config';

// const app: Application = express();
// const PORT = process.env.PORT || 4000;

// // Global Middleware
// app.use(express.json());
// app.use(cors());

// // Health Check Endpoint
// app.get('/health', (req: Request, res: Response) => {
//   res.status(200).json({
//     status: 'ONLINE',
//     system: 'Operations Under Pressure Backend Engine',
//     timestamp: new Date().toISOString(),
//   });
// });

// // Server Listener
// app.listen(PORT, () => {
//   console.log(`🚀 Enterprise Concurrency Server running on port ${PORT}`);
// });

// export default app;
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import workItemRoutes from './routes/workItem.routes';

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Global Middleware
app.use(express.json());
app.use(cors());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'Operations Under Pressure Backend Engine',
    timestamp: new Date().toISOString(),
  });
});

// Mount Work Item Concurrency Routes
app.use('/items', workItemRoutes);

// Server Listener
app.listen(PORT, () => {
  console.log(`🚀 Enterprise Concurrency Server running on port ${PORT}`);
});

export default app;