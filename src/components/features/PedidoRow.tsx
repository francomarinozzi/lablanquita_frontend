import * as React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, IconButton, Chip, Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import { Pedido } from '../../types';

interface PedidoRowProps {
  pedido: Pedido;
  onUpdateStatus: (id: number) => void;
  onBajaClick: (id: number) => void;
  isSlidingOut: boolean;
}

export default function PedidoRow({ pedido, onUpdateStatus, onBajaClick, isSlidingOut }: PedidoRowProps) {
  const [open, setOpen] = React.useState(false);

  const rowStyle = {
    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
    transform: isSlidingOut ? 'translateX(100%)' : 'translateX(0)',
    opacity: isSlidingOut ? 0 : 1,
  };

  return (
    <React.Fragment>
      <TableRow sx={rowStyle}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">#{pedido.id}</TableCell>
        <TableCell>{pedido.nombreCliente}</TableCell>
        <TableCell><Chip label={pedido.direccion ? 'Delivery' : 'Retira'} color={pedido.direccion ? 'primary' : 'secondary'} size="small" /></TableCell>
        <TableCell>{new Date(pedido.fechaHora).toLocaleDateString('es-AR')}</TableCell>
        <TableCell align="center">
          {pedido.estado === 'Completado' ? (
            <IconButton color="error" onClick={() => onBajaClick(pedido.id)}>
              <DeleteIcon />
            </IconButton>
          ) : (
             <Button 
                variant="contained" 
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => onUpdateStatus(pedido.id)}
            >
                {pedido.estado === 'Pendiente' ? 'A "En Proceso"' : 'Completar'}
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0, border: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1, padding: 2, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom component="div">Detalle del Pedido</Typography>
              {pedido.direccion && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Dirección:</strong> {pedido.direccion}
                  </Typography>
              )}
              <Table size="small">
                  <TableHead>
                    <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Cantidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {pedido.detalles.map((detalle, index) => (
                      <TableRow key={index}>
                        <TableCell>{detalle.nombreProducto}</TableCell>
                        <TableCell align="center">{detalle.cantidad}</TableCell>
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