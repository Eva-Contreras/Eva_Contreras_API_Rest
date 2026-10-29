# API REST de películas

Servidor REST desarrollado con Express. Proporciona operaciones de consulta y
creación de películas, protección mediante API key, carga de archivos y
conexión HTTPS.

## Requisitos

- Node.js y npm.
- Certificado y clave HTTPS en `ssl/server.crt` y `ssl/server.key`.

## Instalación y ejecución

Desde esta carpeta, instala las dependencias:

```bash
npm install
```

Crea un archivo `.env` con la API key que utilizará el servidor:

```env
API_KEY=tu_clave_api
PORT=3000
```

`PORT` es opcional; si no se define, se usa el puerto `3000`. Inicia el servidor
desde esta misma carpeta:

```bash
npm start
```

El servidor estará disponible en `https://localhost:3000` (o en el puerto
configurado). Como usa un certificado local, el cliente HTTP puede mostrar una
advertencia de confianza del certificado.

## Documentación Swagger / OpenAPI

Abre `https://localhost:3000/api-docs` (o usa el puerto configurado) para
consultar y probar `GET /peliculas/` y `GET /peliculas/{id}` desde Swagger UI,
con su apariencia original. La portada Markdown se toma de esta sección del
README; los ejemplos cURL y JavaScript aparecen dentro de la descripción de
cada ruta. La especificación se genera con `swagger-jsdoc` a partir de los
comentarios `@swagger` de esas rutas en `src/router/peliculasRouter.js`; los
demás endpoints siguen disponibles en el servidor, pero no aparecen en Swagger.

Como alternativa, abre `https://localhost:3000/api-reference` para consultar la
misma especificación OpenAPI con **RapiDoc**. En ambas interfaces, la API key
se configura desde la opción de autorización, usando el valor de `API_KEY`;
se enviará en el encabezado `x-api-key`. El documento OpenAPI en JSON está
disponible en `https://localhost:3000/api-spec`. Para generar o actualizar el
archivo `openapi.yaml`, ejecuta `npm run openapi`.

El generador compartido está en `scripts/generarOpenapi.js`; las interfaces y el
endpoint de la especificación están separados en `src/documentation/`. Swagger
UI genera su propia página HTML dinámicamente, mientras que RapiDoc se monta en
`public/api-reference.html`.

<!-- swagger-description:start -->

![Portada de la API REST de películas](/swagger-assets/swagger-cover.svg)

## API REST de películas

Consulta una película usando su identificador. Esta documentación presenta
las operaciones `GET /peliculas/` (listar y filtrar) y `GET /peliculas/{id}`
(buscar por identificador).

### Autenticación

La ruta requiere una API key. Pulsa **Authorize** y escribe el valor de
`API_KEY` configurado en el archivo `.env`. Swagger lo enviará en el encabezado
`x-api-key`.

### Horario del servicio

El servidor acepta solicitudes de lunes a sábado, de 06:00 a 19:59, según su
hora local. Fuera de ese horario responde con HTTP `503`.

<!-- swagger-description:end -->

## Autenticación

Las rutas de películas y la carga de archivos requieren la API key en el
encabezado HTTP `x-api-key`:

```http
x-api-key: tu_clave_api
```

## Rutas

Todas las solicitudes están sujetas al middleware de horario: se aceptan de
lunes a sábado, de 06:00 a 19:59, según la hora local del servidor. Fuera de ese
horario, el servidor responde con HTTP `503`.

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| `GET` | `/` | No | Muestra la página de bienvenida. |
| `GET` | `/peliculas` | Sí | Devuelve las películas. |
| `GET` | `/peliculas?titulo=matrix` | Sí | Filtra por título (coincidencia parcial). |
| `GET` | `/peliculas?director=nolan` | Sí | Filtra por director (coincidencia parcial). |
| `GET` | `/peliculas?anio=2010` | Sí | Filtra por año. |
| `GET` | `/peliculas/:id` | Sí | Busca una película por ID. |
| `POST` | `/peliculas` | Sí | Agrega una película. |
| `POST` | `/subir` | Sí | Sube un archivo en el campo `archivo`. |
| `GET` | `/uploads/:nombre` | No | Accede a un archivo guardado. |

Para crear una película, envía JSON con los tres campos requeridos:

```json
{
  "titulo": "Arrival",
  "director": "Denis Villeneuve",
  "anio": 2016
}
```

`titulo` y `director` deben ser cadenas no vacías; `anio` debe ser un número
entero positivo. Si la validación falla, la API responde con HTTP `400`.

Para subir un archivo, usa una solicitud `multipart/form-data` con el campo
`archivo`. Los archivos se guardan en `uploads/` y sus datos se agregan a
`metadata.json`.

## Datos y registros

- El catálogo inicial de películas y las películas agregadas se mantienen en
  memoria; las nuevas películas se pierden al reiniciar el proceso.
- Los accesos se registran en `logs/accesos.log`.
- Los errores se registran en `logs/errores.log`.
- Los metadatos de archivos subidos se guardan en `metadata.json`.

## Estructura del proyecto

```text
.
├── src/
│   ├── index.js
│   ├── middleware/
│   ├── router/
│   └── views/
├── logs/                  # Registros de accesos y errores
├── ssl/                  # Certificado y clave HTTPS
├── uploads/              # Archivos recibidos y servidos
├── docs/                 # Documentación JSDoc generada (no versionada)
├── jsdoc.json
└── package.json
```

El código de la aplicación está en `src/`. Los registros, archivos subidos y
metadatos se mantienen separados del código fuente; los certificados HTTPS se
guardan en `ssl/`.

## Generar documentación JSDoc

JSDoc y el tema Docdash están instalados como dependencias del proyecto. La
configuración en `jsdoc.json` documenta únicamente
`src/middleware/horarioLaboral.js` y usa Docdash para generar las páginas con
navegación lateral y búsqueda. Desde esta carpeta, genera la documentación HTML
con:

```bash
npm run doc
```

Los archivos generados se guardan en `docs/`; abre `docs/index.html` en el
navegador para consultarlos.
