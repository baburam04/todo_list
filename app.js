const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const checklistRoutes = require('./routes/checklist.routes');
const taskRoutes = require('./routes/task.routes');
const errorHandler = require('./middleware/error');

// In your app.js or server.js
const checklists = require('./routes/checklist.routes');
app.use('/api/checklists', checklists);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/tasks', taskRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;