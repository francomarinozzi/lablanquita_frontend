import apiClient from './axiosConfig';
import { Pedido, PedidoParaCrear, PaginatedResponse } from '../types';

const pedidosEndpoint = '/pedidos';

interface PedidoFilters {
  nombreCliente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  page?: number;
  size?: number;
}


export const getPedidosPaginados = async (filters: PedidoFilters = {}): Promise<PaginatedResponse<Pedido>> => {
  try {
    
    const params = {
      page: filters.page || 0,
      size: filters.size || 10,
      nombreCliente: filters.nombreCliente || undefined,
      fechaDesde: filters.fechaDesde || undefined,
      fechaHasta: filters.fechaHasta || undefined,
      estado: filters.estado || undefined,
    };
    
    const response = await apiClient.get<PaginatedResponse<Pedido>>(`${pedidosEndpoint}/filter`, { params });
    console.log("➡️ Enviando GET /pedidos/filter con params:", params);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pedidos paginados:', error);
    throw new Error('Error al obtener los pedidos');
  }
};

// Función para traer TODOS los pedidos (para el Dashboard)
export const getAllPedidos = async (): Promise<Pedido[]> => {
    try {
        const response = await apiClient.get<Pedido[]>(pedidosEndpoint);
        return response.data;
    } catch (error) {
        console.error('Error al obtener todos los pedidos:', error);
        throw new Error('Error al obtener los pedidos');
    }
};

export const actualizarEstadoPedido = async (id: number): Promise<Pedido> => {
  try {
    const response = await apiClient.patch<Pedido>(`${pedidosEndpoint}/${id}/estado`);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    throw new Error('Error al actualizar el estado del pedido');
  }
};

export const crearPedido = async (pedidoData: PedidoParaCrear): Promise<Pedido> => {
    try {
        const response = await apiClient.post<Pedido>(pedidosEndpoint, pedidoData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        throw new Error('Error al crear el pedido');
    }
};

export const darDeBajaPedido = async (id: number): Promise<void> => {
  try {
    await apiClient.patch(`${pedidosEndpoint}/${id}/baja`);
  } catch (error) {
    console.error('Error al dar de baja el pedido:', error);
    throw new Error('Error al dar de baja el pedido');
  }
};