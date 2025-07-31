import * as React from 'react';
import { Button, Menu, Typography, TextField, Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';


interface Filters {
  nombreCliente?: string;
  fecha?: string; 
}

interface FilterMenuProps {
  onFilterChange: (filters: Filters) => void;
}

export default function FilterMenu({ onFilterChange }: FilterMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [filters, setFilters] = React.useState<Filters>({});

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // Solo enviamos los filtros que tienen valor
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) {
        acc[key as keyof Filters] = value;
      }
      return acc;
    }, {} as Filters);
    onFilterChange(activeFilters);
    handleClose();
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
    handleClose();
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={handleClick}
      >
        Filtros
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { p: 2, width: '300px' } }}
      >
        <Typography variant="subtitle1" gutterBottom>Filtrar Pedidos</Typography>
        <TextField
          label="Nombre del Cliente"
          name="nombreCliente"
          variant="outlined"
          fullWidth
          size="small"
          value={filters.nombreCliente || ''}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
        />
 
        <TextField
          label="Fecha"
          name="fecha"
          type="date"
          variant="outlined"
          fullWidth
          size="small"
          value={filters.fecha || ''}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Button onClick={handleClearFilters} size="small">Limpiar</Button>
          <Button onClick={handleApplyFilters} variant="contained" size="small">Aplicar</Button>
        </Box>
      </Menu>
    </Box>
  );
}