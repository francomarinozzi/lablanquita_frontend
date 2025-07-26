import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Box
} from '@mui/material';
import { Venta } from '../../types';

interface VentaDetalleModalProps {
  venta: Venta;
  open: boolean;
  onClose: () => void;
}

export default function VentaDetalleModal({ venta, open, onClose }: VentaDetalleModalProps) {
  
  const calcularSubtotal = (cantidad: number, precio: number): number => {
    return cantidad * precio;
  }
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6">
          Detalle de Venta #{venta.id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(venta.fechaHora).toLocaleString('es-AR')}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Cantidad</TableCell>
                <TableCell align="right">Precio Unitario</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {venta.detalles.map((detalle, index) => (
                <TableRow key={index}>
                  <TableCell>{detalle.nombreProducto}</TableCell>
                  <TableCell align="center">{detalle.cantidad.toLocaleString('es-AR')}</TableCell>
                  <TableCell align="right">${detalle.precioUnitario.toLocaleString('es-AR')}</TableCell>
                  <TableCell align="right">
                    ${calcularSubtotal(detalle.cantidad, detalle.precioUnitario)
                      .toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="body1">
                Forma de pago: <strong>{venta.formaPago}</strong>
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total: ${venta.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}