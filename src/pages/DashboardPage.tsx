import * as React from 'react';
import { Grid, Typography, Box, Card, CardContent } from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getVentas } from '../api/ventasService';
import { getProducts } from '../api/productsService';
import { Venta, Producto } from '../types';
import DashboardStatCard from '../components/features/DashboardStatCard';
import backgroundImage from '../assets/background-dashboard.jpg';

export default function DashboardPage() {
  const [ventasHoy, setVentasHoy] = React.useState({ total: 0, cantidad: 0 });
  const [productosActivos, setProductosActivos] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [ventasData, productosData] = await Promise.all([getVentas(), getProducts()]);
        
        const hoy = new Date();
        const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0));
        const finHoy = new Date(hoy.setHours(23, 59, 59, 999));

        const ventasDelDia = ventasData.filter(venta => {
          const fechaVenta = new Date(venta.fechaHora);
          return venta.activo && fechaVenta >= inicioHoy && fechaVenta <= finHoy;
        });

        const totalRecaudado = ventasDelDia.reduce((sum, venta) => sum + venta.total, 0);
        setVentasHoy({ total: totalRecaudado, cantidad: ventasDelDia.length });

        const productosEnStock = productosData.filter(p => p.activo && p.en_stock).length;
        setProductosActivos(productosEnStock);

      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        // Expande el contenedor para cubrir el padding del layout
        margin: theme => `-${theme.spacing(3)}`, 
        padding: theme => theme.spacing(3),
        height: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
          zIndex: -1,
        },
      }}
    >
      <Typography variant="h4" gutterBottom>
        Resumen General
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardStatCard
            title="Ventas del Día"
            value={`$${ventasHoy.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
            icon={<PointOfSaleIcon sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardStatCard
            title="Cantidad de Ventas (Hoy)"
            value={ventasHoy.cantidad}
            icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardStatCard
            title="Productos Activos en Stock"
            value={productosActivos}
            icon={<Inventory2Icon sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Ideas para el Futuro
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent>
                    <Typography variant="h6">Productos Más Vendidos</Typography>
                    <Typography color="text.secondary">
                        Una lista o gráfico con los 5 productos más populares de la semana para saber qué es lo que más se está moviendo.
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent>
                    <Typography variant="h6">Pedidos Pendientes</Typography>
                    <Typography color="text.secondary">
                        Un contador que muestre cuántos pedidos están "Pendientes" o "En Proceso" para tener un control rápido de la producción.
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
         <Grid item xs={12}>
            <Card>
                <CardContent>
                    <Typography variant="h6">Gráfico de Ventas Semanales</Typography>
                    <Typography color="text.secondary">
                        Un gráfico de barras simple que muestre el total recaudado en cada uno de los últimos 7 días para visualizar tendencias.
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
}