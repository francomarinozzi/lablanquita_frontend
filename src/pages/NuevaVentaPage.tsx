import * as React from 'react';
import {
  Box, Typography, Button, Paper, ToggleButtonGroup, ToggleButton, Snackbar, Alert,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { VentaParaCrear } from '../types';
import { crearVenta } from '../api/ventasService';
import EditorDetallesVenta, { DetalleVentaState } from '../components/features/EditorDetallesVenta';

export default function NuevaVentaPage() {
  const [detalles, setDetalles] = React.useState<DetalleVentaState[]>([]);
  const [totalVenta, setTotalVenta] = React.useState(0);
  const [formaPago, setFormaPago] = React.useState<string | null>('Efectivo');
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);
  const [editorKey, setEditorKey] = React.useState(Date.now()); // <-- Clave para forzar el reseteo

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDetallesChange = (nuevosDetalles: DetalleVentaState[], nuevoTotal: number) => {
    setDetalles(nuevosDetalles);
    setTotalVenta(nuevoTotal);
  };
  
  const handleFormaPagoChange = (event: React.MouseEvent<HTMLElement>, nuevaFormaPago: string | null) => {
    if (nuevaFormaPago !== null) setFormaPago(nuevaFormaPago);
  };

  const resetVenta = () => {
    setDetalles([]);
    setTotalVenta(0);
    setFormaPago('Efectivo');
    setEditorKey(Date.now()); // <-- Cambiamos la key para resetear el componente hijo
  };

  const handleFinalizarVenta = async () => {
    const detallesValidos = detalles.filter(d => d.cantidad > 0);
    
    if (detalles.length > 0 && detallesValidos.length !== detalles.length) {
        setSnackbar({ open: true, message: 'Todos los productos deben tener una cantidad mayor a cero.', severity: 'error' });
        return;
    }

    if (detallesValidos.length === 0) {
        setSnackbar({ open: true, message: 'Agregue productos y cantidades válidas.', severity: 'error' });
        return;
    }
    if (!formaPago) {
      setSnackbar({ open: true, message: 'Seleccione una forma de pago.', severity: 'error' });
      return;
    }

    const venta: VentaParaCrear = {
      formaPago: formaPago,
      detalles: detallesValidos.map((item) => {
        let cantidadParaEnviar = item.cantidad;
        if (item.unidadMedida === 'g') cantidadParaEnviar = item.cantidad / 100;
        else if (item.unidadMedida === 'docena') cantidadParaEnviar = item.cantidad / 12;
        return { producto: { id: item.producto.id }, cantidad: cantidadParaEnviar };
      }),
    };

    try {
      await crearVenta(venta);
      setSnackbar({ open: true, message: 'Venta registrada con éxito.', severity: 'success' });
      resetVenta();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al registrar la venta.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Nueva Venta</Typography>
      
      <EditorDetallesVenta 
        key={editorKey} // <-- Pasamos la key aquí
        onDetallesChange={handleDetallesChange}
        onSaveProductSuccess={() => setSnackbar({ open: true, message: 'Producto creado con éxito.', severity: 'success' })}
      />

      <Paper sx={{ p: { xs: 2, md: 3 }, mt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: {xs: '100%', sm: 'auto'} }}>
            <Typography variant="h6">Forma de pago</Typography>
            <ToggleButtonGroup color="primary" value={formaPago} exclusive fullWidth={isMobile} onChange={handleFormaPagoChange}><ToggleButton value="Efectivo">Efectivo</ToggleButton><ToggleButton value="Tarjeta">Tarjeta</ToggleButton><ToggleButton value="Transferencia">Transferencia</ToggleButton></ToggleButtonGroup>
          </Box>
          <Box sx={{ textAlign: 'right', width: {xs: '100%', sm: 'auto'} }}>
            <Typography variant="h5" component="div" fontWeight="bold">Total: ${totalVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            <Button variant="contained" size="large" sx={{ mt: 1 }} fullWidth={isMobile} onClick={handleFinalizarVenta} disabled={detalles.length === 0}>Finalizar Venta</Button>
          </Box>
        </Box>
      </Paper>
      
      {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}
    </Box>
  );
}