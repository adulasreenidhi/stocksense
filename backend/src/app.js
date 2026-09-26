import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import receiptRoutes from './routes/receipt.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import adjustmentRoutes from './routes/adjustment.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const prefix = process.env.API_PREFIX || '/api/v1';

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ success: true, message: 'StockSense API up' }));

app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/products`, productRoutes);
app.use(`${prefix}/warehouses`, warehouseRoutes);
app.use(`${prefix}/receipts`, receiptRoutes);
app.use(`${prefix}/deliveries`, deliveryRoutes);
app.use(`${prefix}/transfers`, transferRoutes);
app.use(`${prefix}/adjustments`, adjustmentRoutes);
app.use(`${prefix}/ledger`, ledgerRoutes);
app.use(`${prefix}/dashboard`, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
