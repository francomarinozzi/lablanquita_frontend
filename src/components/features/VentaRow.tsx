import * as React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, IconButton, Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { Venta } from '../../types';

interface VentaRowProps {
  venta: Venta;
  onBajaClick: (id: number) => void;
}

export default function VentaRow({ venta, onBajaClick }: VentaRowProps) {
  const [open, setOpen] = React.useState(false);

  const calcularSubtotal = (cantidad: number, precio: number): number => {
    return cantidad * precio;
  }

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          #{venta.id}
        </TableCell>
        <TableCell>{new Date(venta.fechaHora).toLocaleString('es-AR')}</TableCell>
        <TableCell>{venta.formaPago}</TableCell>
        <TableCell align="right">${venta.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</TableCell>
        <TableCell align="center">
          <IconButton color="error" onClick={() => onBajaClick(venta.id)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalle de la Venta
              </Typography>
              <Table size="small" aria-label="purchases">
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
                        ${calcularSubtotal(detalle.cantidad, detalle.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}