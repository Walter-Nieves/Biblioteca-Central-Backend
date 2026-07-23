import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import db from "../sql/conn";




//OBTENER TODOS LOS LIBROS
export function obtenerLibros(_: Request, res: Response) {
    db.query(
        `SELECT * FROM libros WHERE isDeleted = FALSE`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Error al obtener libros" });
            }
            res.json(results);
        }
    );
}


//OBTENER UN LIBRO (control not exist / isDeleted)
export function obtenerUnLibro(req: Request, res: Response) {
    const { id } = req.params;

    db.query(
        `SELECT * FROM libros WHERE id = ?`,
        [id],
        (err, results: any[]) => {
            if (err) {
                return res.status(500).json({ error: "Error al obtener libro" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Libro no existe" });
            }

            if (results[0].isDeleted) {
                return res.status(400).json({ error: "Libro eliminado" });
            }

            res.json(results[0]);
        }
    );
}



//CREAR LIBRO
export function agregarLibro(req: Request, res: Response) {
    const { titulo, autor_id } = req.body;

    // 1️⃣ Verificar que el autor exista y no esté eliminado
    db.query(
        'SELECT id FROM autores WHERE id = ? AND isDeleted = FALSE',
        [autor_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al validar autor' });
            }

            if ((results as any[]).length === 0) {
                return res.status(404).json({ error: 'Autor no existe o está eliminado' });
            }

            // 2️⃣ Si el autor existe → insertar libro
            db.query<ResultSetHeader>(
                'INSERT INTO libros (titulo, autor_id) VALUES (?, ?)',
                [titulo, autor_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al crear libro' });
                    }

                    res.status(201).json({
                        message: 'Libro creado',
                        id: result.insertId
                    });
                }
            );
        }
    );
}


//MODIFICAR LIBRO (not exist / isDeleted)
export function modificarLibro(req: Request, res: Response) {
    const { id } = req.params;
    const { titulo, autor_id } = req.body;

    db.query(
        `SELECT isDeleted FROM libros WHERE id = ?`,
        [id],
        (err, results: any[]) => {
            if (results.length === 0) {
                return res.status(404).json({ error: "Libro no existe" });
            }

            if (results[0].isDeleted) {
                return res.status(400).json({ error: "Libro eliminado" });
            }

            db.query(
                `UPDATE libros SET titulo = ?, autor_id = ? WHERE id = ?`,
                [titulo, autor_id, id],
                () => res.json({ message: "Libro modificado" })
            );
        }
    );
}

//ELIMINAR LIBRO (soft delete)
export function eliminarLibro(req: Request, res: Response) {
    const { id } = req.params;

    db.query(
        `SELECT isDeleted FROM libros WHERE id = ?`,
        [id],
        (err, results: any[]) => {
            if (results.length === 0) {
                return res.status(404).json({ error: "Libro no existe" });
            }

            if (results[0].isDeleted) {
                return res.status(400).json({ error: "Libro ya eliminado" });
            }

            db.query(
                `UPDATE libros SET isDeleted = TRUE WHERE id = ?`,
                [id],
                () => res.status(204).send()
            );
        }
    );
}

//RESTAURAR LIBRO
export function restaurarLibro(req: Request, res: Response) {
    const { id } = req.params;

    db.query(
        `SELECT isDeleted FROM libros WHERE id = ?`,
        [id],
        (err, results: any[]) => {
            if (results.length === 0) {
                return res.status(404).json({ error: "Libro no existe" });
            }

            if (!results[0].isDeleted) {
                return res.status(400).json({ error: "Libro no está eliminado" });
            }

            db.query(
                `UPDATE libros SET isDeleted = FALSE WHERE id = ?`,
                [id],
                () => res.status(204).send()
            );
        }
    );
}

export function getLibrosEliminados(_: Request, res: Response) {
    db.query(
        "SELECT id, titulo FROM libros WHERE isDeleted = TRUE",
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Error al obtener libros eliminados" });
            }
            res.json(results);
        }
    );
}

export function hardDeleteLibro(req: Request, res: Response) {
    const { id } = req.params;

    db.query(
        "DELETE FROM libros WHERE id = ? AND isDeleted = TRUE",
        [id],
        (err, result: ResultSetHeader) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: "Error al eliminar libro definitivamente" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Libro no encontrado o no está eliminado" });
            }

            res.status(204).send();
        }
    );
}