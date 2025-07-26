import * as React from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Autocomplete, TextField,
  ToggleButtonGroup, ToggleButton, Snackbar, Alert, InputAdornment,
  useMediaQuery, Card, CardContent, CardActions, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Producto, UnidadDeMedida } from '../types';
import { getProducts } from '../api/productsService';
import { crearVenta } from '../api/ventasService';
import { VentaParaCrear, DetalleVentaParaCrear } from '../types';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

interface DetalleEnVenta extends DetalleVentaParaCrear {
  nombre: string;
  precioUnitario: number;
  unidadMedida: UnidadDeMedida;
}

export default function NuevaVentaPage() {
  const [productosDisponibles, setProductosDisponibles] = React.useState<Producto[]>([]);
  const [detalles, setDetalles] = React.useState<DetalleEnVenta[]>([]);
  const [formaPago, setFormaPago] = React.useState<string | null>('Efectivo');
  const [error, setError] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  React.useEffect(() => {
    async function cargarProductos() {
      try {
        const productos = await getProducts();
        setProductosDisponibles(productos.filter(p => p.activo && p.en_stock));
      } catch (err) {
        setError('No se pudieron cargar los productos para la venta.');
      }
    }
    cargarProductos();
  }, []);

  const calcularSubtotal = (item: DetalleEnVenta): number => {
    if (item.unidadMedida === 'kg') {
      return item.precioUnitario * item.cantidad;
    }
    if (item.unidadMedida === 'g') {
      return item.precioUnitario * (item.cantidad / 100);
    }
    return item.precioUnitario * item.cantidad;
  };

  const handleAgregarProducto = (producto: Producto | null) => {
    if (!producto) return;

    const productoExistente = detalles.find(d => d.producto.id === producto.id);
    if (productoExistente) {
      if (producto.unidadMedida === 'unidad') {
        handleCantidadChange(producto.id, productoExistente.cantidad + 1);
      }
    } else {
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
    if (item && item.unidadMedida !== 'unidad' && cantidad < 0) {
      return;
    }
    if (cantidad <= 0 && item?.unidadMedida === 'unidad') {
      handleEliminarProducto(idProducto);
      return;
    }
    setDetalles(detalles.map(d => d.producto.id === idProducto ? { ...d, cantidad } : d));
  };

  const handleEliminarProducto = (idProducto: number) => {
    setDetalles(detalles.filter(d => d.producto.id !== idProducto));
  };

  const handleFormaPagoChange = (event: React.MouseEvent<HTMLElement>, nuevaFormaPago: string | null) => {
    if (nuevaFormaPago !== null) {
      setFormaPago(nuevaFormaPago);
    }
  };

  const totalVenta = React.useMemo(() => {
    return detalles.reduce((total, item) => total + calcularSubtotal(item), 0);
  }, [detalles]);

  const resetVenta = () => {
    setDetalles([]);
    setFormaPago('Efectivo');
  };

  const handleFinalizarVenta = async () => {
    if (detalles.length === 0 || detalles.some(d => d.cantidad <= 0)) {
        setSnackbar({ open: true, message: 'Agregue productos y cantidades válidas.', severity: 'error' });
        return;
    }
    if (!formaPago) {
      setSnackbar({ open: true, message: 'Seleccione una forma de pago.', severity: 'error' });
      return;
    }

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

    try {
      await crearVenta(venta);
      setSnackbar({ open: true, message: 'Venta registrada con éxito.', severity: 'success' });
      resetVenta();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al registrar la venta.', severity: 'error' });
      console.error(err);
    }
  };

  const getPrecioReferenciaTexto = (item: DetalleEnVenta): string => {
    const precio = item.precioUnitario.toLocaleString('es-AR');
    if (item.unidadMedida === 'g') {
        return `$${precio} / 100g`;
    }
    return `$${precio} / ${item.unidadMedida}`;
  }

  const renderCeldaCantidad = (item: DetalleEnVenta) => {
    if (item.unidadMedida === 'kg' || item.unidadMedida === 'g') {
      return (
        <TextField
          type="number"
          value={item.cantidad}
          onChange={(e) => handleCantidadChange(item.producto.id, parseFloat(e.target.value) || 0)}
          sx={{ width: '140px' }}
          InputProps={{
            endAdornment: <InputAdornment position="end">{item.unidadMedida}</InputAdornment>,
          }}
          inputProps={{
            step: item.unidadMedida === 'kg' ? "0.001" : "1",
            min: "0",
          }}
        />
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconButton size="small" onClick={() => handleCantidadChange(item.producto.id, item.cantidad - 1)}>
          <RemoveCircleOutlineIcon />
        </IconButton>
        <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</Typography>
        <IconButton size="small" onClick={() => handleCantidadChange(item.producto.id, item.cantidad + 1)}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>
    );
  };

  const renderDesktopTable = () => (
     <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '35%' }}>Producto</TableCell>
              <TableCell align="right">Precio Referencia</TableCell>
              <TableCell align="center" sx={{ width: '25%' }}>Cantidad</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="center">Quitar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalles.map((item) => (
              <TableRow key={item.producto.id}>
                <TableCell>{item.nombre}</TableCell>
                <TableCell align="right">{getPrecioReferenciaTexto(item)}</TableCell>
                <TableCell align="center">{renderCeldaCantidad(item)}</TableCell>
                <TableCell align="right">${calcularSubtotal(item).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => handleEliminarProducto(item.producto.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );

  const renderMobileList = () => (
    <Box>
      {detalles.map(item => (
        <Card key={item.producto.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{item.nombre}</Typography>
            <Typography variant="body2" color="text.secondary">{getPrecioReferenciaTexto(item)}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
              <Typography>Cantidad:</Typography>
              {renderCeldaCantidad(item)}
            </Box>
            <Divider />
            <Typography variant="h6" align="right" sx={{ mt: 2 }}>
              Subtotal: ${calcularSubtotal(item).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Typography>
          </CardContent>
          <CardActions sx={{justifyContent: 'flex-end'}}>
             <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleEliminarProducto(item.producto.id)}>
                Quitar
             </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Nueva Venta
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Autocomplete
          options={productosDisponibles}
          getOptionLabel={(option) => {
            const precioRef = option.unidadMedida === 'g' ? '100g' : option.unidadMedida;
            return `${option.nombre} - $${option.precio.toLocaleString('es-AR')} por ${precioRef}`;
          }}
          onChange={(event, value) => handleAgregarProducto(value)}
          renderInput={(params) => <TextField {...params} label="Buscar y agregar producto" />}
          sx={{ mb: 3 }}
          value={null}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        {isMobile ? renderMobileList() : renderDesktopTable()}
        {detalles.length === 0 && (
          <Typography align="center" sx={{ my: 4, color: 'text.secondary' }}>
            Aún no hay productos en la venta.
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: {xs: '100%', sm: 'auto'} }}>
            <Typography variant="h6">Forma de pago</Typography>
            <ToggleButtonGroup
              color="primary"
              value={formaPago}
              exclusive
              fullWidth={isMobile}
              onChange={handleFormaPagoChange}
            >
              <ToggleButton value="Efectivo">Efectivo</ToggleButton>
              <ToggleButton value="Débito">Débito</ToggleButton>
              <ToggleButton value="QR">QR</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ textAlign: 'right', width: {xs: '100%', sm: 'auto'} }}>
            <Typography variant="h5" component="div" fontWeight="bold">
              Total: ${totalVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 1 }}
              fullWidth={isMobile}
              onClick={handleFinalizarVenta}
              disabled={detalles.length === 0}
            >
              Finalizar Venta
            </Button>
          </Box>
        </Box>
      </Paper>
      
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