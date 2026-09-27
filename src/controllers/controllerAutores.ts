

import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../sql/conn";


// OBTENER AUTORES (NO ELIMINADOS)
export function obtenerAutores(_: Request, res: Response) {
  db.query<RowDataPacket[]>(
    'SELECT * FROM autores WHERE isDeleted = FALSE',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener los autores' });
      }
      res.json(results);
    }
  );
}


//OBTENER UN AUTOR
export function obtenerUnAutor(req: Request, res: Response) {
  const { id } = req.params;

  db.query<RowDataPacket[]>(
    'SELECT * FROM autores WHERE id = ? AND isDeleted = FALSE',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener el autor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Autor no encontrado' });
      }

      res.json(results[0]);
    }
  );
}


// AGREGAR AUTOR
export function agregarAutor(req: Request, res: Response) {
  const { nombre, apellido } = req.body;

  db.query<ResultSetHeader>(
    'INSERT INTO autores (nombre, apellido) VALUES (?, ?)',
    [nombre, apellido],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al adicionar autor' });
      }

      res.status(201).json({
        message: 'Autor añadido exitosamente',
        autorId: result.insertId
      });
    }
  );
}


//  MODIFICAR AUTOR
export function modificarAutores(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre, apellido } = req.body;

  db.query<ResultSetHeader>(
    'UPDATE autores SET nombre = ?, apellido = ? WHERE id = ? AND isDeleted = FALSE',
    [nombre, apellido, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al modificar autor' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Autor no encontrado o eliminado' });
      }

      res.json({ message: 'Autor modificado exitosamente' });
    }
  );
}


// ELIMINAR AUTOR (SOFT DELETE)
export function eliminarAutor(req: Request, res: Response) {
  const { id } = req.params;

  db.query<ResultSetHeader>(
    'UPDATE autores SET isDeleted = TRUE WHERE id = ? AND isDeleted = FALSE',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar autor' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Autor no encontrado o ya eliminado' });
      }

      res.status(204).send();
    }
  );
}


// RESTAURAR AUTOR
export function restoreAutor(req: Request, res: Response) {
  const { id } = req.params;

  db.query<ResultSetHeader>(
    'UPDATE autores SET isDeleted = FALSE WHERE id = ? AND isDeleted = TRUE',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al restaurar autor' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Autor no encontrado o ya activo' });
      }

      res.status(204).send();
    }
  );
}


export function getAutoresEliminados(_: Request, res: Response) {
  db.query(
    "SELECT id, nombre, apellido FROM autores WHERE isDeleted = TRUE",
    (err, results) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: "Error al obtener autores eliminados" });
      }
      res.json(results);
    }
  );
}

export function hardDeleteAutor(req: Request, res: Response) {
  const { id } = req.params;

  db.query(
    "DELETE FROM autores WHERE id = ? AND isDeleted = TRUE",
    [id],
    (err, result: ResultSetHeader) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: "Error al eliminar autor definitivamente" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Autor no encontrado o no está eliminado" });
      }

      res.status(204).send();
    }
  );
}