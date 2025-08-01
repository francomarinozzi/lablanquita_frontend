import * as React from 'react';
import { Button, Menu, Typography, TextField, Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number';
}

interface FilterMenuProps {
  onFilterChange: (filters: Record<string, any>) => void;
  filterFields: FilterField[];
}

export default function FilterMenu({ onFilterChange, filterFields }: FilterMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [filters, setFilters] = React.useState<Record<string, any>>({});

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
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
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
        <Typography variant="subtitle1" gutterBottom>Filtrar por</Typography>
        {filterFields.map(field => (
          <TextField
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type}
            variant="outlined"
            fullWidth
            size="small"
            value={filters[field.name] || ''}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Button onClick={handleClearFilters} size="small">Limpiar</Button>
          <Button onClick={handleApplyFilters} variant="contained" size="small">Aplicar</Button>
        </Box>
      </Menu>
    </Box>
  );
}