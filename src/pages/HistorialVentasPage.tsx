import * as React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert,
  useMediaQuery, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Venta } from '../types';
import { getVentas, darDeBajaVenta } from '../api/ventasService';
import VentaRow from '../components/features/VentaRow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

export default function HistorialVentasPage() {
  const [ventas, setVentas] = React.useState<Venta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ventaParaEliminarId, setVentaParaEliminarId] = React.useState<number | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cargarVentas = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVentas();
      const ventasActivas = data.filter(venta => venta.activo);
      setVentas(ventasActivas.sort((a, b) => b.id - a.id));
      setError(null);
    } catch (err) {
      setError('No se pudo cargar el historial de ventas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const handleAbrirConfirmarBaja = (id: number) => {
    setVentaParaEliminarId(id);
  };

  const handleCerrarConfirmarBaja = () => {
    setVentaParaEliminarId(null);
  };

  const handleConfirmarBaja = async () => {
    if (ventaParaEliminarId === null) return;

    try {
      await darDeBajaVenta(ventaParaEliminarId);
      setVentas(prevVentas => prevVentas.filter(v => v.id !== ventaParaEliminarId));
      setSnackbar({ open: true, message: 'Venta dada de baja con éxito.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al dar de baja la venta.', severity: 'error' });
    } finally {
      handleCerrarConfirmarBaja();
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const renderDesktopTable = () => (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell sx={{width: '5%'}} />
            <TableCell>ID</TableCell>
            <TableCell>Fecha y Hora</TableCell>
            <TableCell>Forma de Pago</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ventas.map((venta) => (
            <VentaRow key={venta.id} venta={venta} onBajaClick={handleAbrirConfirmarBaja} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileList = () => (
    <Box>
      {ventas.map((venta) => (
        <Accordion key={venta.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" fontWeight="bold">Venta #{venta.id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(venta.fechaHora).toLocaleDateString('es-AR')}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold">
                ${venta.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Forma de Pago: <strong>{venta.formaPago}</strong>
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cant.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {venta.detalles.map((detalle, index) => (
                  <TableRow key={index}>
                    <TableCell>{detalle.nombreProducto}</TableCell>
                    <TableCell align="right">{detalle.cantidad.toLocaleString('es-AR')}</TableCell>
                    <TableCell align="right">${(detalle.cantidad * detalle.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                <Button startIcon={<DeleteIcon />} color="error" onClick={() => handleAbrirConfirmarBaja(venta.id)}>
                    Eliminar Venta
                </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Historial de Ventas
      </Typography>

      {isMobile ? renderMobileList() : renderDesktopTable()}

      <Dialog open={!!ventaParaEliminarId} onClose={handleCerrarConfirmarBaja}>
        <DialogTitle>Confirmar Baja</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres dar de baja esta venta? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarConfirmarBaja}>Cancelar</Button>
          <Button onClick={handleConfirmarBaja} color="error" autoFocus>
            Dar de Baja
          </Button>
        </DialogActions>
      </Dialog>
      
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}