import { Application, oakCors } from "./Dependencies/dependencias.ts";
import { routerCliente } from "./Routes/clienteRouter.ts";
import { routerMascota } from "./Routes/mascotaRouter.ts";
import {routerFile} from "./Routes/fileRouter.ts";

const app = new Application();

//Configurar CORS para permitir peticiones desde el frontend

app.use(oakCors({
    origin:"*",//Permite peticiones desde cualquier dominio
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],

}));

//Middleware para manejar el tamaño maximo de archivos

app.use(async(ctx,next)=>{
    const contentLength = ctx.request.headers.get("content-length");
    if(contentLength && parseInt(contentLength)>10*1024*1024){
        ctx.response.status = 413;
        ctx.response.body = {
            success:false,
            message:"Archivo demasiado grande (Maximo 10MB)"
        };
        return;
    }
    await next();
});

//Middleware para logging de peticiones

app.use(async(ctx,next)=>{
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.request.method} ${ctx.request.url} - ${ctx.response.status} - ${ms}ms`);
})


const routers=[routerCliente,routerMascota,routerFile];

routers.forEach((router)=>{

    app.use(router.routes());
    app.use(router.allowedMethods());

});

console.log("Servidor corriendo por el puerto 8000")

app.listen({port:8000});