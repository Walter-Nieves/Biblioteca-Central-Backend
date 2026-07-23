import { Router } from "express";
import { obtenerLibros, obtenerUnLibro, agregarLibro, modificarLibro, eliminarLibro, restaurarLibro,getLibrosEliminados,hardDeleteLibro } from "../controllers/controllerLibros";

const router = Router();

router.get("/", obtenerLibros);
router.get("/eliminados", getLibrosEliminados);
router.get("/:id", obtenerUnLibro);
router.post("/", agregarLibro);
router.put("/:id", modificarLibro);
router.delete("/:id", eliminarLibro);
router.patch("/:id/restore", restaurarLibro);
router.delete("/:id/hard", hardDeleteLibro);
export default router;


