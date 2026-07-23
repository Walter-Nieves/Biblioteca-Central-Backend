export type CountResult = {
  total_autores: number;
};


export interface LibroDetalleRow {
  id: number;
  titulo: string;
  autor_nombre: string;
  autor_apellido: string;
  categorias: string | null; // 👈 viene como STRING
}

// ========================
// MODELO PARA EL FRONTEND
// ========================

export interface LibroDetalle {
  id: number;
  titulo: string;
  autor: string;
  categorias: string[];
}

