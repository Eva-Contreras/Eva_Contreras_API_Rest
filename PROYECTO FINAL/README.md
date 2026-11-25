# API REST de películas

Servidor REST desarrollado con Express. Proporciona operaciones de consulta y
creación de películas, protección mediante API key y carga de archivos.

## Requisitos

- Node.js 20 o 22 en adelante, y npm.
- MySQL con acceso a la base de datos de películas.
- Para ejecución local: certificado y clave HTTPS en `ssl/server.crt` y
  `ssl/server.key`. En producción el proveedor se encarga de HTTPS.

## Instalación y ejecución

Desde esta carpeta, instala las dependencias:

```bash
npm install
```

Configura el archivo `.env` con la API key y los datos de conexión a MySQL:

```env
API_KEY=tu_clave_api
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=api_peliculas_db
```

Las conexiones a hosts `*.aivencloud.com` activan TLS automáticamente.
Para otro host, configura `DB_SSL=true` para activar TLS o `DB_SSL=false`
para desactivarlo. Sin `DB_SSL_CA`, TLS cifra la conexión pero **no verifica
la identidad del servidor**. Para verificarla, configura `DB_SSL_CA` con el
contenido PEM del certificado CA de Aiven; no guardes credenciales en Git.

Antes de iniciar la API, crea la base de datos y la tabla con el siguiente SQL
desde un cliente MySQL, usando una cuenta con permisos suficientes:

```sql
CREATE DATABASE IF NOT EXISTS api_peliculas_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE api_peliculas_db;

CREATE TABLE IF NOT EXISTS peliculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    director VARCHAR(150) NOT NULL,
    anio INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

El catálogo no se carga automáticamente; agrega las películas con la API o con
sentencias `INSERT` en MySQL. Si utilizas otro nombre en `DB_NAME`, crea y
selecciona esa base de datos en lugar de `api_peliculas_db`.

`PORT` es opcional; si no se define, se usa el puerto `3000`. Inicia el servidor
desde esta misma carpeta:

```bash
npm start
```

En Render o Railway, configura el directorio raíz del servicio como
`PROYECTO FINAL`, define `NODE_ENV=production` y las variables de MySQL y
`API_KEY` en el panel. El proveedor asigna `PORT` y termina HTTPS; la aplicación
escucha HTTP internamente y confía en un proxy inverso. En producción, Swagger
utiliza el mismo servidor desde el que se abre la documentación. CORS permite
peticiones desde cualquier origen.

## Pruebas

Ejecuta las pruebas de las rutas de películas (con Chai-HTTP y la base de
datos simulada) y del middleware de horario laboral:

```bash
npm run test
```

El servidor estará disponible en `https://localhost:3000` (o en el puerto
configurado). Como usa un certificado local, el cliente HTTP puede mostrar una
advertencia de confianza del certificado. En producción, usa la URL HTTPS
proporcionada por el proveedor.

## Documentación Swagger / OpenAPI

Abre `https://localhost:3000/api-docs` (o usa el puerto configurado) para
consultar y probar las operaciones de películas desde Swagger UI. La portada
Markdown se toma de esta sección del README. La especificación se genera con
`swagger-jsdoc` a partir de los comentarios `@swagger` de esas rutas en
`src/router/peliculasRouter.js`; los demás endpoints siguen disponibles en el
servidor, pero no aparecen en Swagger.

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

El proyecto usa un `override` de npm para corregir una vulnerabilidad en la
dependencia `glob` de `swagger-jsdoc`, sin sustituir el generador de OpenAPI.

<!-- swagger-description:start -->

![Portada de la API REST de películas](/swagger-assets/swagger-cover.svg)

## API REST de películas

Consulta, crea, actualiza o elimina películas. Esta documentación presenta
las operaciones `GET` y `POST` en `/peliculas/`, y `GET`, `PUT` y `DELETE`
en `/peliculas/{id}`.

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
| `PUT` | `/peliculas/:id` | Sí | Actualiza una película completa. |
| `DELETE` | `/peliculas/:id` | Sí | Elimina una película. |
| `POST` | `/subir` | Sí | Sube un archivo en el campo `archivo`. |
| `GET` | `/uploads/:nombre` | No | Accede a un archivo guardado. |

Para crear o actualizar una película, envía JSON con los tres campos requeridos:

```json
{
  "titulo": "Arrival",
  "director": "Denis Villeneuve",
  "anio": 2016
}
```

`titulo` y `director` deben ser cadenas no vacías de hasta 255 y 150 caracteres,
respectivamente; `anio` debe ser un entero positivo de hasta 2147483647.
Si la validación falla, la API responde con HTTP `400`.
Al eliminar una película existente, la API responde con HTTP `204` sin contenido.

Para subir un archivo, usa una solicitud `multipart/form-data` con el campo
`archivo`. Los archivos se guardan en `uploads/` y sus datos se agregan a
`metadata.json`. Los archivos subidos se sirven públicamente mediante
`/uploads/:nombre`. En servicios con almacenamiento efímero, tanto los archivos
como los metadatos pueden perderse al reiniciar o desplegar; para conservarlos
se necesita almacenamiento persistente.

## Datos y registros

- Las películas se almacenan en MySQL y se conservan al reiniciar el proceso.
- Los accesos se registran en `logs/accesos.log`.
- Los errores se registran en `logs/errores.log`.
- Los metadatos de archivos subidos se guardan en `metadata.json`.
- Los archivos de `uploads/`, los metadatos y los registros están ignorados por
  Git, pero eliminarlos del seguimiento no los borra del historial ya publicado.

## Estructura del proyecto

```text
.
├── src/
│   ├── index.js
│   ├── database/          # Conexión compartida a MySQL
│   ├── middleware/
│   ├── router/
│   ├── services/          # Consultas de películas
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
