import swaggerJSDoc from 'swagger-jsdoc'
import { env } from './env'

const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "Sekolah Kaya API",
            description: "API documentation for Sekolah Kaya",
            version: '1',
        },
        servers: [
            {
                url: env.BASE_URL
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/**/*.ts", "./src/modules/**/*.ts"],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

export default swaggerSpec