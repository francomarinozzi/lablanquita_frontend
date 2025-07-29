# 🍝 La Blanquita - Sistema de Gestión

Sistema de gestión para "La Blanquita". Esta es una aplicación web completa diseñada para administrar de manera eficiente una fábrica de pastas, cubriendo desde la gestión de productos y ventas hasta el seguimiento de pedidos.

El proyecto está dividido en un **backend** construido con Spring Boot y un **frontend** desarrollado con React y TypeScript.
 
---

## ✨ Características Principales

* **Estadísticas en Tiempo Real:** Un dashboard principal que ofrece una vista rápida del negocio, incluyendo ventas del día, productos más vendidos, pedidos pendientes y un gráfico de rendimiento semanal.
* **Gestión de Productos:** Interfaz para crear, leer, actualizar y dar de baja productos. Permite manejar el stock y configurar precios.
* **Sistema de Ventas:** Una sección dedicada para registrar ventas de mostrador, con un buscador de productos y cálculo automático de precios según la unidad de medida.
* **Gestión de Pedidos:** Un sistema de pestañas para organizar los pedidos.
* **Historial de Ventas:** Una tabla de datos con todas las ventas registradas que permite la visualización de detalles.
* **Diseño Adaptable (Responsive):** La interfaz está diseñada para funcionar de manera fluida tanto en computadoras de escritorio como en dispositivos móviles.
* **Documentación con Swagger:** El backend integra Swagger para una documentación de la API.

---

## 🚀 Puesta en Marcha

Instrucciones para levantar el proyecto.

### Prerrequisitos

* **Node.js** (v18 o superior).
* La **API del backend debe estar en ejecución**. La aplicación frontend se conecta a `http://localhost:8080` por defecto.

### Pasos para la Instalación

1.  **Navegar a la carpeta del frontend:**
    ```bash
    cd ruta/a/tu/frontend
    ```

2.  **Instalar Dependencias:**
    * Ejecutar el siguiente comando para instalar todos los paquetes necesarios:
        ```bash
        npm install
        ```

3.  **Ejecutar la Aplicación:**
    * Iniciar el servidor de desarrollo con:
        ```bash
        npm run dev
        ```
    * La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique la terminal).

---

## 🛠️ Tecnologías Utilizadas

* **React 18** con **TypeScript**
* **Vite**.
* **Material-UI (MUI)** para los componentes de la interfaz.
* **Recharts** para la visualización de gráficos.
* **Axios** para las peticiones a la API.
* **React Router** para la navegación.

---

## 📖 Secciones de la Aplicación

* **Estadísticas:** La página principal que te da un pulso del negocio en tiempo real.
* **Nueva Venta:** El punto de venta principal para registrar transacciones rápidas de mostrador.
* **Productos:** El catálogo completo de tus productos, donde puedes añadir, editar y gestionar el stock.
* **Pedidos:** El centro de operaciones para los pedidos a domicilio o para retirar. Gestiona el flujo de trabajo desde que el pedido entra hasta que se completa.
* **Historial de Ventas:** Un registro detallado y ordenable de todas las transacciones realizadas.
