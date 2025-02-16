import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const swaggerOptions = {
  swaggerDefinition: {
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://violent-lea-coteisreallycute-52210e1a.koyeb.app'
            : `http://localhost:${process.env.PORT}`,
      },
    ],
    openapi: '3.0.0',
    info: {
      title: '코테는 정말 귀여워 API 문서',
      description: 'API 설명서',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
