# Desarrollo API Rest
## Definiciones
#### **¿Qué es un API?**
Una Application Programming Interface es un conjunto de reglas o protocolos que permiten que las aplicaciones de software se comuniquen entre sí para intercambiar datos, características y funcionalidades. Por ejemplo, el sistema de software del instituto de meteorología contiene datos meteorológicos diarios. La aplicación meteorológica del teléfono se comunica con este sistema a través de las API y muestra las actualizaciones meteorológicas diarias en el teléfono.

Con aplicación se refiere a cualquier software con una función distinta. La interfaz puede considerarse como un contrato de servicio entre dos aplicaciones. Este contrato define cómo se comunican entre sí mediante solicitudes y respuestas. 

![APIs](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReYWgtoKNC-h7Ku5pAKhjHSHvtsMK5LI4A_C3e-72RjfIvVkUKcJq9hLDl&s=10)

*¿Cómo funcionan las API?*
Existe un cliente y un servidor en donde la aplicación que envía la solicitud es el cliente, y la que envía la respuesta es el servidor.

La transferencia de datos difiere según el servicio web que se utiliza, pero siempre a través de una API, que se encuentra dentro de la aplicación para que el usuario no tenga visibilidad en dicha interfaz.

**Tipos de APIs**

**API Web:** Transferencia de datos y funcionalidades a través de Internet mediante el protocolo HTTP. Los cuatro tipos principales son:
- *API abiertas:* Interfaces de programación de aplicaciones de código abierto que se puede acceder con el protocolo HTTP. También conocidas como API públicas, han definido endpoints de API y formatos de solicitud y respuesta.
- *API de socios:* Conectan a asociados de negocios estratégicos. Normalmente, los desarrolladores acceden a estas API en modo de autoservicio a través de un portal de desarrolladores de API público. Aún así, deben completar un proceso de incorporación y obtener credenciales de inicio de sesión para acceder a las API de socios.
- *API internas:* Permanecen ocultas para los usuarios externos. Estas API privadas no están disponibles para usuarios fuera de la empresa. En cambio, las organizaciones las utilizan para mejorar la productividad y la comunicación entre diferentes equipos de desarrollo internos.
- *API compuestas:* Combinan múltiples API de datos o servicios. Permiten a los programadores acceder a varios endpoints en una sola llamada. Las API compuestas son útiles en la arquitectura de microservicios, donde la realización de una única tarea puede requerir información de varias fuentes.

**API de bases de datos:** Se utilizan para conectar aplicaciones y sistemas de gestión de bases de datos.

**API local:** Se emplean para definir cómo las aplicaciones emplean los servicios y recursos del sistema operativo.

**API remota:** Utilizadas para definir cómo interactúan las aplicaciones en diferentes dispositivos.

#### **¿Qué es Rest?**

La estrategia de estado representacional es una arquitectura de software que impone condiciones sobre el funcionamiento de una API. REST se creó inicialmente como una guía para gestionar la comunicación en una red compleja como Internet. Una arquitectura basada en REST puede emplearse para apoyar una comunicación fiable y de alto rendimiento a escala. Puede implementarla y modificarla fácilmente, lo que aporta visibilidad y portabilidad multiplataforma a cualquier sistema de API.

![APIs](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6gJ0Tr3AUepxzKhIAVC95hZq_tq8-DY3virMgU6djFf6Z0M3Hk5KK8OeM&s=10)

**Principios de diseño**

