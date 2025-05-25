import { Application, oakCors } from "./Dependencies/dependencias.ts";
import { routerCliente } from "./Routes/clienteRouter.ts";


const app = new Application();

app.use(oakCors());

const routers=[routerCliente]

routers.forEach((router)=>{

    app.use(router.routes());
    app.use(router.allowedMethods());

});

console.log("Servidor corriendo por el puerto 8000")

app.listen({port:8000});