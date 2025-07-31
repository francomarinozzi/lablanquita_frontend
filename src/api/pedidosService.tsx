import apiClient from './axiosConfig';
import type { Pedido, PedidoParaCrear, PaginatedResponse } from '../types';

const pedidosEndpoint = '/pedidos';

interface PedidoFilters {
  nombreCliente?: string;
  fecha?: string;
  estado?: string;
  page?: number;
  size?: number;
}


const convertirEstadoParaAPI = (estado: string): string => {
  switch (estado) {
    case 'Pendiente':
      return 'PENDIENTE';
    case 'En proceso':
      return 'EN_PROCESO';
    case 'Completado':
      return 'COMPLETADO';
    default:
      return estado;
  }
};

export const getPedidosPaginados = async (filters: PedidoFilters = {}): Promise<PaginatedResponse<Pedido>> => {
  try {
    const params: { [key: string]: any } = {
      page: filters.page ?? 0,
      size: filters.size ?? 10,
    };

    if (filters.nombreCliente) params.nombreCliente = filters.nombreCliente;
    if (filters.fecha) params.fecha = filters.fecha;
    
    // Aquí hacemos la conversión
    if (filters.estado) {
      params.estado = convertirEstadoParaAPI(filters.estado);
    }

    console.log("➡️ Enviando GET /pedidos/filter con params:", params);
    const response = await apiClient.get<PaginatedResponse<Pedido>>(`${pedidosEndpoint}/filter`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pedidos paginados:', error);
    throw new Error('Error al obtener los pedidos');
  }
};



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