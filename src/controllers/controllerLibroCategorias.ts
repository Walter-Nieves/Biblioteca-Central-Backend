import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import db from "../sql/conn";

/* ================================
   OBTENER ACTIVAS
================================ */
export function obtenerLibrosCategorias(_: Request, res: Response) {
  db.query(
    `SELECT 
        libro_id,
        l.titulo AS libro,
        json_arrayagg(c.nombre) AS categoria,
        json_arrayagg(c.id) AS categoria_id
     FROM libros_categorias lc
     JOIN libros l ON l.id = lc.libro_id
     JOIN categorias c ON c.id = lc.categoria_id
     WHERE lc.isDeleted = FALSE GROUP BY lc.libro_id`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener libro_categorias" });
      }
      res.json(results);
    }
  );
}

/* ================================
   CREAR
================================ */
export function crearLibroCategoria(req: Request, res: Response) {
  const { libro_id, categoria_id } = req.body;

  // 1️⃣ Verificar si la relación ya existe (activa o eliminada)
  db.query(
    `SELECT * 
     FROM libros_categorias 
     WHERE libro_id = ? AND categoria_id = ?`,
    [libro_id, categoria_id],
    (err, results: any[]) => {
      if (err) {
        return res.status(500).json({ error: "Error al verificar relación" });
      }

      // 2️⃣ Si existe
      if (results.length > 0) {
        // 🔁 Existe pero está eliminada → restaurar
        if (results[0].isDeleted) {
          db.query(
            `UPDATE libros_categorias 
             SET isDeleted = FALSE 
             WHERE libro_id = ? AND categoria_id = ?`,
            [libro_id, categoria_id],
            (err2) => {
              if (err2) {
                return res
                  .status(500)
                  .json({ error: "Error al restaurar relación" });
              }

              return res.status(200).json({
                message: "Relación restaurada correctamente",
              });
            }
          );
        } else {
          // ⛔ Existe y NO está eliminada
          return res
            .status(400)
            .json({ error: "La relación ya existe" });
        }
        return
      }

      // 3️⃣ No existe → crear relación
      db.query<ResultSetHeader>(
        `INSERT INTO libros_categorias (libro_id, categoria_id)
         VALUES (?, ?)`,
        [libro_id, categoria_id],
        (err3) => {
          if (err3) {
            return res
              .status(500)
              .json({ error: "Error al crear relación" });
          }

          res.status(201).json({
            message: "Relación creada correctamente",
          });
        }
      );
    }
  );
}

/* ================================
   ELIMINAR (SOFT DELETE)
================================ */
export function eliminarLibroCategoria(req: Request, res: Response) {

  const id = req.params.id as string;
  const [libro_id, categoria_id] = id.split("-");


  db.query(
    `UPDATE libros_categorias 
     SET isDeleted = TRUE
     WHERE libro_id = ? AND categoria_id = ? AND isDeleted = FALSE`,
    [libro_id, categoria_id],
    (err, result: ResultSetHeader) => {
      if (err) {
        return res.status(500).json({ error: "Error al eliminar relación" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Relación no encontrada" });
      }
      res.status(204).send();
    }
  );
}

/* ================================
   RESTAURAR
================================ */
export function restaurarLibroCategoria(req: Request, res: Response) {

  const id = req.params.id as string;
  const [libro_id, categoria_id] = id.split("-");

  db.query(
    `UPDATE libros_categorias 
     SET isDeleted = FALSE
     WHERE libro_id = ? AND categoria_id = ? AND isDeleted = TRUE`,
    [libro_id, categoria_id],
    (err, result: ResultSetHeader) => {
      if (err) {
        return res.status(500).json({ error: "Error al restaurar relación" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Relación no estaba eliminada" });
      }
      res.status(204).send();
    }
  );
}

/* ================================
   OBTENER ELIMINADAS
================================ */
export function getLibrosCategoriasEliminadas(_: Request, res: Response) {
  db.query(
    `SELECT 
      CONCAT(lc.libro_id,'-',lc.categoria_id) AS id,
      l.titulo AS libro,
      c.nombre AS categoria
     FROM libros_categorias lc
     JOIN libros l ON l.id = lc.libro_id
     JOIN categorias c ON c.id = lc.categoria_id
     WHERE lc.isDeleted = TRUE`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener eliminadas" });
      }
      res.json(results);
    }
  );
}

/* ================================
   HARD DELETE
================================ */
export function hardDeleteLibroCategoria(req: Request, res: Response) {

  const id = req.params.id as string;
  const [libro_id, categoria_id] = id.split("-");

  db.query(
    `DELETE FROM libros_categorias 
     WHERE libro_id = ? AND categoria_id = ? AND isDeleted = TRUE`,
    [libro_id, categoria_id],
    (err, result: ResultSetHeader) => {
      if (err) {
        return res.status(500).json({ error: "Error hard delete" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Relación no encontrada" });
      }
      res.status(204).send();
    }
  );
}
