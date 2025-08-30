import cookieParser from 'cookie-parser';

import express from 'express';
import { config } from 'dotenv';
config();
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';
import { Together } from 'together-ai';
const app = express();
const together = new Together();
// Middlewares
// Built-In
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Third-Party
app.use(
  cors({
    origin:"https://lms-5.vercel.app",
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());

// Server Status Check Route
app.get('/ping', (_req, res) => {
  res.send('Pong');
});
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await together.chat.completions.create({
     model: 'meta-llama/Llama-Vision-Free',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const reply = response.choices?.[0]?.message?.content || 'No response from model.';
    res.json({ reply });
  } catch (err) {
    console.error('Together SDK error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
// Import all routes
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', miscRoutes);

// Default catch all route - 404
app.all('*', (_req, res) => {
  res.status(404).send('OOPS!!! 404 Page Not Found');
});

// Custom error handling middleware
app.use(errorMiddleware);

export default app;
