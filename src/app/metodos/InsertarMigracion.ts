import { NextResponse } from "next/server";
import { getConnection,sql } from "../database/db";
import { pool } from "mssql";

export async function INSERT(
  numero: string,
  nombre_completo: string,
  nombres: string,
  apellido_materno: string,
  apellido_paterno: string,
  tipo:string
) {
  const fecha_actual = new Date();
  const fechaFormateada = fecha_actual.toLocaleDateString().split('T')[0];

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("cCodEmp", sql.VarChar(2), '01')
      .input("cTipAna", sql.VarChar(2), tipo)
      .input("cCodigo", sql.VarChar(11), numero)
      .input("cNombre", sql.VarChar(50), nombre_completo)
      .input("cDireccion", sql.VarChar(100), '')
      .input("cTelefono", sql.VarChar(60), '')
      .input("dFecha", fechaFormateada)
      .input("cRUC", sql.VarChar(11), numero)
      .input("cFax", sql.VarChar(60), '')
      .input("cRubPro", sql.VarChar(60), '')
      .input("cAtencion", sql.VarChar(50), '')
      .input("cMoneda", sql.VarChar(1), 'S')
      .input("cForPag", sql.VarChar(2), '')
      .input("cHabilitar", sql.VarChar(1), 'N')
      .input("cCorreo", sql.VarChar(50), '')
      .input("cTipoAgRet", sql.VarChar(1), '2')
      .input("cTipoPersona", sql.VarChar(1), '1')
      .input("cApeMat", sql.VarChar(30), apellido_materno)
      .input("cApePat", sql.VarChar(30), apellido_paterno)
      .input("cNom", sql.VarChar(30), nombres)
      .output("cMsgRetorno", sql.VarChar(100))
      .input("cTipoDoc", sql.VarChar(2), '1')
      .execute("spu_Con_Ins_Cuenta_Corriente");

    return NextResponse.json({
      mensaje: result.output["@cMsgRetorno"],
      data: result.recordset,
    });
  } catch (e) {
    console.error('Error:', e);
    return NextResponse.json({ error: 'Error en la consulta' }, { status: 500 });
  }
}


