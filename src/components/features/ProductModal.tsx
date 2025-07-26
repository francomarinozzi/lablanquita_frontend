import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControlLabel, Switch, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { Product, UNIT_OF_MEASURE_OPTIONS } from '../../types';


interface ProductModalProps {
  open: boolean;
  onClose: () => void;

  onSave: (data: Omit<Product, 'id'> | Product) => void;
  productToEdit?: Product | null;
}


type FormValues = Omit<Product, 'id' | 'activo'>; 

export default function ProductModal({ open, onClose, onSave, productToEdit }: ProductModalProps) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    
    defaultValues: {
      nombre: '',
      precio: 0,
      enStock: true,
      unidad_medida: 'unidad'
    }
  });

  
  React.useEffect(() => {
    if (open) {
      if (productToEdit) {
  
        reset(productToEdit);
      } else {
  
        reset({
          nombre: '',
          precio: 0,
          enStock: true,
          unidad_medida: 'unidad'
        });
      }
    }
  }, [productToEdit, open, reset]);

  
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const productData = {
      ...data,
      precio: Number(data.price), 
      activo: true, 
    };

    if (productToEdit) {
      
      onSave({ id: productToEdit.id, ...productData });
    } else {
      
      onSave(productData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Producto"
            fullWidth
            {...register('nombre', { required: 'El nombre es obligatorio' })}
            error={!!errors.name}
            helperText={errors.name?.message}
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
            error={!!errors.price}
            helperText={errors.price?.message}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Unidad de Medida</InputLabel>
            <Controller
              name="unidad_medida"
              control={control}
              defaultValue="unidad"
              render={({ field }) => (
                <Select {...field} label="Unidad de Medida">
                  
                  {UNIT_OF_MEASURE_OPTIONS.map(unit => (
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
