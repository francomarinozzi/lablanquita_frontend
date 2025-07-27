import * as React from 'react';
import {
  Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Box, Stepper, Step,
  StepLabel, Button, TextField, Autocomplete, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, InputAdornment, ToggleButtonGroup, ToggleButton,
  Snackbar, Alert, Paper, Grid, useMediaQuery
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { Producto, UnidadDeMedida, VentaParaCrear } from '../../types';
import { getProducts } from '../../api/productsService';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

interface DetalleEnVenta {
  producto: { id: number };
  cantidad: number;
  nombre: string;
  precioUnitario: number;
  unidadMedida: UnidadDeMedida;
}

interface NuevoPedidoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (pedidoData: any) => Promise<void>;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const steps = ['Datos del Cliente', 'Armado del Pedido', 'Confirmación'];

export default function NuevoPedidoModal({ open, onClose, onSave }: NuevoPedidoModalProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [productosDisponibles, setProductosDisponibles] = React.useState<Producto[]>([]);
  const [detalles, setDetalles] = React.useState<DetalleEnVenta[]>([]);
  const [formaPago, setFormaPago] = React.useState<string>('Efectivo');
  const [datosCliente, setDatosCliente] = React.useState({ nombreCliente: '', direccion: '' });
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (open) {
      const cargarProductos = async () => {
        try {
          const productos = await getProducts();
          setProductosDisponibles(productos.filter(p => p.activo && p.en_stock));
        } catch (err) {
          console.error('No se pudieron cargar los productos.');
        }
      };
      cargarProductos();
    }
  }, [open]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!datosCliente.nombreCliente && !datosCliente.direccion) {
        setSnackbar({ open: true, message: 'Debe ingresar un nombre o una dirección.', severity: 'error' });
        return;
      }
    }
    if (activeStep === 1) {
        if (detalles.length === 0 || detalles.some(d => d.cantidad <= 0)) {
            setSnackbar({ open: true, message: 'Agregue productos y cantidades válidas.', severity: 'error' });
            return;
        }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  
  const handleResetAndClose = () => {
      setActiveStep(0);
      setDetalles([]);
      setFormaPago('Efectivo');
      setDatosCliente({ nombreCliente: '', direccion: '' });
      onClose();
  }

  const handleSave = async () => {
    const venta: VentaParaCrear = {
      formaPago: formaPago,
      detalles: detalles.map((item) => {
        let cantidadParaEnviar = item.cantidad;
        if (item.unidadMedida === 'g') {
          cantidadParaEnviar = item.cantidad / 100;
        }
        return {
          producto: { id: item.producto.id },
          cantidad: cantidadParaEnviar,
        };
      }),
    };

    const pedidoData = { ...datosCliente, venta };
    await onSave(pedidoData);
    handleResetAndClose();
  };
  
  const calcularSubtotal = (item: DetalleEnVenta): number => {
    if (item.unidadMedida === 'kg') return item.precioUnitario * item.cantidad;
    if (item.unidadMedida === 'g') return item.precioUnitario * (item.cantidad / 100);
    return item.precioUnitario * item.cantidad;
  };
  
  const totalPedido = React.useMemo(() => {
    return detalles.reduce((total, item) => total + calcularSubtotal(item), 0);
  }, [detalles]);

  const handleAgregarProducto = (producto: Producto | null) => {
    if (!producto) return;
    const productoExistente = detalles.find(d => d.producto.id === producto.id);
    if (!productoExistente) {
      setDetalles([...detalles, {
        producto: { id: producto.id },
        cantidad: producto.unidadMedida === 'unidad' ? 1 : 0,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        unidadMedida: producto.unidadMedida,
      }]);
    }
  };

  const handleCantidadChange = (idProducto: number, cantidad: number) => {
    const item = detalles.find(d => d.producto.id === idProducto);
    if (item && item.unidadMedida !== 'unidad' && cantidad < 0) return;
    if (cantidad <= 0 && item?.unidadMedida === 'unidad') {
      handleEliminarProducto(idProducto);
      return;
    }
    setDetalles(detalles.map(d => d.producto.id === idProducto ? { ...d, cantidad } : d));
  };
  
  const handleEliminarProducto = (idProducto: number) => {
    setDetalles(detalles.filter(d => d.producto.id !== idProducto));
  };

  const renderCeldaCantidad = (item: DetalleEnVenta) => {
    if (item.unidadMedida === 'kg' || item.unidadMedida === 'g') {
      return (<TextField type="number" value={item.cantidad} onChange={(e) => handleCantidadChange(item.producto.id, parseFloat(e.target.value) || 0)} sx={{ width: '140px' }} InputProps={{ endAdornment: <InputAdornment position="end">{item.unidadMedida}</InputAdornment> }} inputProps={{ step: item.unidadMedida === 'kg' ? "0.001" : "1", min: "0" }} />);
    }
    return (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconButton size="small" onClick={() => handleCantidadChange(item.producto.id, item.cantidad - 1)}><RemoveCircleOutlineIcon /></IconButton><Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</Typography><IconButton size="small" onClick={() => handleCantidadChange(item.producto.id, item.cantidad + 1)}><AddCircleOutlineIcon /></IconButton></Box>);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{p: 2, maxWidth: '600px', mx: 'auto'}}>
            <Typography variant="h6" gutterBottom>Datos del Cliente</Typography>
            <TextField label="Nombre del Cliente (opcional)" value={datosCliente.nombreCliente} onChange={(e) => setDatosCliente({...datosCliente, nombreCliente: e.target.value})} fullWidth margin="normal" />
            <TextField label="Dirección (opcional)" value={datosCliente.direccion} onChange={(e) => setDatosCliente({...datosCliente, direccion: e.target.value})} fullWidth margin="normal" />
             <Typography variant="caption" color="text.secondary">
              Debe completar al menos uno de los dos campos para continuar.
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{p: {xs: 0, sm: 2}}}>
            <Autocomplete options={productosDisponibles} getOptionLabel={(option) => `${option.nombre} - $${option.precio.toLocaleString('es-AR')} por ${option.unidadMedida}`} onChange={(event, value) => handleAgregarProducto(value)} renderInput={(params) => <TextField {...params} label="Buscar y agregar producto" />} sx={{ mb: 3 }} value={null} isOptionEqualToValue={(option, value) => option.id === value.id} />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead><TableRow><TableCell>Producto</TableCell><TableCell align="center">Cantidad</TableCell><TableCell align="right">Subtotal</TableCell><TableCell align="center">Quitar</TableCell></TableRow></TableHead>
                    <TableBody>
                        {detalles.map((item) => (<TableRow key={item.producto.id}><TableCell>{item.nombre}</TableCell><TableCell align="center">{renderCeldaCantidad(item)}</TableCell><TableCell align="right">${calcularSubtotal(item).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell align="center"><IconButton color="error" onClick={() => handleEliminarProducto(item.producto.id)}><DeleteIcon /></IconButton></TableCell></TableRow>))}
                    </TableBody>
                </Table>
            </TableContainer>
          </Box>
        );
      case 2:
        return (
            <Box sx={{p: {xs: 0, sm: 2}}}>
                <Typography variant="h6" gutterBottom>Confirmar Pedido</Typography>
                <Paper variant="outlined" sx={{p: 2, mb: 2}}>
                    <Typography gutterBottom><strong>Cliente:</strong> {datosCliente.nombreCliente || 'No especificado'}</Typography>
                    <Typography><strong>Dirección:</strong> {datosCliente.direccion || 'Retira en local'}</Typography>
                </Paper>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead><TableRow><TableCell>Producto</TableCell><TableCell align="right">Cant.</TableCell><TableCell align="right">Subtotal</TableCell></TableRow></TableHead>
                        <TableBody>
                            {detalles.map((item) => (<TableRow key={item.producto.id}><TableCell>{item.nombre}</TableCell><TableCell align="right">{item.cantidad.toLocaleString('es-AR')}{item.unidadMedida !== 'unidad' ? item.unidadMedida : ''}</TableCell><TableCell align="right">${calcularSubtotal(item).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                    <Grid item xs={12} md={6}>
                        <ToggleButtonGroup color="primary" value={formaPago} exclusive onChange={(e, v) => v && setFormaPago(v)} fullWidth>
                            <ToggleButton value="Efectivo">Efectivo</ToggleButton>
                            <ToggleButton value="Tarjeta">Tarjeta</ToggleButton>
                            <ToggleButton value="Transferencia">Transferencia</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{textAlign: {xs: 'left', md: 'right'}}}>
                        <Typography variant="h5" fontWeight="bold">Total: ${totalPedido.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Grid>
                </Grid>
            </Box>
        );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={handleResetAndClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}><Toolbar><IconButton edge="start" color="inherit" onClick={handleResetAndClose}><CloseIcon /></IconButton><Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">Nuevo Pedido</Typography></Toolbar></AppBar>
      <Box sx={{ p: {xs: 2, sm: 3} }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }} orientation={useMediaQuery((theme) => theme.breakpoints.down('sm')) ? 'vertical' : 'horizontal'}>
          {steps.map(label => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>Atrás</Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSave}>Guardar Pedido</Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>Siguiente</Button>
          )}
        </Box>
      </Box>
      {snackbar && (<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>)}
    </Dialog>
  );
}