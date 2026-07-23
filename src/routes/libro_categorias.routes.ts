import { Router } from "express";
import {
  obtenerLibrosCategorias,
  crearLibroCategoria,
  eliminarLibroCategoria,
  restaurarLibroCategoria,
  getLibrosCategoriasEliminadas,
  hardDeleteLibroCategoria
} from "../controllers/controllerLibroCategorias";

const router = Router();


router.get("/", obtenerLibrosCategorias);
router.get("/eliminados", getLibrosCategoriasEliminadas);
router.post("/", crearLibroCategoria);
router.delete("/:id", eliminarLibroCategoria);
router.patch("/:id/restore", restaurarLibroCategoria);
router.delete("/:id/hard", hardDeleteLibroCategoria);

export default router;

