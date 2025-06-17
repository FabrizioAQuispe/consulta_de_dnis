import { LISTAR_CUENTA_CORRIENTE } from "@/app/metodos/ConsultarTipAna";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { dni: string } }
) {
    try {
        const dni = params.dni;
        const result = await LISTAR_CUENTA_CORRIENTE(dni);
        console.log("=======LISTANDO LOS TIPO DE ANALICIS DE LA BD========")
        return NextResponse.json({result});
    } catch (error) {
        return NextResponse.json(
            { error: "Ocurrió un error al migrar datos" },
            { status: 500 }
        );
    }
}