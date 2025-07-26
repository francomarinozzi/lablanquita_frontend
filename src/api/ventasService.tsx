import apiClient from './axiosConfig';
import { Venta, VentaParaCrear } from '../types';

const ventasEndpoint = '/ventas';

export const crearVenta = async (ventaData: VentaParaCrear): Promise<Venta> => {
  try {
    const response = await apiClient.post<Venta>(ventasEndpoint, ventaData);
    return response.data;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw new Error('Error al registrar la venta');
  }
};

export const getVentas = async (): Promise<Venta[]> => {
  try {
    const response = await apiClient.get<Venta[]>(ventasEndpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw new Error('Error al obtener las ventas');
  }
};

export const darDeBajaVenta = async (id: number): Promise<void> => {
  try {
    await apiClient.patch(`${ventasEndpoint}/${id}/baja`);
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw new Error('Error al dar de baja la venta');
  }
};