

import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../sql/conn";


   // OBTENER CATEGORÍAS (NO ELIMINADAS)
export function obtenerCategorias(_: Request, res: Response) {
  db.query<RowDataPacket[]>(
    'SELECT * FROM categorias WHERE isDeleted = FALSE',
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener las categorías' });
      }
      res.json(results);
    }
  );
}


   // OBTENER UNA CATEGORÍA
export function obtenerUnaCategoria(req: Request, res: Response) {
  const { id } = req.params;

  db.query<RowDataPacket[]>(
    'SELECT * FROM categorias WHERE id = ? AND isDeleted = FALSE',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener la categoría' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json(results[0]);
    }
  );
}


   // AGREGAR CATEGORÍA
export function agregarCategoria(req: Request, res: Response) {
  const { nombre } = req.body;

  db.query<ResultSetHeader>(
    'INSERT INTO categorias (nombre) VALUES (?)',
    [nombre],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al adicionar categoría' });
      }

      res.status(201).json({
        message: 'Categoría añadida exitosamente',
        categoriaId: result.insertId
      });
    }
  );
}


  //  MODIFICAR CATEGORÍA
export function modificarCategoria(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre } = req.body;

  db.query<ResultSetHeader>(
    'UPDATE categorias SET nombre = ? WHERE id = ? AND isDeleted = FALSE',
    [nombre, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al modificar categoría' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada o eliminada' });
      }

      res.json({ message: 'Categoría modificada exitosamente' });
    }
  );
}


   // ELIMINAR CATEGORÍA (SOFT DELETE)
export function eliminarCategoria(req: Request, res: Response) {
  const { id } = req.params;

  db.query<ResultSetHeader>(
    'UPDATE categorias SET isDeleted = TRUE WHERE id = ? AND isDeleted = FALSE',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar categoría' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada o ya eliminada' });
      }

      res.status(204).send();
    }
  );
}


  // RESTAURAR CATEGORÍA
export function restoreCategoria(req: Request, res: Response) {
  const { id } = req.params;

  db.query<ResultSetHeader>(
    'UPDATE categorias SET isDeleted = FALSE WHERE id = ? AND isDeleted = TRUE',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al restaurar categoría' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada o ya activa' });
      }

      res.status(204).send();
    }
  );
}

export function getCategoriasEliminadas(_: Request, res: Response) {
  db.query(
    "SELECT id, nombre FROM categorias WHERE isDeleted = TRUE",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener categorías eliminadas" });
      }
      res.json(results);
    }
  );
}

export function hardDeleteCategoria(req: Request, res: Response) {
  const { id } = req.params;

  db.query(
    "DELETE FROM categorias WHERE id = ? AND isDeleted = TRUE",
    [id],
    (err, result: ResultSetHeader) => {
      if (err) {
        return res.status(500).json({ error: "Error al eliminar categoría definitivamente" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Categoría no encontrada o no está eliminada" });
      }

      res.status(204).send();
    }
  );
}