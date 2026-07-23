import { Router } from "express";
import {
  agregarAutor,
  eliminarAutor,
  getAutoresEliminados,
  modificarAutores,
  obtenerAutores,
  obtenerUnAutor,
  restoreAutor,
  hardDeleteAutor
} from "../controllers/controllerAutores";

const router = Router();

router.get('/', obtenerAutores);
router.get("/eliminados", getAutoresEliminados);
router.get('/:id', obtenerUnAutor);
router.post('/', agregarAutor);
router.put('/:id', modificarAutores);
router.delete('/:id', eliminarAutor);
router.patch('/:id/restore', restoreAutor);
router.delete("/:id/hard", hardDeleteAutor);

export default router;
