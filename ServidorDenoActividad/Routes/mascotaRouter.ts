import { Router } from "../Dependencies/dependencias.ts";
import { getMascota, postMascota, putMascota, deleteMascota } from "../Controllers/mascotaController.ts";

const routerMascota = new Router();

routerMascota.get("/mascota", getMascota);
routerMascota.post("/mascota", postMascota);
routerMascota.put("/mascota", putMascota);
routerMascota.delete("/mascota", deleteMascota);

export { routerMascota }