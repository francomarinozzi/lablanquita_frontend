import apiClient from './axiosConfig'; 
import type { Producto } from '../types';
import { AxiosError } from 'axios';

const productsEndpoint = '/productos';

export const getProducts = async (): Promise<Producto[]> => {
  try {
    const response = await apiClient.get<Producto[]>(productsEndpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Error al obtener los productos');
  }
};

export const createProduct = async (productData: Omit<Producto, 'id' | 'activo'>): Promise<Producto> => {
  try {
    const response = await apiClient.post<Producto>(productsEndpoint, productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
    throw new Error('Error al crear el producto');
  }
};

export const updateProduct = async (productId: number, productData: Partial<Producto>): Promise<Producto> => {
    try {
        const response = await apiClient.put<Producto>(`${productsEndpoint}/${productId}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error('Error al actualizar el producto');
    }
};

export const deleteProduct = async (productId: number): Promise<void> => {
    try {
        await apiClient.patch(`${productsEndpoint}/${productId}/baja`);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error('Error al dar de baja el producto');
    }
};

export const updateProductStock = async (productId: number): Promise<Producto> => {
  try {
    const response = await apiClient.patch<Producto>(`${productsEndpoint}/${productId}/stock`);
    return response.data;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw new Error('Error al actualizar el stock del producto');
  }
};