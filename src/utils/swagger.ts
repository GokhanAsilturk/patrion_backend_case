import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Akıllı Sensör Takip Sistemi API',
      version,
      description: 'Fabrikadaki IoT sensörlerinden veri toplayan API dokümantasyonu',
      contact: {
        name: 'API Destek',
        email: 'info@example.com'
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Sunucusu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Sensors',
        description: 'Sensör verilerini yönetmek için API uç noktaları'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts', 
    './src/models/*.ts',
    './src/types/*.ts'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 