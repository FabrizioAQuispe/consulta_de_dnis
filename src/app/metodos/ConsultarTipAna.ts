import { getConnection } from "../database/db";

export async function LISTAR_CUENTA_CORRIENTE(dni:string){
    try{
        const pool = await getConnection();
        const result = await pool.request()
        .input("dni",dni)
        .query("SELECT * FROM ccm02cta WHERE ccm02cod = @dni")
        
        console.log(result.recordsets)
        return result.recordsets;
    }catch(error:any){
        console.error("ERROR SERVER RESPONSE: " , error.message || error);
        throw error;
    }
}