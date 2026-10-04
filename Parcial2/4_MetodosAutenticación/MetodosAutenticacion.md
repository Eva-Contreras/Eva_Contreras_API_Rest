# Métodos de Autenticación en API REST

## Definiciones

En las arquitecturas RESTful, la autenticación es el proceso mediante el cual el servidor verifica la identidad del cliente que realiza una solicitud. Al ser REST un protocolo **sin estado (stateless)**, cada solicitud HTTP debe contener las credenciales o tokens necesarios para autorizar el acceso.

### **1. Autenticación Básica (Basic Authentication)**

Es el método más sencillo definido dentro del estándar HTTP (RFC 7617). Consiste en enviar las credenciales del usuario (nombre de usuario y contraseña) concatenadas con dos puntos (`usuario:contraseña`) y codificadas en **Base64** dentro del encabezado HTTP `Authorization`.

* **Encabezado:** `Authorization: Basic dXN1YXJpbzpjb250cmFzZcOxYQ==`
* **Características:**
  * **No es encriptación:** Base64 es solo un formato de codificación fácil de revertir.
  * Requiere obligatoriamente el uso de **HTTPS (TLS/SSL)** para evitar la interceptación de credenciales.
  * Útil para prototipos rápidos o comunicaciones internas simples.

### **2. Autenticación Digest (Digest Authentication)**

Diseñada para superar la vulnerabilidad de la autenticación básica, la autenticación Digest (RFC 7616) utiliza una función hash para transmitir las credenciales de forma segura sobre conexiones no cifradas.

* **Funcionamiento:**
  1. El cliente intenta acceder al recurso.
  2. El servidor responde con un código de estado `401 Unauthorized` y un valor aleatorio único llamado **nonce**.
  3. El cliente genera un hash (por ejemplo, MD5 o SHA-256) combinando la contraseña, el *nonce*, la URL y el método HTTP.
  4. El cliente reenvía la solicitud con el hash resultante en el encabezado `Authorization`.
* **Características:**
  * La contraseña nunca viaja en texto plano ni codificada de forma reversible.
  * Previene ataques de denegación por retransmisión (*replay attacks*) gracias al uso del *nonce*.


### **3. API Key (Clave de API)**

Una **API Key** es una cadena alfanumérica única asignada a un cliente o aplicación registrada. Permite identificar y autenticar el origen de la llamada a la API.

* **Ubicación de envío:**
  * **Encabezado HTTP (Recomendado):** `X-API-Key: tu_api_key_aqui`
  * **Parámetro de consulta (Query param):** `https://api.ejemplo.com/v1/datos?api_key=tu_api_key_aqui`
* **Características:**
  * Identifica a la *aplicación* o proyecto cliente, no necesariamente al usuario final.
  * Se utiliza principalmente para control de cuotas (*rate limiting*), monetización y rastreo de uso.
  * Debe tratarse como un secreto y no exponerse en código del lado del cliente (como navegadores o apps móviles).

### **4. Autenticación Bearer (Bearer Token)**

El esquema **Bearer** (definido en RFC 6750) es un mecanismo donde el acceso se concede a quien sea el "portador" (*bearer*) del token de seguridad.

* **Encabezado:** `Authorization: Bearer <token>`
* **Funcionamiento:** 
  1. El cliente se autentica inicialmente (por ejemplo, con usuario y contraseña).
  2. El servidor genera y devuelve un token de acceso aleatorio o firmado.
  3. El cliente incluye el token en las subsiguientes solicitudes.
* **Características:**
  * No requiere enviar las credenciales principales en cada llamada.
  * El token suele tener un tiempo de vida corto (*expiration time*).

### **5. JSON Web Token (JWT)**

**JWT** (RFC 7519) es un estándar abierto que define una forma compacta y autosuficiente de transmitir información estructurada en formato JSON entre partes. Se transmite comúnmente dentro de un esquema **Bearer**.

```
[Header].[Payload].[Signature]
```

* **Estructura del Token:**
  * **Header:** Contiene el tipo de token (JWT) y el algoritmo de firma (ej. HS256, RS256).
  * **Payload:** Contiene las declaraciones o *claims* (datos del usuario, permisos, fecha de expiración).
  * **Signature:** Garantiza que el token no ha sido alterado mediante una firma criptográfica realizada con una clave secreta o clave privada.
* **Características:**
  * **Autocontenido:** El servidor no necesita consultar la base de datos para validar el sesión del usuario, basta con verificar la firma.
  * Ideal para arquitecturas descentralizadas y microservicios.

### **6. OAuth 2.0**

**OAuth 2.0** (RFC 6749) no es un protocolo de autenticación directo, sino un **marco de trabajo de autorización** (*authorization framework*). Permite que una aplicación de terceros obtenga acceso limitado a los recursos de un usuario HTTP sin necesidad de conocer sus credenciales primarias.

* **Flujos Principales (Grant Types):**
  * **Authorization Code:** Para aplicaciones web del lado del servidor.
  * **Client Credentials:** Para comunicación máquina a máquina (M2M).
  * **PKCE (Proof Key for Code Exchange):** Extensión obligatoria para aplicaciones de una sola página (SPA) y móviles.
* **OpenID Connect (OIDC):** Es una capa sobre OAuth 2.0 que añade específicamente las funciones de **autenticación de identidad** emitiendo un token adicional llamado `id_token`.

## Tabla Comparativa

| Método | Envío | Nivel de Seguridad | Uso Principal |
| --- | --- | --- | --- |
| **Basic** | Encabezado `Authorization` | Bajo (requiere HTTPS) | Entornos de prueba o APIs internas simples. |
| **Digest** | Encabezado `Authorization` | Medio | Protocolos antiguos donde HTTPS no es viable. |
| **API Key** | Encabezado / Query Param | Medio-Bajo | Control de tráfico, desarrolladores y límites de uso. |
| **Bearer** | Encabezado `Authorization` | Alto (depende del token) | Estándar general para APIs stateless con tokens. |
| **JWT** | Encabezado `Authorization` | Alto | Autenticación basada en tokens y microservicios. |
| **OAuth 2.0** | Encabezado `Authorization` | Muy Alto | Delegación de acceso a terceros y SSO (Single Sign-On). |

## Bibliografía

* Rescorla, E. (2015). *HTTP Authentication: Basic and Digest Access Authentication* (RFC 7617 / RFC 7616). IETF. https://datatracker.ietf.org/doc/html/rfc7617
* Hardt, D. (2012). *The OAuth 2.0 Authorization Framework* (RFC 6749). IETF. https://datatracker.ietf.org/doc/html/rfc6749
* Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)* (RFC 7519). IETF. https://datatracker.ietf.org/doc/html/rfc7519
* Auth0 Docs. (n.d.). *Token-Based Authentication Overview*. https://auth0.com/docs/