import apiClient from './axiosConfig';
import type { Venta, VentaParaCrear, PaginatedResponse } from '../types';


const ventasEndpoint = '/ventas';

interface ventaFilters {
  id?: number;
  fecha?: string;
  page?: number;
  size?: number;
}

export const getVentasPaginadas = async (filters: ventaFilters = {}): Promise<PaginatedResponse<Venta>> => {
  try {
    const params: { [key: string]: any } = {
      page: filters.page ?? 0,
      size: filters.size ?? 10,
    };

    if (filters.id) params.id = filters.id;
    if (filters.fecha) params.fecha = filters.fecha;
    
  
    const response = await apiClient.get<PaginatedResponse<Venta>>(`${ventasEndpoint}/filter`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener las ventas paginadas:', error);
    throw new Error('Error al obtener las ventas');
  }
};

export const crearVenta = async (ventaData: VentaParaCrear): Promise<Venta> => {
  try {
    const response = await apiClient.post<Venta>(ventasEndpoint, ventaData);
    return response.data;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw new Error('Error al registrar la venta');
  }
};

export const getAllVentas = async (): Promise<Venta[]> => {
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