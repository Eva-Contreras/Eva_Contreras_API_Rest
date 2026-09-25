# Estructura de un Archivo WSDL

## Definiciones

#### **¿Qué es un archivo WSDL?**

Un archivo **WSDL** (*Web Services Description Language*) es un documento escrito en XML que describe la interfaz, ubicación y métodos de un servicio web SOAP. Funciona como un contrato formal entre el proveedor del servicio y el cliente, definiendo exactamente qué operaciones se pueden realizar, qué datos se requieren y cómo se deben estructurar los mensajes de solicitud y respuesta.

Con WSDL, una aplicación cliente puede conocer de manera automática cómo interactuar con el servicio sin necesidad de conocer la implementación interna del servidor.

#### **Elementos Principales de un Archivo WSDL**

Un archivo WSDL 1.1 se estructura en cinco secciones fundamentales dentro de una etiqueta raíz `<definitions>`:

| Elemento | Descripción | 
 | ----- | ----- | 
| `<types>` | Define los tipos de datos personalizados utilizados por el servicio web mediante el uso de esquemas XML (**XSD**). Describe la estructura interna de los objetos transferidos. | 
| `<message>` | Define los datos que se intercambian en una transacción. Cada mensaje está compuesto por una o más partes que mapean a los tipos definidos en `<types>`. | 
| `<portType>` | Es la interfaz abstracta del servicio. Agrupa un conjunto de operaciones (`<operation>`) soportadas por el servidor e indica qué mensajes corresponden a la entrada (`<input>`) y a la salida (`<output>`). | 
| `<binding>` | Define el protocolo de comunicación concreto (por ejemplo, SOAP sobre HTTP) y el formato de los datos para un `<portType>` específico. | 
| `<service>` | Especifica la ubicación física o dirección de red (URL / Endpoint) donde el cliente puede acceder al servicio web. Contiene puertos que enlazan un `<binding>` con una dirección (`<soap:address>`). | 

#### **Tipos de Operaciones en WSDL**

Dentro del elemento `<portType>`, las operaciones definen el flujo de interacción entre el cliente y el servidor:

* **Solicitud-Respuesta (Request-Response):** El cliente envía una petición y espera una respuesta del servidor (es el patrón más común).

* **Una sola vía (One-way):** El cliente envía un mensaje al servidor sin esperar ninguna respuesta.

* **Solicitud de servidor (Solicit-Response):** El servidor envía un mensaje al cliente y espera una respuesta.

* **Notificación (Notification):** El servidor envía un mensaje al cliente sin esperar respuesta.

#### **Ejemplo de Estructura WSDL**

A continuación se muestra un archivo WSDL simplificado para un servicio de consulta de inventario:

```xml
<definitions name="InventarioService"
             targetNamespace="http://ejemplo.com/inventario"
             xmlns:tns="http://ejemplo.com/inventario"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             xmlns="http://schemas.xmlsoap.org/wsdl/">

    <!-- 1. Tipos de Datos (XSD) -->
    <types>
        <xsd:schema targetNamespace="http://ejemplo.com/inventario">
            <xsd:element name="ObtenerStockRequest" type="xsd:string"/>
            <xsd:element name="ObtenerStockResponse" type="xsd:int"/>
        </xsd:schema>
    </types>

    <!-- 2. Mensajes -->
    <message name="StockInput">
        <part name="productoId" element="tns:ObtenerStockRequest"/>
    </message>
    <message name="StockOutput">
        <part name="cantidad" element="tns:ObtenerStockResponse"/>
    </message>

    <!-- 3. PortType (Interfaz y Operaciones) -->
    <portType name="InventarioPortType">
        <operation name="obtenerStock">
            <input message="tns:StockInput"/>
            <output message="tns:StockOutput"/>
        </operation>
    </portType>

    <!-- 4. Binding (Protocolo SOAP) -->
    <binding name="InventarioBinding" type="tns:InventarioPortType">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="obtenerStock">
            <soap:operation soapAction="http://ejemplo.com/inventario/obtenerStock"/>
            <input><soap:body use="literal"/></input>
            <output><soap:body use="literal"/></output>
        </operation>
    </binding>

    <!-- 5. Service (Endpoint) -->
    <service name="InventarioService">
        <port name="InventarioPort" binding="tns:InventarioBinding">
            <soap:address location="http://ejemplo.com/webservices/inventario"/>
        </port>
    </service>

</definitions>
```

#### **Diferencias entre WSDL 1.1 y WSDL 2.0**

Aunque WSDL 1.1 sigue siendo el estándar más extendido en entornos industriales y legados, WSDL 2.0 simplificó varios términos para mejorar la claridad de la especificación:

| WSDL 1.1 | WSDL 2.0 | Descripción del Cambio | 
 | ----- | ----- | ----- | 
| `<portType>` | `<interface>` | Renombrado para reflejar con mayor claridad el concepto de interfaz orientada a objetos. | 
| `<port>` | `<endpoint>` | Renombrado para definir el punto de acceso concreto a la red. | 
| `<message>` | *Eliminado* | Se eliminó este elemento; en WSDL 2.0 las operaciones hacen referencia directa a los elementos definidos en `<types>`. | 

## Bibliografía

* W3C. (2001). *Web Services Description Language (WSDL) 1.1*. W3C Recommendation. https://www.w3.org/TR/wsdl

* W3C. (2007). *Web Services Description Language (WSDL) Version 2.0 Part 1: Core Language*. W3C Recommendation. https://www.w3.org/TR/wsdl20/

* IBM. (n.d.). *WSDL elements*. IBM Documentation. https://www.ibm.com/docs/en/