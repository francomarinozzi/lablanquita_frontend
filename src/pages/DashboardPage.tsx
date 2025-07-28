import * as React from 'react';
import { Grid, Typography, Box, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { getVentas } from '../api/ventasService';
import { getProducts } from '../api/productsService';
import { getPedidos } from '../api/pedidosService';
import { Venta, Producto, Pedido } from '../types';
import DashboardStatCard from '../components/features/DashboardStatCard';
import GraficoVentasSemanales from '../components/features/GraficoVentasSemanales';
import backgroundImage from '../assets/background-dashboard.jpg';

interface TopProducto {
    nombre: string;
    cantidad: number;
}

interface DatosGrafico {
    fecha: string;
    total: number;
}

export default function DashboardPage() {
  const [ventasHoy, setVentasHoy] = React.useState({ total: 0, cantidad: 0 });
  const [productosActivos, setProductosActivos] = React.useState(0);
  const [pedidosPendientes, setPedidosPendientes] = React.useState(0);
  const [topProductos, setTopProductos] = React.useState<TopProducto[]>([]);
  const [datosGrafico, setDatosGrafico] = React.useState<DatosGrafico[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [ventasData, productosData, pedidosData] = await Promise.all([
            getVentas(), 
            getProducts(),
            getPedidos()
        ]);
        
        const inicioHoy = new Date(new Date().setHours(0, 0, 0, 0));

        const ventasDelDia = ventasData.filter(venta => {
          const fechaVenta = new Date(venta.fechaHora);
          return venta.activo && fechaVenta >= inicioHoy;
        });

        const totalRecaudado = ventasDelDia.reduce((sum, venta) => sum + venta.total, 0);
        setVentasHoy({ total: totalRecaudado, cantidad: ventasDelDia.length });

        const productosEnStock = productosData.filter(p => p.activo && p.en_stock).length;
        setProductosActivos(productosEnStock);

        const pendientes = pedidosData.filter(p => p.activo && (p.estado === 'Pendiente' || p.estado === 'En proceso')).length;
        setPedidosPendientes(pendientes);

        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const datosTemporales: { [key: string]: number } = {};
        const ultimos7dias: DatosGrafico[] = [];

        for (let i = 6; i >= 0; i--) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            const dia = diasSemana[fecha.getDay()];
            const fechaCorta = `${dia} ${fecha.getDate()}`;
            datosTemporales[fecha.toISOString().split('T')[0]] = 0;
            ultimos7dias.push({ fecha: fechaCorta, total: 0 });
        }

        ventasData.forEach(venta => {
            const fechaVenta = venta.fechaHora.split('T')[0];
            if (datosTemporales.hasOwnProperty(fechaVenta)) {
                datosTemporales[fechaVenta] += venta.total;
            }
        });
        
        ultimos7dias.forEach((dia, index) => {
            const fechaISO = Object.keys(datosTemporales)[index];
            dia.total = datosTemporales[fechaISO];
        });

        setDatosGrafico(ultimos7dias);

        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        const ventasUltimaSemana = ventasData.filter(venta => new Date(venta.fechaHora) >= hace7Dias && venta.activo);
        const conteoProductos = new Map<string, number>();
        ventasUltimaSemana.forEach(venta => {
            venta.detalles.forEach(detalle => {
                conteoProductos.set(detalle.nombreProducto, (conteoProductos.get(detalle.nombreProducto) || 0) + detalle.cantidad);
            });
        });
        const productosOrdenados = Array.from(conteoProductos.entries())
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad);
        setTopProductos(productosOrdenados.slice(0, 5));

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
        margin: theme => `-${theme.spacing(3)}`, 
        padding: theme => theme.spacing(3),
        minHeight: 'calc(100vh - 64px)',
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
          opacity: 0.1,
          zIndex: -1,
        },
      }}
    >
      <Typography variant="h4" gutterBottom>
        Resumen General
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}><DashboardStatCard title="Ventas del Día" value={`$${ventasHoy.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} icon={<PointOfSaleIcon sx={{ fontSize: 40 }} />} loading={loading} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><DashboardStatCard title="Cantidad de Ventas (Hoy)" value={ventasHoy.cantidad} icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />} loading={loading} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><DashboardStatCard title="Productos en Stock" value={productosActivos} icon={<Inventory2Icon sx={{ fontSize: 40 }} />} loading={loading} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><DashboardStatCard title="Pedidos Pendientes" value={pedidosPendientes} icon={<PendingActionsIcon sx={{ fontSize: 40 }} />} loading={loading} /></Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        Análisis y Tendencias
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6">Productos Más Vendidos</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>(Últimos 7 días)</Typography>
                    {loading ? <CircularProgress sx={{mt: 2}}/> : (
                        <List dense>
                            {topProductos.map((prod, index) => (
                                <ListItem key={prod.nombre} sx={{py: 0}}>
                                    <ListItemIcon sx={{minWidth: 35}}>
                                        <Typography variant="h6" color="text.secondary">{index + 1}</Typography>
                                    </ListItemIcon>
                                    <ListItemText primary={prod.nombre} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={8}>
            <GraficoVentasSemanales data={datosGrafico} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
}