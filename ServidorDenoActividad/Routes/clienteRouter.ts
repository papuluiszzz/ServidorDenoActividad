import { Router } from "../Dependencies/dependencias.ts";
import { getCliente,postCliente,putCliente,deleteCliente } from "../Controllers/clienteController.ts";

const routerCliente = new Router();

routerCliente.get("/cliente",getCliente);
routerCliente.post("/cliente",postCliente);
routerCliente.put("/cliente",putCliente);
routerCliente.delete("/cliente",deleteCliente);



export {routerCliente}