
export const UNIT_OF_MEASURE_OPTIONS = ['unidad', 'kg', 'g'] as const;

export type UnitOfMeasure = typeof UNIT_OF_MEASURE_OPTIONS[number];

export interface Producto {
  id: number | string;
  nombre: string;
  precio: number;
  enStock: boolean;
  activo: boolean;
  unidad_medida: UnitOfMeasure; 
}
