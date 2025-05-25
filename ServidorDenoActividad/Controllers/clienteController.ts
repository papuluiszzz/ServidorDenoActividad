// deno-lint-ignore-file

import { Cliente } from "../Models/cliente.ts"; 


export const getCliente = async(ctx:any)=>{
    const {response} = ctx;

    try{
        const objCliente = new Cliente();
        const listaCliente = await objCliente.SeleccionarClientes();
        response.status = 200;
        response.body = {
            success:true,
            data:listaCliente,
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

export const postCliente = async(ctx:any)=>{
    const {response,request} = ctx;
    try{
       const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {
            response.status = 400;
            response.body = {success:false,  message:"El cuerpo de la solicitud se encuentra vacío."};
            return;
    }
     const body = await request.body.json();
        const ClienteData = {
            idCliente: null,
            nombre: body.nombre,
            apellido: body.apellido,
            email: body.email,
            telefono: body.telefono
        }
        const objCliente = new Cliente(ClienteData)
        const result = await objCliente.InsertarCliente();
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
export const putCliente = async(ctx: any)=>{
    const {response,request} = ctx;

    try{
        const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {

            response.status = 400;
            response.body = {success: false,  message: "Cuerpo de la solicitud esta vacio"};
            return;
        }

        const body = await request.body.json();
        const ClienteData = {

            idCliente: body.idCliente,
            nombre: body.nombre,
            apellido: body.apellido,
            email: body.email,
            telefono: body.telefono,
        }

        const objCliente = new Cliente(ClienteData);
        const result = await objCliente.ActualizarCliente();
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

export const deleteCliente = async (ctx: any) => {
    const { response, request } = ctx;
    try {
        const contentLength = request.headers.get("Content-Length");
        if (contentLength === "0") {
            response.status = 400;
            response.body = { success: false, message: "El ID del cliente es requerido para eliminarlo" };
            return;
        }

        const body = await request.body.json();
        if (!body.idCliente) {
            response.status = 400;
            response.body = { success: false, message: "El ID del cliente es requerido para eliminarlo" };
            return;
        }

        // Forma más consistente de crear el objeto Cliente para eliminación
        const ClienteData = {
            idCliente: body.idCliente,
            nombre: "",
            apellido: "",
            email: "",
            telefono: ""
        };
        
        const objCliente = new Cliente(ClienteData);
        const result = await objCliente.EliminarCliente();

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