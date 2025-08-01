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
import DetailPanelContent from './DetailPanelContent';

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
    '& > *': { borderBottom: 'unset' },
  };

  return (
    <React.Fragment>
      <TableRow sx={rowStyle}>
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
          #{pedido.id}
        </TableCell>
        <TableCell>{pedido.nombreCliente || ''}</TableCell>
        <TableCell>{pedido.direccion || 'Retira en local'}</TableCell>
        <TableCell>
            <Chip label={pedido.direccion ? 'Delivery' : 'Retira'} color={pedido.direccion ? 'primary' : 'secondary'} size="small" />
        </TableCell>
        <TableCell>{new Date(pedido.fechaHora).toLocaleDateString('es-AR')}</TableCell>
        <TableCell align="center">
          {pedido.estado !== 'Completado' ? (
             <Button 
                variant="contained" 
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => onUpdateStatus(pedido.id)}
            >
                {pedido.estado === 'Pendiente' ? 'A Proceso' : 'Completar'}
            </Button>
          ) : (
            <IconButton color="error" onClick={() => onBajaClick(pedido.id)}>
              <DeleteIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
              <DetailPanelContent row={pedido} />
          </Collapse>
          </TableCell>
      </TableRow>
    </React.Fragment>
  );
}