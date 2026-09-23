import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import patientFamilyRoutes from './routes/patientFamilyRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import patientConsentRoutes from './routes/patientConsentRoutes.js';
import consentRoutes from './routes/consentRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import patientMediaRoutes from './routes/patientMediaRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import gameQuestionRoutes from './routes/gameQuestionRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import gameSessionRoutes from './routes/gameSessionRoutes.js';
import patientGameSessionRoutes from './routes/patientGameSessionRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import gameSessionTelemetryRoutes from './routes/gameSessionTelemetryRoutes.js';
import patientTelemetryRoutes from './routes/patientTelemetryRoutes.js';
import gameSessionAnalyticsRoutes from './routes/gameSessionAnalyticsRoutes.js';
import patientAnalyticsRoutes from './routes/patientAnalyticsRoutes.js';
import patientFeatureVectorRoutes from './routes/patientFeatureVectorRoutes.js';
import testAccessRoutes from './routes/testAccessRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patients/:patientId/family', patientFamilyRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/patients/:patientId/consents', patientConsentRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/patients/:patientId/media', patientMediaRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/games/:gameId/questions', gameQuestionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/game-sessions', gameSessionRoutes);
app.use('/api/patients/:patientId/game-sessions', patientGameSessionRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/game-sessions/:sessionId/telemetry', gameSessionTelemetryRoutes);
app.use('/api/patients/:patientId/telemetry', patientTelemetryRoutes);
app.use('/api/game-sessions/:sessionId/analytics', gameSessionAnalyticsRoutes);
app.use('/api/patients/:patientId/analytics', patientAnalyticsRoutes);
app.use('/api/patients/:patientId/feature-vectors', patientFeatureVectorRoutes);
app.use('/api/test', testAccessRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
