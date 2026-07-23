import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import db from "../sql/conn";
interface CountResult extends RowDataPacket { total_autores: number; }

// CONSULTAR TODAS LAS RELACIONES DE LIBRO_CATEGORIA CON TITULO Y NOMBRE DE CATEGORIA EN VEZ DE IDS(EXCEPTO eliminadas) numero-numero
export function obtenerLibrosCategorias(_: Request, res: Response) {
    db.query(
        `SELECT *FROM libros_categorias WHERE isDeleted = FALSE`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Error al obtener libro_categorias" });
            }
            res.json(results);
        }
    );
}

// OBTENER TODOS LOS LIBROS DE CADA AUTOR CON CADA CATEGORIA 
export function obtenerLibrosAutoryCategoria(req: Request, res: Response) {
    db.query(
        `
    SELECT
      l.id,
      l.titulo,
      a.nombre AS autor_nombre,
      a.apellido AS autor_apellido,
      GROUP_CONCAT(
        DISTINCT c.nombre
        ORDER BY c.nombre
        SEPARATOR ', '
      ) AS categorias
    FROM libros l
    JOIN autores a ON l.autor_id = a.id
    LEFT JOIN libros_categorias lc 
      ON lc.libro_id = l.id AND lc.isDeleted = FALSE
    LEFT JOIN categorias c 
      ON c.id = lc.categoria_id AND c.isDeleted = FALSE
    WHERE l.isDeleted = FALSE
      AND a.isDeleted = FALSE
    
    GROUP BY l.id;
    `,

        (err, results) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ error: "Error al obtener libros" });
            }
            res.json(results);
        }
    );
}

//CONSULTAR AUTOR DE UN LIBRO (INFO COMPLETA)
export function obtenerAutorDeLibro(req: Request, res: Response) {
    const { libro_id } = req.params;

    db.query(
        `
    SELECT 
      l.id AS libro_id,
      l.titulo,
      a.id AS autor_id,
      a.nombre,
      a.apellido
    FROM libros l
    JOIN autores a ON l.autor_id = a.id
    WHERE l.id = ?
      AND l.isDeleted = FALSE
      AND a.isDeleted = FALSE
    `,
        [libro_id],
        (err, results) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Error al consultar autor del libro" });
            }

            if ((results as any[]).length === 0) {
                return res
                    .status(404)
                    .json({ error: "Libro no existe o no tiene autor válido" });
            }

            // Solo devuelve un registro
            res.json((results as any[])[0]);
        }
    );
}


// ¿CUÁNTOS LIBROS HAY DE UN AUTOR?
export function obtenerLibrosPorAutor(req: Request, res: Response) {
    const { autor_id } = req.params;

    db.query<RowDataPacket[]>(
        `
    SELECT
      l.id,
      l.titulo,
      a.nombre   AS autor_nombre,
      a.apellido AS autor_apellido,
      GROUP_CONCAT(
        DISTINCT c.nombre 
        ORDER BY c.nombre 
        SEPARATOR ', '
      ) AS categorias
    FROM libros l
    JOIN autores a ON a.id = l.autor_id
    LEFT JOIN libros_categorias lc 
      ON lc.libro_id = l.id AND lc.isDeleted = FALSE
    LEFT JOIN categorias c 
      ON c.id = lc.categoria_id AND c.isDeleted = FALSE
    WHERE l.autor_id = ?
      AND l.isDeleted = FALSE
      AND a.isDeleted = FALSE
    GROUP BY l.id;
    `,
        [autor_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ error: "Error al obtener libros por autor" });
            }
            res.json(results);
        }
    );
}

