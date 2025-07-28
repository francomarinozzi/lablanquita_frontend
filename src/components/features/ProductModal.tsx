import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControlLabel, Switch, Box, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Producto, OPCIONES_UNIDAD_MEDIDA } from '../../types';
import { createProduct, updateProduct } from '../../api/productsService'; // <-- LLAMARÁ A LA API DIRECTAMENTE

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSaveSuccess: () => void; // <-- NUEVO PROP PARA NOTIFICAR ÉXITO
  productToEdit?: Producto | null;
}

type FormValues = Omit<Producto, 'id' | 'activo'>; 

export default function ProductModal({ open, onClose, onSaveSuccess, productToEdit }: ProductModalProps) {
  const [error, setError] = React.useState<string | null>(null); // <-- ESTADO PARA EL ERROR INTERNO
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      nombre: '',
      precio: 0,
      en_stock: true,
      unidadMedida: 'unidad'
    }
  });

  React.useEffect(() => {
    if (open) {
      setError(null); // Limpia el error al abrir el modal
      if (productToEdit) {
        reset(productToEdit);
      } else {
        reset({
          nombre: '',
          precio: 0,
          en_stock: true,
          unidadMedida: 'unidad'
        });
      }
    }
  }, [productToEdit, open, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError(null);
    try {
      const productData = {
        ...data,
        precio: Number(data.precio),
      };

      if (productToEdit) {
        await updateProduct(productToEdit.id, productData);
      } else {
        await createProduct(productData as Omit<Producto, 'id' | 'activo'>);
      }
      onSaveSuccess(); // Notifica a la página padre que todo salió bien
      onClose();

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Producto"
            fullWidth
            {...register('nombre', { required: 'El nombre es obligatorio' })}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
          />
          <TextField
            margin="dense"
            label="Precio"
            type="number"
            fullWidth
            InputProps={{ startAdornment: '$' }}
            {...register('precio', {
              required: 'El precio es obligatorio',
              valueAsNumber: true,
              min: { value: 0, message: 'El precio no puede ser negativo' }
            })}
            error={!!errors.precio}
            helperText={errors.precio?.message}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Unidad de Medida</InputLabel>
            <Controller
              name="unidadMedida"
              control={control}
              defaultValue="unidad"
              render={({ field }) => (
                <Select {...field} label="Unidad de Medida">
                  {OPCIONES_UNIDAD_MEDIDA.map(unit => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
          <Controller
            name="en_stock"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="En stock"
                sx={{ mt: 1 }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Guardar</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}