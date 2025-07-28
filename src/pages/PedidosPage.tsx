import * as React from 'react';
import {
  Box, Typography, Button, Tabs, Tab, CircularProgress, useMediaQuery,
  Card, CardContent, CardActions, Chip, Divider, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert, Slide
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Pedido } from '../types';
import { getPedidos, actualizarEstadoPedido, crearPedido, darDeBajaPedido } from '../api/pedidosService';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import NuevoPedidoModal from '../components/features/NuevoPedidoModal';
import PedidoRow from '../components/features/PedidoRow';

type TabValue = 'Pendiente' | 'En proceso' | 'Completado';

export default function PedidosPage() {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentTab, setCurrentTab] = React.useState<TabValue>('Pendiente');
  const [slidingOutId, setSlidingOutId] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);
  const [bajaConfirmOpen, setBajaConfirmOpen] = React.useState(false);
  const [pedidoParaBaja, setPedidoParaBaja] = React.useState<number | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchPedidos = React.useCallback(async (setLoadingState = true) => {
    try {
      if(setLoadingState) setLoading(true);
      const data = await getPedidos();
      setPedidos(data.filter(p => p.activo).sort((a, b) => b.id - a.id));
    } catch (err) {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      if(setLoadingState) setLoading(false);
    }
  }, []);
  
  React.useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);


  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setCurrentTab(newValue);
  };

  const handleActualizarEstado = (id: number) => {
    setSlidingOutId(id);
    setTimeout(async () => {
      try {
        await actualizarEstadoPedido(id);
        await fetchPedidos(false);
      } catch (error) {
        console.error('Error al actualizar el estado:', error);
      } finally {
        setSlidingOutId(null);
      }
    }, 500);
  };

  const handleGuardarPedido = async (pedidoData: any) => {
      try {
        await crearPedido(pedidoData);
        setSnackbar({ open: true, message: 'Pedido creado con éxito.', severity: 'success' });
        fetchPedidos(false);
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al crear el pedido.', severity: 'error' });
      }
  };

  const handleOpenBajaConfirm = (id: number) => {
    setPedidoParaBaja(id);
    setBajaConfirmOpen(true);
  };

  const handleCloseBajaConfirm = () => {
    setPedidoParaBaja(null);
    setBajaConfirmOpen(false);
  };

  const handleConfirmarBaja = async () => {
    if (pedidoParaBaja) {
      setSlidingOutId(pedidoParaBaja);
      setTimeout(async () => {
        try {
          await darDeBajaPedido(pedidoParaBaja);
          await fetchPedidos(false);
          setSnackbar({ open: true, message: 'Pedido eliminado.', severity: 'success' });
        } catch (error) {
           setSnackbar({ open: true, message: 'Error al eliminar el pedido.', severity: 'error' });
        } finally {
          setSlidingOutId(null);
          handleCloseBajaConfirm();
        }
      }, 500);
    }
  };

  const pedidosFiltrados = React.useMemo(() => {
    return pedidos.filter(p => p.estado === currentTab);
  }, [pedidos, currentTab]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  
  const renderContent = () => {
    if (pedidosFiltrados.length === 0) {
      return <Typography color="text.secondary" align="center" sx={{p: 3}}>No hay pedidos en este estado.</Typography>;
    }
    
    if (isMobile) {
      return (
        <Box sx={{ mt: 3, overflow: 'hidden' }}>
          {pedidosFiltrados.map(pedido => (
            <Slide direction="left" in={slidingOutId !== pedido.id} timeout={500} key={pedido.id}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Pedido #{pedido.id}</Typography>
                    <Chip label={pedido.direccion ? 'Delivery' : 'Retira'} color={pedido.direccion ? 'primary' : 'secondary'} size="small" />
                  </Box>
                  {pedido.nombreCliente && <Typography variant="body1" sx={{ mb: 1 }}>{pedido.nombreCliente}</Typography>}
                  {pedido.direccion && <Typography variant="body2" color="text.secondary">{pedido.direccion}</Typography>}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight="bold" sx={{mb: 1}}>Detalle:</Typography>
                  {pedido.detalles.map((detalle, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{detalle.nombreProducto}</Typography>
                      <Typography variant="body2" color="text.secondary">x{detalle.cantidad}</Typography>
                    </Box>
                  ))}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  {pedido.estado === 'Completado' ? (
                    <Button startIcon={<DeleteIcon />} color="error" onClick={() => handleOpenBajaConfirm(pedido.id)} fullWidth>Eliminar</Button>
                  ) : (
                    <Button variant="contained" endIcon={<NavigateNextIcon />} onClick={() => handleActualizarEstado(pedido.id)} fullWidth>
                      {pedido.estado === 'Pendiente' ? 'Pasar a En Proceso' : 'Completar Pedido'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Slide>
          ))}
        </Box>
      )
    }

    return (
       <TableContainer component={Paper} sx={{mt: 3, overflow: 'hidden'}}>
        <Table aria-label="collapsible table">
            <TableHead>
                <TableRow>
                    <TableCell sx={{width: '5%'}} />
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="center">Acción</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {pedidosFiltrados.map((pedido) => (
                  <PedidoRow key={pedido.id} pedido={pedido} onUpdateStatus={handleActualizarEstado} onBajaClick={handleOpenBajaConfirm} isSlidingOut={slidingOutId === pedido.id}/>
                ))}
            </TableBody>
        </Table>
       </TableContainer>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Pedidos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Nuevo Pedido
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} variant={isMobile ? 'fullWidth' : 'standard'}>
          <Tab label="Pendientes" value="Pendiente" />
          <Tab label="En Proceso" value="En proceso" />
          <Tab label="Completados" value="Completado" />
        </Tabs>
      </Box>

      {renderContent()}

      <NuevoPedidoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleGuardarPedido} />

      <Dialog open={bajaConfirmOpen} onClose={handleCloseBajaConfirm}>
        <DialogTitle>Confirmar Baja</DialogTitle>
        <DialogContent>
            <DialogContentText>
            ¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseBajaConfirm}>Cancelar</Button>
            <Button onClick={handleConfirmarBaja} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
      
      {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(null)}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}
    </Box>
  );
}