import { Router } from "express";
import {
    obtenerCategorias,
    obtenerUnaCategoria,
    agregarCategoria,
    modificarCategoria,
    eliminarCategoria,
    restoreCategoria,
    getCategoriasEliminadas,
    hardDeleteCategoria
} from "../controllers/controllerCategorias";

const router = Router();

router.get('/', obtenerCategorias);
router.get("/eliminados", getCategoriasEliminadas);
router.get('/:id', obtenerUnaCategoria);
router.post('/', agregarCategoria);
router.put('/:id', modificarCategoria);
router.delete('/:id', eliminarCategoria);
router.patch('/:id/restore', restoreCategoria);
router.delete("/:id/hard", hardDeleteCategoria);


export default router;
