// deno-lint-ignore-file
import { replaceParams } from "https://deno.land/x/sql_builder@v1.9.1/util.ts";
import { ensureDir,extname } from "../Dependencies/dependencias.ts";

export const uploadFile = async(ctx:any) =>{
    const {response,request} = ctx;

    try{

        //Verifica que el contenido sea multipart/form-data, es el formato especial que usan los navegadores para enviar archivos.
        const contentType = request.headers.get("content-type");
        if(!contentType || !contentType.includes("multipart/form-data")){
            response.status = 400;
            response.body = {

                success:false,
                message:"Content-type debe ser multiplataforma"
            };
            return;

        }

        //Extraer el archivo del FormData

        const formData = await request.body.formData();
        const file = formData.get("file") as File;

        if(!file || !file.name){
            response.status = 400;
            response.body = {
                success:false,
                MessageChannel:"No se encontro el archivo en el campo file"
            };
            return;

        }

        //Validar tipos de archivo permitidos
        const allowedTypes = ["image/jpeg","image/png","image/gif","image/webp","application/pdf","text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

        if(!allowedTypes.includes(file.type)){
            response.status = 400;
            response.body = {
                success:false,
                message: `Tipo de archivo no permitido: ${file.type}.Tipos permitidos:imagenes,PDF,texto,Word`
            };
            return;

        }

        //Validar tamaño maximo (5MB)
        const maxSize = 5 * 1024 * 1024;//5MB
        if(file.size > maxSize){
            response.status = 400;
            response.body = {
                success:false,
                message:"El archivo es demasiado grande (Maximo 5MB)"
            };
            return;

        }

        //Crear directorio de uploads/subidas si no existe

        const uploadDir = "./subidas";
        await ensureDir(uploadDir);

        //Generar nombre unico para el arhivo

        const timestamp = Date.now();//momento actual en milisegundos
        const extension = extname(file.name);//extensión del archivo original (.jpg, .pdf, etc.)
        const uniqueId = crypto.randomUUID();//identificador único aleatorio
        const fileName =  `${timestamp}_${uniqueId}${extension}`;//Combina todo
        const filePath = `${uploadDir}/${fileName}`;


        //convertir y guardar el archivo

        const arrayBuffer = await file.arrayBuffer();//convierte archivo a datos binarios
        const fileData = new Uint8Array(arrayBuffer);//formato que entiende Deno
        await Deno.writeFile(filePath,fileData);//escribe al disco

        //Respuesta exitosa

        response.status = 200;
        response.body = {
            success:true,
            message: "Archivo subido correctamente",
            data:{
                originalName:file.name,
                fileName:fileName,
                filePath:filePath,
                size:file.size,
                type:file.type,
                uploadedAt: new Date().toISOString(),
                url: `/files${fileName}`
            }
        };
    }catch(error){
        console.error("Error al subir archivo",error);
        response.status = 500;
        response.body = {
            success:false,
            message:"Error interno del servidor",
            error: error instanceof Error ? error.message : String(error)//Verifica si el error es una instancia de la clase Error
        };
    }

};

     export const getFile = async(ctx:any)=>{
    const {response,params} = ctx;

     try{
        const fileName = params.filename;//params.filename viene de la URL: /files/:filename
        const filePath = `./subidas/${fileName}`;//Construye la ruta completa del archivo

        //Verificar si el archivo existe

        try{
            const fileInfo = await Deno.stat(filePath);//Deno.stat obtiene información del archivo
            if(!fileInfo.isFile){//isFile verifica que sea archivo (no directorio)
                throw new Error("No es un archivo")
            }
        }catch{
            response.status=404;
            response.body = {
                success:false,
                message:"Archivo no encontrado"
            };
            return;
        }

        //lee el archivo del disco como bytes
        const file = await Deno.readFile(filePath);

        //Determina el tipo MIME segun la extension
        const extension = extname(fileName).toLowerCase();
        const mimeTypes:{[Key: string]:string} ={

            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };

        const contentType = mimeTypes[extension] || 'application/octet-stream';

        response.headers.set("Content-Type",contentType);//dice qué tipo de archivo es
        response.headers.set("Content-Length", file.length.toString());//tamaño del archivo
        response.headers.set("Content-Disposition",`inline; filename="${fileName}"`);
        response.body = file;// envía los bytes del archivo

    }catch(error){
        console.error("Error al obtener archivo",error);
        response.status = 500;
        response.body ={
            success:false,
            message:"Error interno del servidor",
            error: error instanceof Error ? error.message : String(error)

        };

    }
};

//Eliminar archivos del servidor

    export const deleteFile = async(ctx:any) => {
        const {response,request} = ctx;

        try{
            const contentLength = request.headers.get("Content-Length");
            if(contentLength === "0"){
                response.status = 400;
                response.body = {
                    success:false,
                    message:"Nombre del archivo requerido"
                };
                return;
            }
            const body = await request.body.json();//Lee el cuerpo de la petición como JSON
            const fileName = body.fileName;//Extrae el nombre del archivo a eliminar

            if(!fileName){
                response.status = 400;
                response.body = {
                    success:false,
                    message:"Nombre del archivo requerido"
                };
                return;
            }
            const filePath = `./subidas/${fileName}`;

            //Verificar que el archivo existe
            try{
                await Deno.stat(filePath);
            }catch{
                response.status = 400;
                response.body = {
                    success:false,
                    message:"Archivo no encontrado"
                };
                return;
            }

            //Eliminar el archivo
            await Deno.remove(filePath);

            response.status = 200;
            response.body = {
                success:true,
                message:"Archivo eliminado correctamente"
            };

        }catch(error){
            console.error("Error al eliminar archivo:",error);
            response.status = 500;
            response.body = {
                success:false,
                message:"Error interno del servidor"
            };
        }
    };

    export const listFiles = async(ctx:any) =>{
        const{response} = ctx;

        try{
            const uploadDir = "./subidas";

            try{
                await ensureDir(uploadDir);
                const files = [];

                for await (const entry of Deno.readDir(uploadDir)){//Deno.readDir lee contenido del directorio
                    if(entry.isFile){//iltra solo archivos (no directorios)
                        const filePath = `${uploadDir}/${entry.name}`;//Combina la ruta del directorio + nombre del archivo
                        const fileInfo = await Deno.stat(filePath);

                        files.push({
                            name:entry.name,
                            size:fileInfo.size,
                            created:fileInfo.birthtime || fileInfo.mtime,
                            modified:fileInfo.mtime,
                            url: `/files/${entry.name}`,
                            sizeFormatted:formatFileSize(fileInfo.size)
                        });

                    }
                }
                //Ordernar por fecha de creacion
                files.sort((a, b) => {
                    return (b.created ? +new Date(b.created) : 0) - (a.created ? +new Date(a.created) : 0);
                });
                response.status = 200;
                response.body = {
                    success:true,
                    data:files,
                    count:files.length
                };

            }catch(error){
                response.status = 200;
                response.body = {
                    success:true,
                    data:[],
                    count:0,
                    message:"Directoria de subidas vacio o no existe"
                };
            }
        }catch(error){
            console.error("Error al listar archivos:",error);
            response.status = 500;
            response.body = {
                success:false,
                message:"Error interno del servidor"
            };
        }
    };

    //Convierte bytes a formato legible
    function formatFileSize(bytes:number): string {
        if(bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes','KB','MB','GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

    }

   