| Principio | Descripción |
| --- | --- |
| Interfaz uniforme | Todas las solicitudes de API para el mismo recurso deben tener el mismo aspecto, independientemente de su procedencia. La API REST debe garantizar que el mismo dato, como el nombre o la dirección de correo electrónico de un usuario, pertenezca a un solo identificador de recursos uniforme (URI). Los recursos no deben ser demasiado grandes, pero deben contener toda la información que el cliente pueda necesitar. |
| Desacoplamiento cliente/servidor | En el diseño de API REST, las aplicaciones cliente y servidor deben ser independientes entre sí. La única información que debe conocer la aplicación cliente es el URI del recurso solicitado; no puede interactuar con la aplicación servidor de ninguna otra forma. Del mismo modo, una aplicación de servidor no debe modificar la aplicación cliente más que pasarle los datos solicitados a través de HTTP. |
| Sin estado | Las API REST no tienen estado, lo que significa que cada solicitud debe incluir toda la información necesaria para procesarla. En otras palabras, las API REST no requieren ninguna sesión del lado del servidor. Las aplicaciones de servidor no pueden almacenar ningún dato relacionado con una solicitud de cliente. |
| Capacidad de almacenamiento en caché | Cuando sea posible, los recursos deben poder almacenarse en caché en el lado del cliente o del servidor. Las respuestas del servidor también deben contener información sobre si se permite el almacenamiento en caché para el recurso entregado. El objetivo es mejorar el rendimiento en el lado del cliente y, al mismo tiempo, aumentar la escalabilidad en el lado del servidor. |
| Arquitectura de sistema en capas | En las API REST, las llamadas y respuestas pasan por diferentes capas. Como regla de oro, no asuma que las aplicaciones cliente y servidor se conectan directamente entre sí. Es posible que haya varios intermediarios diferentes en el circuito de comunicación. Las API REST deben diseñarse de tal manera que ni el cliente ni el servidor puedan saber si se comunica con la aplicación final o con un intermediario. |
| Código bajo demanda | Por lo general las API REST envían recursos estáticos, pero, en algunos casos, las respuestas también pueden contener código ejecutable (como applets de Java). En estos casos, el código debe ejecutarse solo bajo demanda. |

#### **¿A qué se refiere el término RestFul?**
La API RESTful es una interfaz que dos sistemas de computación utilizan para intercambiar información de manera segura a través de Internet. La mayoría de las aplicaciones para empresas deben comunicarse con otras aplicaciones internas o de terceros para llevar a cabo varias tareas. Por ejemplo, para generar nóminas mensuales, su sistema interno de cuentas debe compartir datos con el sistema bancario de su cliente para automatizar la facturación y comunicarse con una aplicación interna de planillas de horarios. Las API RESTful admiten este intercambio de información porque siguen estándares de comunicación de software seguros, confiables y eficientes.

![APIs](https://www.weblantropia.com/wp-content/uploads/2016/05/RESTful-API-1-1260x710.jpg)

**¿Cómo funcionan las API RestFul?**

La función básica de una API RESTful es la misma que navegar por Internet. Cuando requiere un recurso, el cliente se pone en contacto con el servidor mediante la API. Los desarrolladores de API explican cómo el cliente debe utilizar la API REST en la documentación de la API de la aplicación del servidor. A continuación, se indican los pasos generales para cualquier llamada a la API REST:

1. El cliente envía una solicitud al servidor. El cliente sigue la documentación de la API para dar formato a la solicitud de una manera que el servidor comprenda.
2. El servidor autentica al cliente y confirma que este tiene el derecho de hacer dicha solicitud.
3. El servidor recibe la solicitud y la procesa internamente.
4. Luego, devuelve una respuesta al cliente. Esta respuesta contiene información que dice al cliente si la solicitud se procesó de manera correcta. La respuesta también incluye cualquier información que el cliente haya solicitado.

Los detalles de la solicitud y la respuesta de la API REST varían un poco en función de cómo los desarrolladores de la API la hayan diseñado.

## Bibliografía
- Goodwin, M. (2025, November 26). API. IBM. https://www.ibm.com/mx-es/think/topics/api
- Amazon Web Services. (n.d.). ¿Qué es una interfaz de programación de aplicaciones (API)? Amazon Web Services, Inc. https://aws.amazon.com/es/what-is/api/
- ¿Qué es una API REST (API RESTful)? | IBM. (2025, April 29). https://www.ibm.com/mx-es/think/topics/rest-apis
- ¿Qué es REST? - AWS AppSync GraphQL. (n.d.). https://docs.aws.amazon.com/es_es/appsync/latest/devguide/what-is-rest.html
- Amazon Web Services. (n.d.). ¿Qué es una API RESTful? Amazon Web Services, Inc. https://aws.amazon.com/es/what-is/restful-api/
