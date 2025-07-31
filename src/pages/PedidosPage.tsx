import * as React from 'react';
import {
  Box, Typography, Button, Tabs, Tab, CircularProgress, useMediaQuery,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert, Paper, Chip, IconButton,
  Card, CardContent, CardActions, Divider, Slide
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { Pedido } from '../types';
import { getPedidosPaginados, actualizarEstadoPedido, crearPedido, darDeBajaPedido } from '../api/pedidosService'; // <-- USA LA FUNCIÓN CORRECTA
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import NuevoPedidoModal from '../components/features/NuevoPedidoModal';
import FilterMenu from '../components/common/FilterMenu';

type TabValue = 'Pendiente' | 'En proceso' | 'Completado';

export default function PedidosPage() {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentTab, setCurrentTab] = React.useState<TabValue>('Pendiente');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);
  const [bajaConfirmOpen, setBajaConfirmOpen] = React.useState(false);
  const [pedidoParaBaja, setPedidoParaBaja] = React.useState<number | null>(null);
  const [filters, setFilters] = React.useState({});
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = React.useState(0);
  const [slidingOutId, setSlidingOutId] = React.useState<number | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchPedidos = React.useCallback(async () => {
    setLoading(true);
    try {
      const combinedFilters = {
        ...filters,
        estado: currentTab,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      };
      const data = await getPedidosPaginados(combinedFilters); // <-- USA LA FUNCIÓN CORRECTA
      setPedidos(data.content.filter(p => p.activo));
      setRowCount(data.totalElements);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'No se pudieron cargar los pedidos.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters, paginationModel, currentTab]);

  React.useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setCurrentTab(newValue);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };
  
  const createDelayedAction = (id: number, action: () => Promise<void>) => {
    setSlidingOutId(id);
    setTimeout(async () => {
      try {
        await action();
        await fetchPedidos();
      } catch (error) {
        console.error('Error al procesar la acción:', error);
      } finally {
        setSlidingOutId(null);
      }
    }, 500);
  };

  const handleActualizarEstado = (id: number) => {
    createDelayedAction(id, () => actualizarEstadoPedido(id));
  };

  const handleGuardarPedido = async (pedidoData: any) => {
    try {
      await crearPedido(pedidoData);
      setSnackbar({ open: true, message: 'Pedido creado con éxito.', severity: 'success' });
      fetchPedidos();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al crear el pedido.', severity: 'error' });
    }
  };
  
  const handleOpenBajaConfirm = (id: number) => {
    setPedidoParaBaja(id);
    setBajaConfirmOpen(true);
  };
  
  const handleConfirmarBaja = async () => {
    if (pedidoParaBaja) {
      handleCloseBajaConfirm();
      createDelayedAction(pedidoParaBaja, async () => {
          await darDeBajaPedido(pedidoParaBaja);
          setSnackbar({ open: true, message: 'Pedido dado de baja.', severity: 'success' });
      });
    }
  };

  const handleCloseBajaConfirm = () => {
    setPedidoParaBaja(null);
    setBajaConfirmOpen(false);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'nombreCliente', headerName: 'Cliente', flex: 1, minWidth: 150, valueGetter: (value) => value || '' },
    { field: 'direccion', headerName: 'Dirección', flex: 1, minWidth: 200, valueGetter: (value) => value || 'Retira en local' },
    { field: 'fechaHora', headerName: 'Fecha', width: 180, valueFormatter: (value) => new Date(value).toLocaleString('es-AR') },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box>
          {params.row.estado !== 'Completado' ? (
            <Button
              variant="contained"
              size="small"
              endIcon={<NavigateNextIcon />}
              onClick={() => handleActualizarEstado(params.row.id)}
            >
              {params.row.estado === 'Pendiente' ? 'A Proceso' : 'Completar'}
            </Button>
          ) : (
            <IconButton color="error" onClick={() => handleOpenBajaConfirm(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const renderContent = () => {
    if (isMobile) {
      return (
        <Box sx={{ mt: 3, overflow: 'hidden' }}>
          {pedidos.map(pedido => (
            <Slide direction="left" in={slidingOutId !== pedido.id} timeout={500} key={pedido.id}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Pedido #{pedido.id}</Typography>
                    <Chip label={pedido.direccion ? 'Delivery' : 'Retira'} color={pedido.direccion ? 'primary' : 'secondary'} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(pedido.fechaHora).toLocaleDateString('es-AR')}
                  </Typography>
                  {pedido.nombreCliente && <Typography variant="body1" sx={{ mb: 1 }}>{pedido.nombreCliente}</Typography>}
                  <Typography variant="body2" color="text.secondary">{pedido.direccion || 'Retira en local'}</Typography>
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
          {pedidos.length === 0 && !loading && <Typography align="center" sx={{p: 3}}>No hay pedidos que coincidan con los filtros.</Typography>}
        </Box>
      );
    }

    return (
       <Paper sx={{ height: '70vh', width: '100%', mt: 3,
        '& .row-sliding-out': {
            transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
            transform: 'translateX(100%)',
            opacity: 0,
        }
       }}>
        <DataGrid
          rows={pedidos}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          pageSizeOptions={[5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          disableRowSelectionOnClick
          getRowClassName={(params) => slidingOutId === params.id ? 'row-sliding-out' : ''}
        />
       </Paper>
    );
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Pedidos</Typography>
        <Box sx={{display: 'flex', gap: 2}}>
            <FilterMenu onFilterChange={setFilters} />
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
        <DialogContent><DialogContentText>¿Estás seguro de que quieres dar de baja este pedido?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBajaConfirm}>Cancelar</Button>
          <Button onClick={handleConfirmarBaja} color="error">Dar de Baja</Button>
        </DialogActions>
      </Dialog>
      
      {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(null)}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}
    </Box>
  );
}