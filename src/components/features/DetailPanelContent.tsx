import * as React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Divider
} from '@mui/material';
import { Pedido } from '../../types';

interface DetailPanelProps {
  row: Pedido;
  isMobile?: boolean;
}

export default function DetailPanelContent({ row, isMobile = false }: DetailPanelProps) {
  
  // Vista Móvil: Una lista simple y adaptable
  if (isMobile) {
    return (
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{mb: 1}}>Detalle:</Typography>
        {row.detalles.map((detalle, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2">{detalle.nombreProducto}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
              <Typography variant="body2">
                {detalle.cantidad.toLocaleString('es-AR')} x ${detalle.precioUnitario.toLocaleString('es-AR')}
              </Typography>
              <Typography variant="body2">
                ${(detalle.cantidad * detalle.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        ))}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Total:</Typography>
            <Typography variant="h6" fontWeight="bold">
                ${row.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Typography>
        </Box>
      </Box>
    );
  }

  // Vista de Escritorio: La tabla completa
  return (
    <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
      <Typography variant="h6" gutterBottom component="div">
        Detalle del Pedido #{row.id}
      </Typography>
      {row.direccion && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Dirección:</strong> {row.direccion}
        </Typography>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell align="right">Precio Unit.</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {row.detalles.map((detalle, index) => (
              <TableRow key={index}>
                <TableCell>{detalle.nombreProducto}</TableCell>
                <TableCell align="center">{detalle.cantidad.toLocaleString('es-AR')}</TableCell>
                <TableCell align="right">${detalle.precioUnitario.toLocaleString('es-AR')}</TableCell>
                <TableCell align="right">
                  ${(detalle.cantidad * detalle.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
             <TableRow sx={{ '& > *': { borderTop: '2px solid rgba(224, 224, 224, 1)' } }}>
                <TableCell colSpan={2} />
                <TableCell align="right"><strong>Total:</strong></TableCell>
                <TableCell align="right">
                    <strong>${row.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
                </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}