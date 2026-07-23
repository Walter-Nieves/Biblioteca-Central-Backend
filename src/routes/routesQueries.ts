import { Router } from "express";
import {
   consultarAutoresPorCategoria,
   consultarCategoriasDeUnAutor,
   consultarCategoriasDeUnLibro,
   contarAutoresPorCategoria,
   contarLibrosPorAutor,
   contarLibrosPorCategoria,
   obtenerAutorDeLibro,
   obtenerLibrosAutoryCategoria,
   obtenerLibrosCategorias,
   obtenerLibrosPorAutor,
   obtenerLibrosPorCategoria,
} from "../controllers/controllerQueries";

const router = Router();

/* =====================================================
   RELACIONES LIBRO - CATEGORIA
===================================================== */

// Todas las relaciones libro_categoria (no eliminadas)
router.get("/libros_categorias", obtenerLibrosCategorias);

/* =====================================================
   LIBROS (CONSULTAS AVANZADAS)
===================================================== */

// Todos los libros con autor y categoría
router.get("/libros-detalle", obtenerLibrosAutoryCategoria);

// Libros por autor
router.get("/libros/autor/:autor_id", obtenerLibrosPorAutor);

// Libros por categoría
router.get("/libros/categoria/:categoria_id", obtenerLibrosPorCategoria);

// Autor de un libro
router.get("/libros/:libro_id/autor", obtenerAutorDeLibro);

// Categorías de un libro
router.get("/libros/:libro_id/categorias", consultarCategoriasDeUnLibro);

/* =====================================================
   AUTORES (CONSULTAS AVANZADAS)
===================================================== */

// Categorías en las que ha escrito un autor
router.get("/autores/:autor_id/categorias", consultarCategoriasDeUnAutor);

// Contar libros de un autor
router.get("/autores/:autor_id/libros/count", contarLibrosPorAutor);
// router.get("/autor/:autorId", obtenerLibrosPorAutorSinDuplicar);

/* =====================================================
   CATEGORIAS (CONSULTAS AVANZADAS)
===================================================== */

// Autores que pertenecen a una categoría
router.get("/categorias/:categoria_id/autores", consultarAutoresPorCategoria);

// Contar libros de una categoría
router.get("/categorias/:categoria_id/libros/count", contarLibrosPorCategoria);

// Contar autores de una categoría
router.get("/categorias/:categoria_id/autores/count", contarAutoresPorCategoria);

export default router;
