import * as React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert,
  useMediaQuery, Accordion, AccordionSummary, AccordionDetails, TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Venta } from '../types';
import { getVentasPaginadas, darDeBajaVenta } from '../api/ventasService';
import VentaRow from '../components/features/VentaRow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterMenu from '../components/common/FilterMenu';

export default function HistorialVentasPage() {
  const [ventas, setVentas] = React.useState<Venta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ventaParaEliminarId, setVentaParaEliminarId] = React.useState<number | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);
  const [filters, setFilters] = React.useState({});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalElements, setTotalElements] = React.useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cargarVentas = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVentasPaginadas({ 
        ...filters, 
        page: page,
        size: rowsPerPage 
      }); 
      const ventasActivas = data.content.filter(venta => venta.activo);
      setVentas(ventasActivas.sort((a, b) => b.id - a.id));
      setTotalElements(data.totalElements);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar el historial de ventas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage]);

  React.useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const handleFilterChange = (newFilters: any) => {
    setPage(0);
    setFilters(newFilters);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      // No es necesario filtrar el estado localmente, la recarga lo hará
      cargarVentas(); 
      setSnackbar({ open: true, message: 'Venta dada de baja con éxito.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al dar de baja la venta.', severity: 'error' });
    } finally {
      handleCerrarConfirmarBaja();
    }
  };

  if (loading && ventas.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const renderDesktopTable = () => (
    <Paper sx={{mt: 2}}>
      <TableContainer>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
      />
    </Paper>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historial de Ventas
        </Typography>
        <FilterMenu 
          onFilterChange={handleFilterChange}
          filterFields={[
            { name: 'id', label: 'ID de Venta', type: 'number' },
            { name: 'fecha', label: 'Fecha', type: 'date' }
          ]}
        />
      </Box>

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