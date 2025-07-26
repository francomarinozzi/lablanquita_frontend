import * as React from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
  useMediaQuery, Card, CardContent, CardActions, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Switch, FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Producto } from '../types';
import { createProduct, getProducts, deleteProduct, updateProduct, updateProductStock } from '../api/productsService';
import ProductModal from '../components/features/ProductModal';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Producto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [productToEdit, setProductToEdit] = React.useState<Producto | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [productToDeleteId, setProductToDeleteId] = React.useState<number | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = React.useMemo(() => {
    return products
      .filter(p => p.activo)
      .filter(p => p.nombre && p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const handleOpenModal = (product: Producto | null = null) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = async (data: Omit<Producto, 'id' | 'activo'> | Producto) => {
    try {
      if ('id' in data && data.id) {
        await updateProduct(data.id, data);
      } else {
        await createProduct(data as Omit<Producto, 'id' | 'activo'>);
      }
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el producto.');
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDeleteId(productId);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setProductToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId === null) return;
    try {
      await deleteProduct(productToDeleteId);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Error al dar de baja el producto');
    } finally {
      handleCloseConfirm();
    }
  };

  const handleToggleStock = async (productId: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, en_stock: !p.en_stock } : p
      )
    );
    try {
      await updateProductStock(productId);
    } catch (err) {
      setError('No se pudo actualizar el stock. Reintentando...');
      fetchProducts();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;

  const renderDesktopTable = () => (
    <TableContainer component={Paper}>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '40%' }}>Producto</TableCell>
            <TableCell sx={{ width: '15%' }} align="right">Precio</TableCell>
            <TableCell sx={{ width: '15%' }} align="center">En Stock</TableCell>
            <TableCell sx={{ width: '15%' }}>Unidad</TableCell>
            <TableCell sx={{ width: '15%' }} align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.nombre}
              </TableCell>
              <TableCell align="right">${product.precio.toLocaleString('es-AR')}</TableCell>
              <TableCell align="center">
                <Switch
                  checked={product.en_stock}
                  onChange={() => handleToggleStock(product.id)}
                  color="primary"
                />
              </TableCell>
              <TableCell>{product.unidadMedida}</TableCell>
              <TableCell align="center">
                <IconButton onClick={() => handleOpenModal(product)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDeleteClick(product.id)}><DeleteIcon color="error" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileList = () => (
    <Box>
      {filteredProducts.map((product) => (
        <Card key={product.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{product.nombre}</Typography>
            <Typography>Precio: ${product.precio.toLocaleString('es-AR')}</Typography>
            <Typography>Unidad: {product.unidadMedida}</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={product.en_stock}
                  onChange={() => handleToggleStock(product.id)}
                />
              }
              label="En Stock"
              sx={{ pt: 1 }}
            />
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button startIcon={<EditIcon />} onClick={() => handleOpenModal(product)}>Editar</Button>
            <Button startIcon={<DeleteIcon />} color="error" onClick={() => handleDeleteClick(product.id)}>Eliminar</Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Catálogo de productos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Nuevo Producto
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Buscar producto..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {isMobile ? renderMobileList() : renderDesktopTable()}

      {isModalOpen && (
        <ProductModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          productToEdit={productToEdit}
        />
      )}

      <Dialog
        open={isConfirmOpen}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>Confirmar baja</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres dar de baja este producto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Dar de baja
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}