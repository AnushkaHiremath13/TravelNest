require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Debug environment variables
console.log('Environment Variables:');
console.log('ADMIN_SECRET_KEY:', process.env.ADMIN_SECRET_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Environment check
const requiredEnvVars = ['MONGODB_URI', 'ADMIN_SECRET_KEY'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ FATAL ERROR: Missing required environment variable ${varName}`);
    process.exit(1);
  }
});

// Debug database connection
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Database:', process.env.MONGODB_URI?.replace(/:([^:@]{8})[^:@]*@/, ':****@'));

// CORS configuration - More permissive during development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Other Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set server timeout to 2.5 minutes
app.use((req, res, next) => {
  res.setTimeout(150000, () => {
    res.status(408).json({ 
      status: 'error',
      message: 'Request timeout after 2.5 minutes' 
    });
  });
  next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../frontend/src/uploads')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Health Check endpoint
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// DB Connection with better error handling
mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    console.log('🔗 Establishing MongoDB connection...');
    console.log('Connecting to database:', process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('Connection details:', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
      models: Object.keys(mongoose.models)
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resorts', require('./routes/resortRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    keyPattern: err.keyPattern
  });

  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found`
  });
});

// Server Init
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Promise Rejection Handler
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});
