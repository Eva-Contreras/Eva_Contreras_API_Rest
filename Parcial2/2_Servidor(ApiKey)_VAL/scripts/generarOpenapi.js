import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import swaggerDocs from '../src/swagger.js';

const outputPath = fileURLToPath(new URL('../openapi.yaml', import.meta.url));
writeFileSync(outputPath, YAML.stringify(swaggerDocs), 'utf8');
console.log(`Especificación OpenAPI guardada en ${outputPath}`);
