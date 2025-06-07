import express from 'express';
import cors from 'cors';
import { authenticateJwt } from './middleware/auth.middleware';
import path from 'path';
import dotenv from 'dotenv';

// Route Imports
import authRoutes from './routes/auth.routes';
import messagesRoutes from './routes/messages.routes';
import propertyRoutes from './routes/property.routes';
import unitRoutes from './routes/unit.routes';
import userRoutes from './routes/user.routes';
import usersRoutes from './routes/users.routes';
import vermieterRouter from './routes/vermieter.routes';
import handwerkerRoutes from './routes/handwerker.routes';
import notificationRoutes from './routes/notifications.routes';
import mieterRoutes from './routes/mieter.routes';
import contactRoutes from './routes/contact.routes';
import subscriptionRoutes from './routes/subscription.routes';
import paypalWebhookRoutes from './routes/paypal-webhook.routes';

dotenv.config();

const app = express();

// CORS Debug Logging
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

// Einfache CORS-Konfiguration für lokale Entwicklung
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// CORS Response Debug Logging
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(...args) {
    console.log('Response headers:', {
      'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
      'access-control-allow-credentials': res.getHeader('access-control-allow-credentials'),
      'access-control-allow-methods': res.getHeader('access-control-allow-methods'),
      'access-control-allow-headers': res.getHeader('access-control-allow-headers')
    });
    return originalSend.apply(res, args);
  };
  next();
});

// Body Parser & Static Files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    body: req.body,
    headers: req.headers,
    path: req.path,
    baseUrl: req.baseUrl
  });
  next();
});

// Public Routes (no authentication required)
app.use('/auth', authRoutes);
app.use('/contact', contactRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/paypal/webhook', paypalWebhookRoutes);

// Protected Routes (authentication required)
app.use('/notifications', authenticateJwt, notificationRoutes);
app.use('/messages', authenticateJwt, messagesRoutes);
app.use('/properties', authenticateJwt, propertyRoutes);
app.use('/units', authenticateJwt, unitRoutes);
app.use('/vermieter', authenticateJwt, vermieterRouter);
app.use('/handwerker', authenticateJwt, handwerkerRoutes);
app.use('/mieter', authenticateJwt, mieterRoutes);
app.use('/users', userRoutes);
app.use('/users', usersRoutes);

export default app;
