import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";

// Importar las otras páginas acá cuando las cree, por ej:
// import PedidosPage from "../pages/PedidosPage";
// import HistorialPage from "../pages/HistorialPage";
// import NuevaVentaPage from "../pages/NuevaVentaPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "productos",
        element: <ProductsPage />,
      },
      
      // Descomentar estas rutas a medida que vaya creando las páginas.
      
      /*
      {
        path: "nueva-venta",
        element: <p>Aquí irá la página de Nueva Venta</p>, // Reemplaza con <NuevaVentaPage />
      },
      {
        path: "pedidos",
        element: <p>Aquí irá la página de Pedidos</p>, // Reemplaza con <PedidosPage />
      },
      {
        path: "historial",
        element: <p>Aquí irá la página de Historial</p>, // Reemplaza con <HistorialPage />
      },
      */
    ],
  },
]);