// cuantos libros tiene un autor
export function contarLibrosPorAutor(req: Request, res: Response) {
    const { autor_id } = req.params;

    // 1️⃣ Verificar que el autor exista y no esté eliminado
    db.query(
        `SELECT id FROM autores WHERE id = ? AND isDeleted = FALSE`,
        [autor_id],
        (errAutor, autorResult) => {
            if (errAutor) {
                return res
                    .status(500)
                    .json({ error: "Error al verificar autor" });
            }

            if ((autorResult as any[]).length === 0) {
                return res
                    .status(404)
                    .json({ error: "Autor no existe o está eliminado" });
            }

            // 2️⃣ Contar libros del autor
            db.query(
                `
        SELECT COUNT(*) AS total_libros
        FROM libros
        WHERE autor_id = ?
          AND isDeleted = FALSE
        `,
                [autor_id],
                (err, results) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Error al contar libros del autor" });
                    }

                    res.json((results as any[])[0]); // { total_libros: number }
                }
            );
        }
    );
}


// CONSULTAR TODOS LOS LIBROS DE UNA CATEGORÍA
export function obtenerLibrosPorCategoria(req: Request, res: Response) {
    const { categoria_id } = req.params;

    // 1️⃣ Verificar que la categoría exista y no esté eliminada
    db.query(
        `SELECT id FROM categorias WHERE id = ? AND isDeleted = FALSE`,
        [categoria_id],
        (errCat, catResult) => {
            if (errCat) {
                return res
                    .status(500)
                    .json({ error: "Error al verificar categoría" });
            }

            if ((catResult as any[]).length === 0) {
                return res
                    .status(404)
                    .json({ error: "Categoría no existe o está eliminada" });
            }

            // 2️⃣ Obtener libros de la categoría
            db.query(
                `
        SELECT 
          l.id AS libro_id,
          l.titulo,
          c.nombre AS categoria
        FROM libros l
        JOIN libros_categorias lc ON l.id = lc.libro_id
        JOIN categorias c ON lc.categoria_id = c.id
        WHERE c.id = ?
          AND l.isDeleted = FALSE
          AND lc.isDeleted = FALSE
          AND c.isDeleted = FALSE
        `,
                [categoria_id],
                (err, results) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Error al obtener libros por categoría" });
                    }

                    res.json(results);
                }
            );
        }
    );
}


// ¿CUÁNTOS LIBROS HAY DE UNA CATEGORÍA?
export function contarLibrosPorCategoria(req: Request, res: Response) {
    const { categoria_id } = req.params;

    db.query<RowDataPacket[]>(
        `SELECT id FROM categorias WHERE id = ? AND isDeleted = FALSE`,
        [categoria_id],
        (errCat, catResult) => {
            if (errCat) {
                return res.status(500).json({ error: "Error al verificar categoría" });
            }

            if (catResult.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Categoría no existe o está eliminada" });
            }

            db.query<RowDataPacket[]>(
                `
        SELECT COUNT(DISTINCT l.id) AS total_libros
        FROM libros l
        JOIN libros_categorias lc ON l.id = lc.libro_id
        WHERE lc.categoria_id = ?
          AND l.isDeleted = FALSE
          AND lc.isDeleted = FALSE
        `,
                [categoria_id],
                (err, results) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Error al contar libros por categoría" });
                    }

                    res.json(results[0]); // ✅ YA NO DA ERROR
                }
            );
        }
    );
}

// Consultar categorias de un libro
export function consultarCategoriasDeUnLibro(req: Request, res: Response) {
    const { libro_id } = req.params;

    // 1️⃣ Verificar que el libro exista y no esté eliminado
    db.query<RowDataPacket[]>(
        `SELECT id FROM libros WHERE id = ? AND isDeleted = FALSE`,
        [libro_id],
        (errLibro, libroResult) => {
            if (errLibro) {
                return res
                    .status(500)
                    .json({ error: "Error al verificar libro" });
            }

            if (libroResult.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Libro no existe o está eliminado" });
            }

            // 2️⃣ Consultar categorías del libro
            db.query<RowDataPacket[]>(
                `
                SELECT 
                c.id,
                c.nombre
                FROM categorias c
                JOIN libros_categorias lc ON c.id = lc.categoria_id
                WHERE lc.libro_id = ?
                AND c.isDeleted = FALSE
                AND lc.isDeleted = FALSE
                `,
                [libro_id],
                (err, results) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Error al consultar categorías del libro" });
                    }

                    res.json({
                        libro_id,
                        total_categorias: results.length,
                        categorias: results
                    });
                }
            );
        }
    );
}

