import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/dependencias.ts";

interface MascotaData{
    idMascota:number|null;
    nombre:string;
    especie:string;
    raza:string;
    edad:number;
    idCliente:number;
}

export class Mascota {
    public _objMascota: MascotaData | null;
    public _idMascota: number | null;

    constructor(objMascota: MascotaData | null = null, idMascota:number | null = null){
        this._objMascota = objMascota;
        this._idMascota = idMascota;
    }

    public async SeleccionarMascotas():Promise<MascotaData[]>{
        const {rows:mascota} = await conexion.execute('select * from mascotas');
        return mascota as MascotaData[];
    }

    public async InsertarMascota():Promise<{ success:boolean;message:string;mascota?:Record<string,unknown>}>{
        try{
            if(!this._objMascota){
                throw new Error("No se ha proporcionado un objeto de mascota válido");
            }

            const {nombre, especie, raza, edad, idCliente} = this._objMascota;
            if(!nombre || !especie || !raza || !edad || !idCliente){
                throw new Error("Faltan campos requeridos para insertar la información");
            }

            await conexion.execute("START TRANSACTION");
           const result = await conexion.execute('insert into mascotas (nombre, especie, raza, edad, idCliente) values (?, ?, ?, ?, ?)', [
                nombre, 
                especie, 
                raza,
                edad,
                idCliente
            ]);

            if(result && typeof result.affectedRows === "number" && result.affectedRows > 0){
                const [mascota] = await conexion.query('select * from mascotas where idMascota = LAST_INSERT_ID()');
                await conexion.execute("COMMIT");
                return {success:true,message:"Mascota registrada correctamente",mascota:mascota};
            }else{
                throw new Error("No fue posible registrar la mascota");
            }
        }catch(error){
            await conexion.execute("ROLLBACK");
            if(error instanceof z.ZodError){
                return{success:false, message:error.message}
            }else{
                return{success:false,message:"Error interno del servidor"}
            }
        }
    }

     public async ActualizarMascota(): Promise<{success: boolean; message:string; mascota?: Record<string, unknown>}>{
        try {
            if (!this._objMascota) {
                throw new Error("No se ha proporcionado un objeto de mascota válido")
            }

            const { idMascota, nombre, especie, raza, edad, idCliente } = this._objMascota;

            if (!idMascota) {
                throw new Error("Se requiere el ID de la mascota para actualizarla");
            }

            if (!nombre || !especie || !raza || !edad || !idCliente) {
                throw new Error("Faltan campos requeridos para actualizar la mascota");
            } 

            await conexion.execute("START TRANSACTION");

            const result = await conexion.execute(
                `UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad = ?, idCliente = ? WHERE idMascota = ?`,[
                    nombre, especie, raza, edad, idCliente, idMascota
                ]);

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const [mascota] = await conexion.query(
                    `SELECT * FROM mascotas WHERE idMascota = ?`,[idMascota]
                );

                await conexion.execute("COMMIT");
                return{ success: true, message:"Mascota actualizada correctamente",mascota:mascota};
            }else{
                throw new Error("No fue posible actualizar la mascota")
            }
        } catch (error) {
            await conexion.execute("ROLLBACK");
            if (error instanceof z.ZodError) {
                return {success:false,message: error.message}
            }else{
                return {success: false, message:"Error interno del servidor"}
            }
        }
    }

   public async EliminarMascota(): Promise<{ success: boolean; message: string; mascota?: Record<string, unknown> }> {
    try {
        if (!this._objMascota || !this._objMascota.idMascota) {
            throw new Error("No se ha proporcionado un ID de mascota válido");
        }

        const idMascota = this._objMascota.idMascota;

        await conexion.execute("START TRANSACTION");

        // Verificar si la mascota existe antes de eliminar
        const [mascotaExistente] = await conexion.query('SELECT * FROM mascotas WHERE idMascota = ?', [idMascota]);
        
        if (!mascotaExistente) {
            await conexion.execute("ROLLBACK");
            return { success: false, message: "La mascota no existe" };
        }

        const result = await conexion.execute('DELETE FROM mascotas WHERE idMascota = ?', [idMascota]);

        if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
            await conexion.execute("COMMIT");
            return { 
                success: true, 
                message: "Mascota eliminada correctamente", 
                mascota: mascotaExistente 
            };
        } else {
            await conexion.execute("ROLLBACK");
            throw new Error("No fue posible eliminar la mascota");
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