import { Application, oakCors } from "./Dependencies/dependencias.ts";

const app = new Application();

app.use(oakCors());

console.log("Servidor corriendo por el puerto 8000")

app.listen({port:8000});