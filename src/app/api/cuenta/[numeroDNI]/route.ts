import { getConnection } from "@/app/database/db";
import { LISTAR_CUENTA_CORRIENTE } from "@/app/metodos/ConsultarTipAna";
import { NextResponse } from "next/server";

export async function POST(
    request:Request,
    {params} : {params: {dni:string}}
){
    try{
        const dni = params.dni;
        const result = await LISTAR_CUENTA_CORRIENTE(dni);
        
        return NextResponse.json({
            message: "CARGO CORRECTAMENTE LOS DATOS",
            status:404,
            data: result
        });
    }catch(error:any){
        console.error("ERROR SERVER API GET: " + error.message || error);
        return NextResponse.json({
            message: "NO SE CARGO LA DATA",
            status: 500,
            data: null
        })
    }
}