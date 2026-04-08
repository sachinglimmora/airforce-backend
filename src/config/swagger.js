const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airforce Glimmora API',
      version: '2.0.0',
      description: 'Complete Backend API for Elan Glimmora - Three-domain luxury platform',
      contact: {
        name: 'IAF Training Platform',
      },
    },
    servers: [
      {
        url: 'https://airforce-backend-bice.vercel.app',
        description: 'Production Vercel server',
      },
      {
        url: 'http://localhost:8000',
        description: 'Development local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['trainee', 'instructor', 'admin'] },
            avatar: { type: 'string' },
          },
        },
        Course: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            difficulty: { type: 'string' },
            thumbnail: { type: 'string' },
            modules: { type: 'array', items: { type: 'string' } },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'], // Scan routes and app.js for JSDoc
};

const specs = swaggerJsdoc(options);

module.exports = specs;
