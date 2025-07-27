import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";
import NuevaVentaPage from "../pages/NuevaVentaPage";
import HistorialVentasPage from "../pages/HistorialVentasPage";
import PedidosPage from "../pages/PedidosPage";

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
      {
        path: "nueva-venta",
        element: <NuevaVentaPage />,
      },
      {
        path: "pedidos",
        element: <PedidosPage />,
      },
      {
        path: "historial",
        element: <HistorialVentasPage />,
      },
    ],
  },
]);