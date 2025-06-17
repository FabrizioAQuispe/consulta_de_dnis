import { getConnection } from "@/app/database/db";
import { LISTAR_CUENTA_CORRIENTE } from "@/app/metodos/ConsultarTipAna";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { dnis } = await request.json();
        
        if (!Array.isArray(dnis) || dnis.length === 0) {
            return NextResponse.json({
                message: "Array de DNIs requerido",
                status: 400,
                data: null
            });
        }

        console.log(`🔍 Validando ${dnis.length} DNIs masivamente`);
        
        // Procesar DNIs en paralelo con límite
        const resultados = await Promise.allSettled(
            dnis.map(async (dni: string) => {
                try {
                    const result = await LISTAR_CUENTA_CORRIENTE(dni);
                    return {
                        dni,
                        existe: result,
                        data: result
                    };
                } catch (error:any) {
                    return {
                        dni,
                        existe: false,
                        error: error.message
                    };
                }
            })
        );

        const dnis_existentes = resultados
            .filter((result, index) => 
                result.status === 'fulfilled' && result.value.existe
            )
            .map((result, index) => 
                result.status === 'fulfilled' ? result.value.dni : null
            )
            .filter(Boolean);

        const dnis_no_existentes = resultados
            .filter((result, index) => 
                result.status === 'fulfilled' && !result.value.existe
            )
            .map((result, index) => 
                result.status === 'fulfilled' ? result.value.dni : null
            )
            .filter(Boolean);

        return NextResponse.json({
            message: "Validación masiva completada",
            status: 200,
            data: {
                total: dnis.length,
                existentes: dnis_existentes.length,
                no_existentes: dnis_no_existentes.length,
                dnis_existentes,
                dnis_no_existentes,
                detalles: resultados
            }
        });

    } catch (error: any) {
        console.error("ERROR SERVER API VALIDAR MASIVO: " + (error.message || error));
        return NextResponse.json({
            message: "Error en validación masiva",
            status: 500,
            data: null
        });
    }
}