// deno-lint-ignore-file

import { Mascota } from "../Models/mascota.ts"; 

export const getMascota = async(ctx:any)=>{
    const {response} = ctx;

    try{
        const objMascota = new Mascota();
        const listaMascota = await objMascota.SeleccionarMascotas();
        response.status = 200;
        response.body = {
            success:true,
            data:listaMascota,
        }
    }catch(error){
        response.status = 400;
        response.body = {
            success:false,
            message:"Error al procesar la solicitud",
            errors:error
        }
    }
};

export const postMascota = async(ctx:any)=>{
    const {response,request} = ctx;
    try{
       const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {
            response.status = 400;
            response.body = {success:false,  message:"El cuerpo de la solicitud se encuentra vacío."};
            return;
        }
        
        const body = await request.body.json();
        const MascotaData = {
            idMascota: null,
            nombre: body.nombre,
            especie: body.especie,
            raza: body.raza,
            edad: body.edad,
            idCliente: body.idCliente
        }
        
        const objMascota = new Mascota(MascotaData)
        const result = await objMascota.InsertarMascota();
        response.status = 200;
        response.body = {
            success:true,
            body:result
        };

    }catch(error){
        response.status = 400;
        response.body = {
            success:false,
            message:"Error al procesar la solicitud",
            errors:error
        }
    }
};

export const putMascota = async(ctx: any)=>{
    const {response,request} = ctx;

    try{
        const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {
            response.status = 400;
            response.body = {success: false,  message: "Cuerpo de la solicitud está vacío"};
            return;
        }

        const body = await request.body.json();
        const MascotaData = {
            idMascota: body.idMascota,
            nombre: body.nombre,
            especie: body.especie,
            raza: body.raza,
            edad: body.edad,
            idCliente: body.idCliente
        }

        const objMascota = new Mascota(MascotaData);
        const result = await objMascota.ActualizarMascota();
        response.status = 200;
        response.body = {
            success:true,
            body:result,
        };

    }catch(error){
        response.status = 400;
        response.body = {
            success:false,
            message:"Error al procesar la solicitud"
        }
    }
};

export const deleteMascota = async (ctx: any) => {
    const { response, request } = ctx;
    try {
        const contentLength = request.headers.get("Content-Length");
        if (contentLength === "0") {
            response.status = 400;
            response.body = { success: false, message: "El ID de la mascota es requerido para eliminarla" };
            return;
        }

        const body = await request.body.json();
        if (!body.idMascota) {
            response.status = 400;
            response.body = { success: false, message: "El ID de la mascota es requerido para eliminarla" };
            return;
        }

        // Forma más consistente de crear el objeto Mascota para eliminación
        const MascotaData = {
            idMascota: body.idMascota,
            nombre: "",
            especie: "",
            raza: "",
            edad: 0,
            idCliente: 0
        };
        
        const objMascota = new Mascota(MascotaData);
        const result = await objMascota.EliminarMascota();

        response.status = 200;
        response.body = {
            success: true,
            body: result,
        };
    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud"
        }
    }
};