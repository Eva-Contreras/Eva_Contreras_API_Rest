import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from '../../scripts/generarOpenapi.js';

const router = Router();

const cdn = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14';

router.use('/', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customCssUrl: `${cdn}/swagger-ui.min.css`,
    customJs: [
        `${cdn}/swagger-ui-bundle.js`,
        `${cdn}/swagger-ui-standalone-preset.js`
    ],
    swaggerOptions: {
        docExpansion: 'none',
        defaultModelsExpandDepth: 1
    }
}));

export default router;
