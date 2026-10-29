import 'dotenv/config';
import { readFileSync } from 'node:fs';
import swaggerJsDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'node:url';

const readme = readFileSync(
    fileURLToPath(new URL('../README.md', import.meta.url)),
    'utf8'
);
const descripcionSwagger = readme.match(
    /<!-- swagger-description:start -->([\s\S]*?)<!-- swagger-description:end -->/
);

if (!descripcionSwagger) {
    throw new Error('No se encontró la sección de portada Swagger en README.md');
}

const datosReadme = descripcionSwagger[1].trim();

const swaggerOptions = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'API REST de películas',
            version: '1.0.0',
            description: datosReadme
        },
        servers: [{
            url: `https://localhost:${process.env.PORT || 3000}`,
            description: 'Servidor local HTTPS'
        }]
    },
    apis: [
        fileURLToPath(new URL('./router/peliculasRouter.js', import.meta.url))
    ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