// Consultar categorias de un autor
export function consultarCategoriasDeUnAutor(req: Request, res: Response) {
    const { autor_id } = req.params;

    // 1️⃣ Verificar que el autor exista y no esté eliminado
    db.query<RowDataPacket[]>(
        `SELECT id FROM autores WHERE id = ? AND isDeleted = FALSE`,
        [autor_id],
        (errAutor, autorResult) => {
            if (errAutor) {
                return res
                    .status(500)
                    .json({ error: "Error al verificar autor" });
            }

            if (autorResult.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Autor no existe o está eliminado" });
            }

            // 2️⃣ Consultar categorías del autor
            db.query<RowDataPacket[]>(
                `
        SELECT DISTINCT
          c.id,
          c.nombre
        FROM categorias c
        JOIN libros_categorias lc ON c.id = lc.categoria_id
        JOIN libros l ON lc.libro_id = l.id
        WHERE l.autor_id = ?
          AND c.isDeleted = FALSE
          AND lc.isDeleted = FALSE
          AND l.isDeleted = FALSE
        `,
                [autor_id],
                (err, results) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Error al consultar categorías del autor" });
                    }

                    res.json({
                        autor_id,
                        total_categorias: results.length,
                        categorias: results
                    });
                }
            );
        }
    );
}

// Consultar todos los autores de una categoria
export function consultarAutoresPorCategoria(req: Request, res: Response) {
    const { categoria_id } = req.params;

    // 1️⃣ Verificar que la categoría exista y no esté eliminada
    db.query<RowDataPacket[]>(
        `SELECT id FROM categorias WHERE id = ? AND isDeleted = FALSE`,
        [categoria_id],
        (errCat, catResult) => {
            if (errCat) {
                return res
                    .status(500)
                    .json({ error: "Error al verificar categoría" });
            }

            if (catResult.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Categoría no existe o está eliminada" });
            }

            // 2️⃣ Consultar autores de la categoría
            db.query<RowDataPacket[]>(
                `
        SELECT DISTINCT
          a.id,
          a.nombre,
          a.apellido
        FROM autores a
        JOIN libros l ON a.id = l.autor_id
        JOIN libros_categorias lc ON l.id = lc.libro_id
        WHERE lc.categoria_id = ?
          AND a.isDeleted = FALSE
          AND l.isDeleted = FALSE
          AND lc.isDeleted = FALSE
        `,
                [categoria_id],
                (err, results) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Error al consultar autores por categoría" });
                    }

                    res.json({
                        categoria_id,
                        total_autores: results.length,
                        autores: results
                    });
                }
            );
        }
    );
}


// Cuantos autores hay en una categoria
export function contarAutoresPorCategoria(req: Request, res: Response) {
    const { categoria_id } = req.params;

    db.query<RowDataPacket[]>(
        `
    SELECT COUNT(DISTINCT a.id) AS total_autores
    FROM autores a
    JOIN libros l ON a.id = l.autor_id
    JOIN libros_categorias lc ON l.id = lc.libro_id
    WHERE lc.categoria_id = ?
      AND a.isDeleted = FALSE
      AND l.isDeleted = FALSE
      AND lc.isDeleted = FALSE
    `,
        [categoria_id],
        (err, results) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Error al contar autores por categoría" });
            }

            // ✅ SOLO EL NÚMERO (frontend feliz)
            res.json(results[0]?.total_autores ?? 0);
        }
    );
}


