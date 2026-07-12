import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './docs/swagger';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { rateLimit } from './middleware/rate-limit.middleware';

const app = express();

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Rate limit auth endpoints (e.g. max 5 login requests per 1 minute)
app.use('/api/v1/auth/login', rateLimit(5, 60 * 1000));

// Mount routes
app.use('/api/v1', routes);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Global Error Handler
app.use(errorHandler);

export default app;
