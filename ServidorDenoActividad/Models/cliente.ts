import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/dependencias.ts";

interface ClienteData{
    idCliente:number|null;
    nombre:string;
    apellido:string;
    telefono:string;
    email:string;
}

export class Cliente {
    public _objCliente: ClienteData | null;
    public _idCliente: number | null;


    constructor(objClientes: ClienteData | null = null, idCliente:number | null = null){
        this._objCliente = objClientes;
        this._idCliente = idCliente;
    }

    public async SeleccionarClientes():Promise<ClienteData[]>{
        const {rows:cliente} = await conexion.execute('select * from clientes');
        return cliente as ClienteData[];
    }

    public async InsertarCliente():Promise<{ success:boolean;message:string;cliente?:Record<string,unknown>}>{


        try{

            if(!this._objCliente){
                throw new Error("No se a proporcionado un objeto de instructor valido");
            }

            const {nombre,apellido,telefono,email} = this._objCliente;
            if(!nombre || !apellido || !email || !telefono){
                throw new Error("Faltan campos requeridos para insertar la informacion");

            }

            await conexion.execute("START TRANSACTION");
           const result = await conexion.execute('insert into clientes (nombre, apellido, email, telefono) values (?, ?, ?, ?)', [
                nombre, 
                apellido, 
                email,
                telefono,
            ]);

            if(result && typeof result.affectedRows === "number" && result.affectedRows > 0){
                const [cliente] = await conexion.query('select * from clientes where idCliente = LAST_INSERT_ID()',);
                await conexion.execute("COMMIT");
                return {success:true,message:"Cliente registrado correctamente",cliente:cliente};
            }else{
                throw new Error("No fue posible registrar al cliente");
            }
        }catch(error){
            if(error instanceof z.ZodError){
                return{success:false, message:error.message}
            }else{
                return{success:false,message:"Error interno del servidor"}
            }
        }

    }

}