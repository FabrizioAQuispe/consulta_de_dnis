import sql from 'mssql';

// const config = {
//     user: 'sa',
//     password: 'Mgtebdt9',
//     server: '192.168.0.4', // o IP del servidor
//     database: 'Premium',
//     options: {
//       encrypt: false, // usa true si estás en Azure o con SSL
//       trustServerCertificate: true,
//     },
// }

const config = {
    user: 'sa',
    password: '123456789',
    server: '192.168.0.199', // o IP del servidor
    database: 'Premium',
    options: {
      encrypt: false, // usa true si estás en Azure o con SSL
      trustServerCertificate: true,
    },
}


export async function getConnection(){
    try{
        const pool = await sql.connect(config);
        return pool;
    }catch(e){
        console.log("ERROR CONECTION: " + e)
        throw e;
    }
}

export {sql};