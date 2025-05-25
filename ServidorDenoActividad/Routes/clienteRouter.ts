import { Router } from "../Dependencies/dependencias.ts";
import { getCliente,postCliente } from "../Controllers/clienteController.ts";

const routerCliente = new Router();

routerCliente.get("/cliente",getCliente);
routerCliente.post("/cliente",postCliente);



export {routerCliente}