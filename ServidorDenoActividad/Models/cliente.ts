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

     public async ActualizarCliente(): Promise<{success: boolean; message:string; cliente?: Record<string, unknown>}>{
        try {
            if (!this._objCliente) {
                throw new Error("No se ha proporcionado un objeto de instructor valido")
            }

            const { idCliente, nombre, apellido, email, telefono } = this._objCliente;

            if (!idCliente) {
                throw new Error("Se requiere el ID del cliente para actualizarlo");
            }

            if (!nombre || !apellido || !email || !telefono) {
                throw new Error("Faltan campos requeridos para actualizar el cliente");
            } 

            await conexion.execute("START TRANSACTION");

            const result = await conexion.execute(
                `UPDATE clientes SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE idCliente = ?`,[
                    nombre, apellido, email, telefono, idCliente
                ]);

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                
                const [cliente] = await conexion.query(
                    `SELECT * FROM instructor WHERE idinstructor = ?`,[idCliente]
                );

                await conexion.execute("COMMIT");
                return{ success: true, message:"instructor Actualizado correctamente",cliente:cliente};
            }else{

                throw new Error("No fue posible actualizar el cliente")
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {success:false,message: error.message}
            }else{
                return {success: false, message:"Error interno del servidor"}
            }
        }
    }
   public async EliminarCliente(): Promise<{ success: boolean; message: string; cliente?: Record<string, unknown> }> {
    try {
        if (!this._objCliente || !this._objCliente.idCliente) {
            throw new Error("No se ha proporcionado un ID de cliente válido");
        }

        const idCliente = this._objCliente.idCliente;

        await conexion.execute("START TRANSACTION");

        // Verificar si el cliente existe antes de eliminar
        const [clienteExistente] = await conexion.query('SELECT * FROM clientes WHERE idCliente = ?', [idCliente]);
        
        if (!clienteExistente) {
            await conexion.execute("ROLLBACK");
            return { success: false, message: "El cliente no existe" };
        }

        const result = await conexion.execute('DELETE FROM clientes WHERE idCliente = ?', [idCliente]);

        if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
            await conexion.execute("COMMIT");
            return { 
                success: true, 
                message: "Cliente eliminado correctamente", 
                cliente: clienteExistente 
            };
        } else {
            await conexion.execute("ROLLBACK");
            throw new Error("No fue posible eliminar el cliente");
        }

    } catch (error) {
        await conexion.execute("ROLLBACK");
        if (error instanceof z.ZodError) {
            return { success: false, message: error.message };
        } else {
            return { success: false, message: "Error interno del servidor" };
        }
    }
}

}