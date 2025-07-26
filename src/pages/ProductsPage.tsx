import * as React from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
  useMediaQuery, Card, CardContent, CardActions, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Producto } from '../types';
import { createProduct, getProducts, deleteProduct, updateProduct } from '../api/productsService';
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

  // Handlers for Modal
  const handleOpenModal = (product: Producto | null = null) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = async (data: Omit<Producto, 'id'> | Producto) => {
    try {
      if ('id' in data) {

        await updateProduct(data.id, data);
      } else {

        await createProduct(data);
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell align="right">Precio</TableCell>
            <TableCell>En Stock</TableCell>
            <TableCell>Unidad</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.nombre}</TableCell>
              <TableCell align="right">${product.precio.toLocaleString('es-AR')}</TableCell>
              <TableCell>{product.enStock ? 'Sí' : 'No'}</TableCell>
              <TableCell>{product.unitOfMeasure}</TableCell>
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
            <Typography>En Stock: {product.enStock ? 'Sí' : 'No'}</Typography>
            <Typography>Unidad: {product.unitOfMeasure}</Typography>
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
