"use client"
import React, { useState } from 'react'
import * as XLSX from 'xlsx';


interface FormData {
    numero: string;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
}

interface DNIValidado {
    dni: string;
    existe: boolean;
}

interface APIResponse {
    success: boolean;
    data: {
        numero: string;
        apellido_materno: string;
        apellido_paterno: string;
        nombre_completo: string;
        nombres: string;
    };
}

const ConsultaDNI: React.FC = () => {
    const URL_API = "https://apiperu.dev/api/dni";
    const TOKEN = "3d8bf77c235982cb4635349bc2a2cc8507095c2eaac985540658b40f5491b3d2";

    const [formData, setFormData] = useState<FormData>({
        numero: "",
        nombre_completo: "",
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
    });

    const [dnis, setDNIS] = useState<string[]>([]);
    const [dnisValidados, setDnisValidados] = useState<DNIValidado[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Método para cambiar el estado de los inputs
    const handleChangeInputs = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Método para consultar el dni de la sunat
    const handleSendDNI = async (dni: string): Promise<APIResponse['data'] | null> => {
        try {
            setIsLoading(true);
            const response = await fetch(`${URL_API}`, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${TOKEN}`
                },
                body: JSON.stringify({ dni: dni }),
                method: "POST"
            });

            if (!response.ok) {
                console.error("ERROR SERVER API handleSendDNI");
                return null;
            }

            const dataDNIS: APIResponse = await response.json();

            if (dataDNIS.success) {
                const { numero, apellido_materno, apellido_paterno, nombre_completo, nombres } = dataDNIS.data;
                
                setFormData({
                    numero,
                    apellido_materno,
                    apellido_paterno,
                    nombre_completo,
                    nombres
                });

                return dataDNIS.data;
            }

            return null;

        } catch (e) {
            console.error("ERROR HANDLE SEND DNI: " + e);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Método para buscar persona por DNI
    const buscarPersona = async (dni: string): Promise<void> => {
        const personaData = await handleSendDNI(dni);
        if (personaData) {
            console.log("Persona encontrada:", personaData);
        } else {
            console.log("Persona no encontrada para DNI:", dni);
        }
    };

    // Método para validar todos los DNIs
    const validarTodosDNIs = async (): Promise<void> => {
        if (dnis.length === 0) {
            alert("No hay DNIs para validar. Por favor, sube un archivo Excel primero.");
            return;
        }

        setIsLoading(true);
        const resultados: DNIValidado[] = [];

        for (const dni of dnis) {
            try {
                const persona = await handleSendDNI(dni);
                resultados.push({
                    dni,
                    existe: persona !== null
                });
                
                // Pequeña pausa para no saturar la API
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                resultados.push({
                    dni,
                    existe: false
                });
            }
        }

        setDnisValidados(resultados);
        setIsLoading(false);
    };

const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt: ProgressEvent<FileReader>) => {
        try {
            const data = evt.target?.result;
            if (!data) return;

            const workbook = XLSX.read(data, { type: 'binary' });
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const dnisFromExcel: string[] = [];
            
            jsonData.forEach((row: any, index) => {
                if (index === 0) return; // Saltar encabezados si los hay
                
                const dni = row[0]?.toString().trim();
                if (dni && dni.length === 8 && /^\d+$/.test(dni)) {
                    dnisFromExcel.push(dni);
                }
            });
            
            const dnisUnicos = Array.from(new Set(dnisFromExcel));
            
            console.log(`Se cargaron ${dnisUnicos.length} DNIs únicos del archivo`);
            
            setDNIS(dnisUnicos);
            setDnisValidados([]); // Limpiar validaciones anteriores
            
        } catch (error) {
            console.error("Error al procesar el archivo:", error);
            alert("Error al procesar el archivo Excel. Asegúrate de que el formato sea correcto.");
        }
    };
    
    reader.readAsBinaryString(file);
};

    const handleMigrar = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        console.log("Migrando datos:", formData);
        // Aquí implementarías la lógica de migración
    };

    const handleBuscarPersonaClick = (dni: string) => (): void => {
        buscarPersona(dni);
    };

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-4'>
            <div className='bg-gray-800 p-4 rounded-lg'>
                <h2 className='text-2xl text-white mb-4'>Subir Lista de DNIS</h2>
                <input 
                    type="file" 
                    onChange={handleUploadExcel} 
                    accept='.xlsx,.xls'
                    className='mb-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
                
                <button
                    onClick={validarTodosDNIs}
                    disabled={isLoading || dnis.length === 0}
                    className='bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-4 py-2 rounded mb-4 block'
                >
                    {isLoading ? 'Validando...' : 'Validar Todos los DNIs'}
                </button>

                <div className='mt-4 max-h-64 overflow-y-auto'>
                    <ul className='list-disc ml-6'>
                        {dnisValidados.length > 0 ? (
                            dnisValidados.map(({ dni, existe }, index) => (
                                <li
                                    key={index}
                                    onDoubleClick={handleBuscarPersonaClick(dni)}
                                    className={`cursor-pointer ${existe ? 'text-green-400' : 'text-red-400'} hover:underline`}
                                >
                                    {dni} - {existe ? 'Existe' : 'No existe'}
                                </li>
                            ))
                        ) : (
                            dnis.map((dni, index) => (
                                <li 
                                    key={index}
                                    onDoubleClick={handleBuscarPersonaClick(dni)} 
                                    className='cursor-pointer hover:text-blue-400 text-white'
                                >
                                    {dni}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            <div className='bg-white border rounded-lg p-4 h-fit'>
                <div className='flex flex-col space-y-3'>
                    <h2 className='text-center text-lg font-semibold mb-4'>MIGRAR CUENTA CORRIENTE</h2>
                    
                    <div>
                        <label htmlFor="numero" className='block text-sm font-medium text-gray-700 mb-1'>
                            DNI:
                        </label>
                        <input 
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                            type="text" 
                            name="numero" 
                            id="numero"
                            value={formData.numero}
                            onChange={handleChangeInputs}
                            placeholder="Ingrese el DNI"
                        />
                    </div>

                    <div>
                        <label htmlFor="nombre_completo" className='block text-sm font-medium text-gray-700 mb-1'>
                            Nombre Completo:
                        </label>
                        <input 
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                            type="text" 
                            name="nombre_completo" 
                            id="nombre_completo"
                            value={formData.nombre_completo}
                            onChange={handleChangeInputs}
                            placeholder="Nombre completo"
                            readOnly
                        />
                    </div>

                    <div>
                        <label htmlFor="nombres" className='block text-sm font-medium text-gray-700 mb-1'>
                            Nombres:
                        </label>
                        <input 
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                            type="text" 
                            name="nombres" 
                            id="nombres"
                            value={formData.nombres}
                            onChange={handleChangeInputs}
                            placeholder="Nombres"
                            readOnly
                        />
                    </div>

                    <div>
                        <label htmlFor="apellido_paterno" className='block text-sm font-medium text-gray-700 mb-1'>
                            Apellido Paterno:
                        </label>
                        <input 
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                            type="text" 
                            name="apellido_paterno" 
                            id="apellido_paterno"
                            value={formData.apellido_paterno}
                            onChange={handleChangeInputs}
                            placeholder="Apellido paterno"
                            readOnly
                        />
                    </div>

                    <div>
                        <label htmlFor="apellido_materno" className='block text-sm font-medium text-gray-700 mb-1'>
                            Apellido Materno:
                        </label>
                        <input 
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                            type="text" 
                            name="apellido_materno" 
                            id="apellido_materno"
                            value={formData.apellido_materno}
                            onChange={handleChangeInputs}
                            placeholder="Apellido materno"
                            readOnly
                        />
                    </div>

                    <div className='flex gap-2 mt-5'>
                        <button 
                            onClick={handleMigrar}
                            disabled={isLoading || !formData.numero}
                            className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors'
                        >
                            {isLoading ? 'Procesando...' : 'MIGRAR'}
                        </button>
                        <button 
                            onClick={validarTodosDNIs}
                            disabled={isLoading || dnis.length === 0}
                            className='flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors'
                        >
                            VALIDAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConsultaDNI