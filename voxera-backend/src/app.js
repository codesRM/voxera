require('./config/env');

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const errorHandler   = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Routes
const authRoutes     = require('./modules/auth/auth.routes');
const usersRoutes    = require('./modules/users/users.routes');
const postsRoutes    = require('./modules/posts/posts.routes');
const commentsRoutes = require('./modules/comments/comments.routes');
const votesRoutes    = require('./modules/votes/votes.routes');
const socialRoutes   = require('./modules/social/social.routes');
const reportsRoutes  = require('./modules/reports/reports.routes');
const adminRoutes    = require('./modules/admin/admin.routes');
const searchRoutes   = require('./modules/search/search.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Voxera API is running' });
});

app.use('/api/auth',    authRoutes);
app.use('/api/users',   usersRoutes);
app.use('/api/posts',   postsRoutes);
app.use('/api',         commentsRoutes);
app.use('/api/votes',   votesRoutes);
app.use('/api/social',  socialRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/search',  searchRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(errorHandler);

module.exports = app;