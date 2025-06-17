import { INSERT } from "@/app/metodos/InsertarMigracion";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { numero, nombre_completo, nombres, apellido_materno, apellido_paterno, tipo } = body;
        const result = await INSERT(numero, nombre_completo, nombres, apellido_materno, apellido_paterno,tipo);

        return result;
    } catch (error) {
        console.log("ERROR EN LA API INSERTAR POST: " + error)
        return NextResponse.json({ error: "Ocurrió un error al migrar datos" }, { status: 500 });
    }
}