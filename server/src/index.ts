import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { authRouter } from './routes/auth.js';
import { tenantsRouter } from './routes/tenants.js';
import { vmsRouter } from './routes/vms.js';
import { templatesRouter } from './routes/templates.js';
import { auditRouter } from './routes/audit.js';
import { usersRouter } from './routes/users.js';
import { billingRouter } from './routes/billing.js';
import { infrastructureRouter } from './routes/infrastructure.js';
import { invitesRouter } from './routes/invites.js';
import { tariffsRouter } from './routes/tariffs.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mts-cloud-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/vms', vmsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/users', usersRouter);
app.use('/api/billing', billingRouter);
app.use('/api/tariffs', tariffsRouter);
app.use('/api/infrastructure', infrastructureRouter);
app.use('/api/invites', invitesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider: process.env.PROVIDER || 'mock' });
});

app.listen(PORT, () => {
  console.log(`[server] MTS Cloud API running on http://localhost:${PORT}`);
  console.log(`[server] Provider: ${process.env.PROVIDER || 'mock'}`);
});
