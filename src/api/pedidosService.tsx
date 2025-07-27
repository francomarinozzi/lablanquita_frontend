import apiClient from './axiosConfig';
import { Pedido, PedidoParaCrear } from '../types';

const pedidosEndpoint = '/pedidos';

export const getPedidos = async (): Promise<Pedido[]> => {
  try {
    const response = await apiClient.get<Pedido[]>(pedidosEndpoint);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
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