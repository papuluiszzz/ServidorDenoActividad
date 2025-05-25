import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/dependencias.ts";

interface ClienteData{
    idCliente:number|null;
    nombre:string;
    apellido:string;
    telefono:string;
    email:string;
}