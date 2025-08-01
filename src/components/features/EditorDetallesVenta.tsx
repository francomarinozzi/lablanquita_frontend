import * as React from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Autocomplete, TextField,
  InputAdornment, useMediaQuery, Card, CardContent, CardActions, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Producto, UnidadDeMedida } from '../../types';
import { getProducts } from '../../api/productsService';
import ProductModal from './ProductModal';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface DetalleVentaState {
  producto: { id: number };
  cantidad: number | string;
  nombre: string;
  precioUnitario: number;
  unidadMedida: UnidadDeMedida;
}

interface EditorDetallesVentaProps {
  onDetallesChange: (detalles: DetalleVentaState[], total: number) => void;
  onSaveProductSuccess: () => void;
  initialDetalles?: DetalleVentaState[];
}

export default function EditorDetallesVenta({ onDetallesChange, onSaveProductSuccess, initialDetalles = [] }: EditorDetallesVentaProps) {
  const [productosDisponibles, setProductosDisponibles] = React.useState<Producto[]>([]);
  const [detalles, setDetalles] = React.useState<DetalleVentaState[]>(initialDetalles);
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cargarProductos = React.useCallback(async () => {
    try {
      const productos = await getProducts();
      setProductosDisponibles(productos.filter(p => p.activo && p.en_stock));
    } catch (err) {
      console.error('No se pudieron cargar los productos.', err);
    }
  }, []);

  React.useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const getCantidadNumerica = (cantidad: number | string): number => {
    if (typeof cantidad === 'string' && cantidad.trim() === '') return 0;
    return Number(cantidad);
  }

  const calcularSubtotal = (item: DetalleVentaState): number => {
    const cantidad = getCantidadNumerica(item.cantidad);
    if (item.unidadMedida === 'kg') return item.precioUnitario * cantidad;
    if (item.unidadMedida === 'g') return item.precioUnitario * (cantidad / 100);
    if (item.unidadMedida === 'docena') return (item.precioUnitario / 12) * cantidad;
    return item.precioUnitario * cantidad;
  };
  
  React.useEffect(() => {
    const detallesNumericos = detalles.map(d => ({...d, cantidad: getCantidadNumerica(d.cantidad)}));
    const total = detallesNumericos.reduce((sum, item) => sum + calcularSubtotal(item), 0);
    onDetallesChange(detallesNumericos, total);
  }, [detalles, onDetallesChange]);
  
  const handleAgregarProducto = (producto: Producto | null) => {
    if (!producto || detalles.find(d => d.producto.id === producto.id)) return;
    const esPorUnidad = producto.unidadMedida === 'unidad' || producto.unidadMedida === 'docena';
    setDetalles([...detalles, {
      producto: { id: producto.id },
      cantidad: esPorUnidad ? 1 : '',
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      unidadMedida: producto.unidadMedida,
    }]);
  };

  const handleCantidadChange = (idProducto: number, cantidad: number | string) => {
    setDetalles(detalles.map(d => d.producto.id === idProducto ? { ...d, cantidad: cantidad } : d));
  };
  
  const handleCantidadBlur = (idProducto: number, cantidad: number | string) => {
      const cantidadNumerica = getCantidadNumerica(cantidad);
       setDetalles(detalles.map(d => d.producto.id === idProducto ? { ...d, cantidad: cantidadNumerica } : d));
  }
  
  const handleIncrement = (item: DetalleVentaState) => {
    const cantidadActual = getCantidadNumerica(item.cantidad);
    handleCantidadChange(item.producto.id, cantidadActual + 1);
  }

  const handleDecrement = (item: DetalleVentaState) => {
    const cantidadActual = getCantidadNumerica(item.cantidad);
    const nuevaCantidad = cantidadActual - 1;
    if (nuevaCantidad <= 0) {
        handleEliminarProducto(item.producto.id);
    } else {
        handleCantidadChange(item.producto.id, nuevaCantidad);
    }
  }

  const handleEliminarProducto = (idProducto: number) => {
    setDetalles(detalles.filter(d => d.producto.id !== idProducto));
  };
  
  const getPrecioReferenciaTexto = (item: DetalleVentaState): string => {
    const precio = item.precioUnitario.toLocaleString('es-AR');
    if (item.unidadMedida === 'g') return `$${precio} / 100g`;
    return `$${precio} / ${item.unidadMedida}`;
  }

  const renderCeldaCantidad = (item: DetalleVentaState) => {
    if (item.unidadMedida === 'kg' || item.unidadMedida === 'g') {
        return <TextField type="number" value={item.cantidad} onBlur={() => handleCantidadBlur(item.producto.id, item.cantidad)} onChange={(e) => handleCantidadChange(item.producto.id, e.target.value)} sx={{ width: '140px' }} InputProps={{ endAdornment: <InputAdornment position="end">{item.unidadMedida}</InputAdornment> }} inputProps={{ step: "0.001", min: "0" }} />;
    }
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconButton size="small" onClick={() => handleDecrement(item)}><RemoveCircleOutlineIcon /></IconButton><Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>{getCantidadNumerica(item.cantidad)}</Typography><IconButton size="small" onClick={() => handleIncrement(item)}><AddCircleOutlineIcon /></IconButton></Box>;
  };
  
  const renderDesktopTable = () => (
     <TableContainer><Table><TableHead><TableRow><TableCell sx={{ width: '35%' }}>Producto</TableCell><TableCell align="right">Precio Referencia</TableCell><TableCell align="center" sx={{ width: '25%' }}>Cantidad</TableCell><TableCell align="right">Subtotal</TableCell><TableCell align="center">Quitar</TableCell></TableRow></TableHead><TableBody>{detalles.map((item) => (<TableRow key={item.producto.id}><TableCell>{item.nombre}</TableCell><TableCell align="right">{getPrecioReferenciaTexto(item)}</TableCell><TableCell align="center">{renderCeldaCantidad(item)}</TableCell><TableCell align="right">${calcularSubtotal(item).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell align="center"><IconButton color="error" onClick={() => handleEliminarProducto(item.producto.id)}><DeleteIcon /></IconButton></TableCell></TableRow>))}</TableBody></Table></TableContainer>
  );

  const renderMobileList = () => (
    <Box>{detalles.map(item => (<Card key={item.producto.id} sx={{ mb: 2 }}><CardContent><Typography variant="h6">{item.nombre}</Typography><Typography variant="body2" color="text.secondary">{getPrecioReferenciaTexto(item)}</Typography><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}><Typography>Cantidad:</Typography>{renderCeldaCantidad(item)}</Box><Divider /><Typography variant="h6" align="right" sx={{ mt: 2 }}>Subtotal: ${calcularSubtotal(item).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Typography></CardContent><CardActions sx={{justifyContent: 'flex-end'}}><Button color="error" startIcon={<DeleteIcon />} onClick={() => handleEliminarProducto(item.producto.id)}>Quitar</Button></CardActions></Card>))}</Box>
  );

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{display: 'flex', gap: 2, alignItems: 'center', mb: 3}}>
          <Autocomplete options={productosDisponibles} getOptionLabel={(option) => { const precioRef = option.unidadMedida === 'g' ? '100g' : option.unidadMedida; return `${option.nombre} - $${option.precio.toLocaleString('es-AR')} por ${precioRef}`; }} onChange={(event, value) => handleAgregarProducto(value)} renderInput={(params) => <TextField {...params} label="Buscar y agregar producto" />} sx={{ flexGrow: 1 }} value={null} isOptionEqualToValue={(option, value) => option.id === value.id} />
          <Button variant="outlined" onClick={() => setIsProductModalOpen(true)} sx={{py: '15px'}} aria-label="Agregar nuevo producto"><AddIcon /></Button>
      </Box>
      {isMobile ? renderMobileList() : renderDesktopTable()}
      {detalles.length === 0 && (<Typography align="center" sx={{ my: 4, color: 'text.secondary' }}>Aún no hay productos.</Typography>)}
      <ProductModal open={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSaveSuccess={() => { cargarProductos(); onSaveProductSuccess(); }} />
    </Paper>
  );
}