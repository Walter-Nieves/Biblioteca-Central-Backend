// Importa el middleware CORS para permitir peticiones desde otros dominios
import cors from "cors";
// Importa dotenv para usar variables de entorno desde el archivo .env
import dotenv from "dotenv";
// Importa Express para crear el servidor
import express from "express";
// Importa la conexión a la base de datos MySQL
//Es un tipo que viene de mysql2:Este tipo representa el resultado de consultas que NO devuelven filas, como:
//INSERT,UPDATE,DELETE

import librosCategoriasRouter from "./routes/libro_categorias.routes";
import autoresRouter from "./routes/routesAutores";
import categoriasRouter from "./routes/routesCategorias";
import librosRouter from "./routes/routesLibros";
import queriesRoutes from "./routes/routesQueries";

// Carga las variables del archivo .env (por ejemplo PORT, DB_HOST, etc.)
dotenv.config();

// Crea la aplicación de Express
const app = express();

// Middleware para permitir recibir JSON en las peticiones
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors());

// Rutas
app.use('/api/autores', autoresRouter)
app.use("/api/libros", librosRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/libros_categorias", librosCategoriasRouter);
app.use("/api/queries", queriesRoutes);



// Obtiene el puerto desde .env o usa 3000 por defecto
const PORT = process.env.PORT || 3000;

// Ruta de prueba para verificar que el servidor funciona
app.get("/ping", (_, res) =>
  res.send("Pong!")
);


// Inicia el servidor y lo deja escuchando en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
