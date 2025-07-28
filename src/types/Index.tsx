export const OPCIONES_UNIDAD_MEDIDA = ['unidad', 'kg', 'g', 'docena'] as const;

export type UnidadDeMedida = typeof OPCIONES_UNIDAD_MEDIDA[number];


export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  en_stock: boolean;
  activo: boolean;
  unidadMedida: UnidadDeMedida;
}

export interface DetalleVenta {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Venta {
  id: number;
  fechaHora: string;
  formaPago: string;
  total: number;
  activo:boolean;
  detalles: DetalleVenta[];
}

export interface DetalleVentaParaCrear {
  producto: {
    id: number;
  };
  cantidad: number;
}

export interface VentaParaCrear {
  formaPago: string;
  detalles: DetalleVentaParaCrear[];
}

export interface Pedido {
  id: number;
  idVenta: number;
  direccion: string | null;
  nombreCliente: string;
  estado: 'Pendiente' | 'En proceso' | 'Completado';
  activo: boolean;
  detalles: DetalleVenta[];
  fechaHora: string;
}

export interface PedidoParaCrear {
  nombreCliente: string;
  direccion: string;
  venta: VentaParaCrear;
}
