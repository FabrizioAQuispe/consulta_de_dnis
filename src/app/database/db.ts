import sql from "mssql";

const config = {
    user: "sa",
    password: "123456789",
    server: "192.168.0.199",
    database: "Premium",
    option:{
        encrypt : false,
        trustServerCertificate:true
    }
}

export async function getConnection(){
    try{
        const pool = await sql.connect(config);
    }catch(e){
        console.log("ERROR CONECTION SQL: " + e)
        throw e
    }
}