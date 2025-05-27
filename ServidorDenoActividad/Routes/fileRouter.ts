import { Router } from "../Dependencies/dependencias.ts";
import { uploadFile,getFile,deleteFile,listFiles } from "../Controllers/fileController.ts";

const routerFile = new Router();

routerFile.post("/archivosubidas",uploadFile);
routerFile.get("/archivolistar",listFiles);
routerFile.get("/files/:filename",getFile);
routerFile.delete("/archivoeliminar",deleteFile);

export {routerFile};