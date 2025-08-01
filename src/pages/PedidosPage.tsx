import * as React from 'react';
import {
  Box, Typography, Button, Tabs, Tab, CircularProgress, useMediaQuery,
  Card, CardContent, CardActions, Chip, Divider, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert, Collapse,
  Accordion, AccordionSummary, AccordionDetails, TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Pedido } from '../types';
import { getPedidosPaginados, actualizarEstadoPedido, crearPedido, darDeBajaPedido } from '../api/pedidosService';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NuevoPedidoModal from '../components/features/NuevoPedidoModal';
import FilterMenu from '../components/common/FilterMenu';
import PedidoRow from '../components/features/PedidoRow';
import DetailPanelContent from '../components/features/DetailPanelContent';

type TabValue = 'Pendiente' | 'En proceso' | 'Completado';

export default function PedidosPage() {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentTab, setCurrentTab] = React.useState<TabValue>('Pendiente');
  const [hidingPedidoId, setHidingPedidoId] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);
  const [bajaConfirmOpen, setBajaConfirmOpen] = React.useState(false);
  const [pedidoParaBaja, setPedidoParaBaja] = React.useState<number | null>(null);
  const [filters, setFilters] = React.useState({});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalElements, setTotalElements] = React.useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchPedidos = React.useCallback(async (setLoadingState = true) => {
    try {
      if(setLoadingState) setLoading(true);
      const data = await getPedidosPaginados({ 
          ...filters, 
          estado: currentTab, 
          page: page,
          size: rowsPerPage 
        });
      setPedidos(data.content.filter(p => p.activo));
      setTotalElements(data.totalElements);
    } catch (err) {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      if(setLoadingState) setLoading(false);
    }
  }, [filters, currentTab, page, rowsPerPage]);
  
  React.useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);


  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setCurrentTab(newValue);
    setPage(0);
  };

  const handleFilterChange = (newFilters: any) => {
      setFilters(newFilters);
      setPage(0);
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const createDelayedAction = (id: number, action: () => Promise<void>) => {
    setHidingPedidoId(id);
    setTimeout(async () => {
      try {
        await action();
        await fetchPedidos(false);
      } catch (error) {
        console.error('Error al procesar la acción:', error);
      } finally {
        setHidingPedidoId(null);
      }
    }, 300);
  };

  const handleActualizarEstado = (id: number) => {
    createDelayedAction(id, () => actualizarEstadoPedido(id));
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
      handleCloseBajaConfirm();
      createDelayedAction(pedidoParaBaja, async () => {
          await darDeBajaPedido(pedidoParaBaja);
          setSnackbar({ open: true, message: 'Pedido eliminado.', severity: 'success' });
      });
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (pedidos.length === 0) {
      return <Typography color="text.secondary" align="center" sx={{p: 3}}>No hay pedidos que coincidan con los filtros.</Typography>;
    }
    
    if (isMobile) {
      return (
        <Box sx={{ mt: 3, overflow: 'hidden' }}>
          {pedidos.map(pedido => (
            <Collapse in={hidingPedidoId !== pedido.id} key={pedido.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Pedido #{pedido.id}</Typography>
                            {pedido.nombreCliente && <Typography variant="body1">{pedido.nombreCliente}</Typography>}
                        </Box>
                        <Chip label={pedido.direccion ? 'Delivery' : 'Retira'} color={pedido.direccion ? 'primary' : 'secondary'} size="small" />
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <DetailPanelContent row={pedido} isMobile={true} />
                    <Box sx={{ mt: 2 }}>
                        {pedido.estado !== 'Completado' ? (
                            <Button variant="contained" endIcon={<NavigateNextIcon />} onClick={() => handleActualizarEstado(pedido.id)} fullWidth>
                                {pedido.estado === 'Pendiente' ? 'Pasar a En Proceso' : 'Completar Pedido'}
                            </Button>
                        ) : (
                            <Button startIcon={<DeleteIcon />} color="error" onClick={() => handleOpenBajaConfirm(pedido.id)} fullWidth>
                                Eliminar
                            </Button>
                        )}
                    </Box>
                </AccordionDetails>
              </Accordion>
            </Collapse>
          ))}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas:"
          />
        </Box>
      );
    }

    return (
       <Paper sx={{mt: 3}}>
        <TableContainer>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: '5%'}} />
                        <TableCell>ID</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Dirección</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="center">Acción</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pedidos.map((pedido) => (
                    <PedidoRow key={pedido.id} pedido={pedido} onUpdateStatus={handleActualizarEstado} onBajaClick={handleOpenBajaConfirm} isSlidingOut={hidingPedidoId === pedido.id}/>
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
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Pedidos</Typography>
        <Box sx={{display: 'flex', gap: 2}}>
            <FilterMenu 
              onFilterChange={handleFilterChange}
              filterFields={[
                { name: 'nombreCliente', label: 'Nombre del Cliente', type: 'text' },
                { name: 'fecha', label: 'Fecha', type: 'date' }
              ]}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
                Nuevo Pedido
            </Button>
        </Box>
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