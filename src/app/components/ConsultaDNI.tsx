// "use client"
// import React, { useState } from 'react'
// import * as XLSX from 'xlsx';


// interface FormData {
//     numero: string;
//     nombre_completo: string;
//     nombres: string;
//     apellido_paterno: string;
//     apellido_materno: string;
//     tipo:string;
// }

// interface DNIValidado {
//     dni: string;
//     existe: boolean;
// }

// interface APIResponse {
//     success: boolean;
//     data: {
//         numero: string;
//         apellido_materno: string;
//         apellido_paterno: string;
//         nombre_completo: string;
//         nombres: string;
//     };
// }

// const ConsultaDNI: React.FC = () => {
//     const URL_API = "https://apiperu.dev/api/dni";
//     const TOKEN = "3d8bf77c235982cb4635349bc2a2cc8507095c2eaac985540658b40f5491b3d2";

//     const [formData, setFormData] = useState<FormData>({
//         numero: '',
//         nombre_completo: '',
//         nombres: '',
//         apellido_paterno: '',
//         apellido_materno: '',
//         tipo: '01'
//         });

//     const [dnis, setDNIS] = useState<string[]>([]);
//     const [dnisValidados, setDnisValidados] = useState<DNIValidado[]>([]);
//     const [isLoading, setIsLoading] = useState<boolean>(false);

//     // Método para cambiar el estado de los inputs
//     const handleChangeInputs = (e: React.ChangeEvent<HTMLInputElement>): void => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Método para consultar el dni de la sunat
//     const handleSendDNI = async (dni: string): Promise<APIResponse['data'] | null> => {
//         try {
//             setIsLoading(true);
//             const response = await fetch(`${URL_API}`, {
//                 headers: {
//                     "Accept": "application/json",
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${TOKEN}`
//                 },
//                 body: JSON.stringify({ dni: dni }),
//                 method: "POST"
//             });

//             if (!response.ok) {
//                 console.error("ERROR SERVER API handleSendDNI");
//                 return null;
//             }

//             const dataDNIS: APIResponse = await response.json();

//             if (dataDNIS.success) {
//                 const { numero, apellido_materno, apellido_paterno, nombre_completo, nombres } = dataDNIS.data;

//                 setFormData({
//                     numero,
//                     apellido_materno,
//                     apellido_paterno,
//                     nombre_completo,
//                     nombres,
//                     tipo: '01'
//                 });

//                 return dataDNIS.data;
//             }

//             return null;

//         } catch (e) {
//             console.error("ERROR HANDLE SEND DNI: " + e);
//             return null;
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Método para buscar persona por DNI
//     const buscarPersona = async (dni: string): Promise<void> => {
//         const personaData = await handleSendDNI(dni);
//         if (personaData) {
//             console.log("Persona encontrada:", personaData);
//         } else {
//             console.log("Persona no encontrada para DNI:", dni);
//         }
//     };


//     const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = async (evt: ProgressEvent<FileReader>) => {
//             try {
//                 const data = evt.target?.result;
//                 if (!data) return;

//                 const workbook = XLSX.read(data, { type: 'binary' });

//                 const sheetName = workbook.SheetNames[0];
//                 const worksheet = workbook.Sheets[sheetName];

//                 // Convertir a JSON
//                 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//                 const dnisFromExcel: string[] = [];

//                 jsonData.forEach((row: any, index) => {
//                     if (index === 0) return; // Saltar encabezados si los hay

//                     const dni = row[0]?.toString().trim();
//                     if (dni && dni.length === 8 && /^\d+$/.test(dni)) {
//                         dnisFromExcel.push(dni);
//                     }
//                 });

//                 const dnisUnicos = Array.from(new Set(dnisFromExcel));

//                 console.log(`Se cargaron ${dnisUnicos.length} DNIs únicos del archivo`);

//                 setDNIS(dnisUnicos);
//                 setDnisValidados([]); // Limpiar validaciones anteriores

//             } catch (error) {
//                 console.error("Error al procesar el archivo:", error);
//                 alert("Error al procesar el archivo Excel. Asegúrate de que el formato sea correcto.");
//             }
//         };

//         reader.readAsBinaryString(file);
//     };

//     const handleMigrar = async (e: React.MouseEvent<HTMLButtonElement>) => {
//         e.preventDefault();
//         console.log("Migrando datos:", formData);
//         try {
//             const response = await fetch("/api/insertar", {
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 method: "POST",
//                 body: JSON.stringify(formData)
//             });

//             if (!response.ok) {
//                 console.error("NO CARGO LA RESPUESTA DE LA API INSERTAR");
//             }

//             const dataResponse = await response.json();
//             console.log(dataResponse);
//         } catch (error: any) {
//             console.error("ERROR METHOD HANDLE MIGRAR");
//         }
//     };

//     const handleMostrarTipoAnalicis = async (dni: string) => {
//         try {
//             const response = await fetch(`/api/cuenta/${dni}`, {
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 method: "POST",
//                 body: JSON.stringify({ dni })
//             });

//             if (!response.ok) {
//                 console.error("NO CARGO LA RESPUESTA DE LA API LISTAR CUENTA CORRIENTE");
//             }

//             const dataResponse = await response.json();
//             console.log(dataResponse);
//         } catch (error: any) {
//             console.log("ERROR METHOD HANDLE MOSTRAR TIPO ANALICIS")
//         }
//     }

//     const handleBuscarPersonaClick = (dni: string) => (): void => {
//         buscarPersona(dni);
//     };

//     return (
//         <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-4'>
//             <div className='bg-gray-800 p-4 rounded-lg'>
//                 <h2 className='text-2xl text-white mb-4'>Subir Lista de DNIS</h2>
//                 <input
//                     type="file"
//                     onChange={handleUploadExcel}
//                     accept='.xlsx,.xls'
//                     className='mb-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
//                 />

//                 <div className='mt-4 max-h-64 overflow-y-auto'>
//                     <ul className='list-disc ml-6'>
//                         {dnisValidados.length > 0 ? (
//                             dnisValidados.map(({ dni, existe }, index) => (
//                                 <li
//                                     key={index}
//                                     onDoubleClick={handleBuscarPersonaClick(dni)}
//                                     className={`cursor-pointer ${existe ? 'text-green-400' : 'text-red-400'} hover:underline`}
//                                 >
//                                     {dni} - {existe ? 'Existe' : 'No existe'}
//                                 </li>
//                             ))
//                         ) : (
//                             dnis.map((dni, index) => (
//                                 <li
//                                     key={index}
//                                     onDoubleClick={handleBuscarPersonaClick(dni)}
//                                     className='cursor-pointer hover:text-blue-400 text-white'
//                                 >
//                                     {dni}
//                                 </li>
//                             ))
//                         )}
//                     </ul>
//                 </div>
//             </div>

//             <div className='bg-white border rounded-lg p-4 h-fit'>
//                 <div className='flex flex-col space-y-3'>
//                     <h2 className='text-center text-lg font-semibold mb-4'>MIGRAR CUENTA CORRIENTE</h2>

//                     <div>
//                         <label htmlFor="numero" className='block text-sm font-medium text-gray-700 mb-1'>
//                             DNI:
//                         </label>
//                         <input
//                             className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             type="text"
//                             name="numero"
//                             id="numero"
//                             value={formData.numero}
//                             onChange={handleChangeInputs}
//                             placeholder="Ingrese el DNI"
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="nombre_completo" className='block text-sm font-medium text-gray-700 mb-1'>
//                             Nombre Completo:
//                         </label>
//                         <input
//                             className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             type="text"
//                             name="nombre_completo"
//                             id="nombre_completo"
//                             value={formData.nombre_completo}
//                             onChange={handleChangeInputs}
//                             placeholder="Nombre completo"
//                             readOnly
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="nombres" className='block text-sm font-medium text-gray-700 mb-1'>
//                             Nombres:
//                         </label>
//                         <input
//                             className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             type="text"
//                             name="nombres"
//                             id="nombres"
//                             value={formData.nombres}
//                             onChange={handleChangeInputs}
//                             placeholder="Nombres"
//                             readOnly
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="apellido_paterno" className='block text-sm font-medium text-gray-700 mb-1'>
//                             Apellido Paterno:
//                         </label>
//                         <input
//                             className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             type="text"
//                             name="apellido_paterno"
//                             id="apellido_paterno"
//                             value={formData.apellido_paterno}
//                             onChange={handleChangeInputs}
//                             placeholder="Apellido paterno"
//                             readOnly
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="apellido_materno" className='block text-sm font-medium text-gray-700 mb-1'>
//                             Apellido Materno:
//                         </label>
//                         <input
//                             className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             type="text"
//                             name="apellido_materno"
//                             id="apellido_materno"
//                             value={formData.apellido_materno}
//                             onChange={handleChangeInputs}
//                             placeholder="Apellido materno"
//                             readOnly
//                         />
//                     </div>

//                     <div className='flex gap-2 mt-5'>
//                         <button
//                             onClick={handleMigrar}
//                             disabled={isLoading || !formData.numero}
//                             className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors'
//                         >
//                             {isLoading ? 'Procesando...' : 'MIGRAR'}
//                         </button>
//                     </div>

//                     <div className='flex gap-2 mt-5'>
//                         <button
//                         onClick={() => handleMostrarTipoAnalicis(formData.numero)}
//                         className='flex-1 bg-green-800 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors'
//                         >
//                             MOSTRAR TIP_ANA
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ConsultaDNI

"use client"
import React, { useState, useCallback } from 'react'
import * as XLSX from 'xlsx';

interface FormData {
    numero: string;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    tipo: string;
}

interface DNIValidado {
    dni: string;
    existe: boolean;
    status: 'pending' | 'processing' | 'success' | 'error' | 'not_found';
    persona?: FormData;
    error?: string;
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

interface ProgresoMasivo {
    total: number;
    procesados: number;
    exitosos: number;
    errores: number;
    porcentaje: number;
    isRunning: boolean;
}

const ConsultaDNI: React.FC = () => {
    const URL_API = "https://apiperu.dev/api/dni";
    const TOKEN = "8224937ae43fb48bd113dfb576649988b3565273ace5ddd8c0d233855d2e59b4";

    const [formData, setFormData] = useState<FormData>({
        numero: '',
        nombre_completo: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        tipo: '01'
    });

    const [dnis, setDNIS] = useState<string[]>([]);
    const [dnisValidados, setDnisValidados] = useState<DNIValidado[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progreso, setProgreso] = useState<ProgresoMasivo>({
        total: 0,
        procesados: 0,
        exitosos: 0,
        errores: 0,
        porcentaje: 0,
        isRunning: false
    });
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Método para cambiar el estado de los inputs
    const handleChangeInputs = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Método para consultar el dni de la API
    const handleSendDNI = async (dni: string): Promise<APIResponse['data'] | null> => {
        try {
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
                console.error(`ERROR SERVER API handleSendDNI for DNI: ${dni}`);
                return null;
            }

            const dataDNIS: APIResponse = await response.json();

            if (dataDNIS.success && dataDNIS.data) {
                return dataDNIS.data;
            }

            return null;

        } catch (e) {
            console.error(`ERROR HANDLE SEND DNI ${dni}: ${e}`);
            return null;
        }
    };

    // Método para buscar persona individual
    const buscarPersona = async (dni: string): Promise<void> => {
        const personaData = await handleSendDNI(dni);
        if (personaData) {
            setFormData({
                numero: personaData.numero,
                apellido_materno: personaData.apellido_materno,
                apellido_paterno: personaData.apellido_paterno,
                nombre_completo: personaData.nombre_completo,
                nombres: personaData.nombres,
                tipo: '01'
            });
            console.log("Persona encontrada:", personaData);
        } else {
            console.log("Persona no encontrada para DNI:", dni);
        }
    };

    // 🚀 NUEVO: Método para procesar TODOS los DNIs masivamente
    const procesarDNIsMasivo = async (): Promise<void> => {
        if (dnis.length === 0) {
            alert('No hay DNIs cargados para procesar');
            return;
        }

        const controller = new AbortController();
        setAbortController(controller);
        setIsLoading(true);

        // Inicializar progreso
        setProgreso({
            total: dnis.length,
            procesados: 0,
            exitosos: 0,
            errores: 0,
            porcentaje: 0,
            isRunning: true
        });

        // Inicializar estado de DNIs
        const dnisParaProcesar: DNIValidado[] = dnis.map(dni => ({
            dni,
            existe: false,
            status: 'pending'
        }));
        setDnisValidados(dnisParaProcesar);

        const personasEncontradas: FormData[] = [];
        let procesados = 0;
        let exitosos = 0;
        let errores = 0;

        try {
            console.log(`🚀 Iniciando procesamiento masivo de ${dnis.length} DNIs`);

            // Procesar en lotes de 3 para no saturar la API
            const batchSize = 3;
            for (let i = 0; i < dnis.length; i += batchSize) {
                if (controller.signal.aborted) {
                    console.log('❌ Procesamiento cancelado por el usuario');
                    break;
                }

                const lote = dnis.slice(i, i + batchSize);
                console.log(`📦 Procesando lote ${Math.floor(i / batchSize) + 1}: ${lote.join(', ')}`);

                // Procesar lote en paralelo
                const promesasLote = lote.map(async (dni, localIndex) => {
                    const globalIndex = i + localIndex;

                    try {
                        // Marcar como procesando
                        setDnisValidados(prev => prev.map((item, idx) =>
                            idx === globalIndex
                                ? { ...item, status: 'processing' }
                                : item
                        ));

                        // 1. Consultar datos en RENIEC
                        const personaData = await handleSendDNI(dni);

                        if (personaData) {
                            const personaCompleta: FormData = {
                                numero: personaData.numero,
                                apellido_materno: personaData.apellido_materno,
                                apellido_paterno: personaData.apellido_paterno,
                                nombre_completo: personaData.nombre_completo,
                                nombres: personaData.nombres,
                                tipo: '01'
                            };

                            // 2. Insertar en base de datos
                            const responseInsertar = await fetch("/api/insertar", {
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                method: "POST",
                                body: JSON.stringify(personaCompleta),
                                signal: controller.signal
                            });

                            if (responseInsertar.ok) {
                                const resultadoInsercion = await responseInsertar.json();
                                console.log(`✅ DNI ${dni} insertado exitosamente`);

                                personasEncontradas.push(personaCompleta);
                                exitosos++;

                                // Marcar como exitoso
                                setDnisValidados(prev => prev.map((item, idx) =>
                                    idx === globalIndex
                                        ? {
                                            ...item,
                                            status: 'success',
                                            existe: true,
                                            persona: personaCompleta
                                        }
                                        : item
                                ));
                            } else {
                                throw new Error(`Error al insertar en BD: ${responseInsertar.status}`);
                            }
                        } else {
                            throw new Error('No se encontraron datos en RENIEC');
                        }

                    } catch (error: any) {
                        console.error(`❌ Error procesando DNI ${dni}:`, error.message);
                        errores++;

                        // Marcar como error
                        setDnisValidados(prev => prev.map((item, idx) =>
                            idx === globalIndex
                                ? {
                                    ...item,
                                    status: 'error',
                                    existe: false,
                                    error: error.message
                                }
                                : item
                        ));
                    }

                    procesados++;

                    // Actualizar progreso
                    const nuevoPorcentaje = Math.round((procesados / dnis.length) * 100);
                    setProgreso(prev => ({
                        ...prev,
                        procesados,
                        exitosos,
                        errores,
                        porcentaje: nuevoPorcentaje
                    }));
                });

                // Esperar a que termine el lote
                await Promise.all(promesasLote);

                // Pausa entre lotes para no saturar la API
                if (i + batchSize < dnis.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (!controller.signal.aborted) {
                console.log(`🎉 Procesamiento completado: ${exitosos} exitosos, ${errores} errores`);
                alert(`Migración masiva completada!\n✅ Exitosos: ${exitosos}\n❌ Errores: ${errores}\n📊 Total: ${procesados}`);
            }

        } catch (error: any) {
            console.error('❌ Error en procesamiento masivo:', error);
            alert(`Error durante el procesamiento masivo: ${error.message}`);
        } finally {
            setIsLoading(false);
            setProgreso(prev => ({ ...prev, isRunning: false }));
            setAbortController(null);
        }
    };

    // 🛑 Método para detener el procesamiento
    const detenerProcesamiento = () => {
        if (abortController) {
            abortController.abort();
            console.log('🛑 Deteniendo procesamiento...');
        }
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
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const dnisFromExcel: string[] = [];

                jsonData.forEach((row: any, index) => {
                    if (index === 0) return; // Saltar encabezados

                    const dni = row[0]?.toString().trim();
                    if (dni && dni.length === 8 && /^\d+$/.test(dni)) {
                        dnisFromExcel.push(dni);
                    }
                });

                const dnisUnicos = Array.from(new Set(dnisFromExcel));
                console.log(`Se cargaron ${dnisUnicos.length} DNIs únicos del archivo`);

                setDNIS(dnisUnicos);
                setDnisValidados([]); // Limpiar validaciones anteriores
                setProgreso({
                    total: 0,
                    procesados: 0,
                    exitosos: 0,
                    errores: 0,
                    porcentaje: 0,
                    isRunning: false
                });

            } catch (error) {
                console.error("Error al procesar el archivo:", error);
                alert("Error al procesar el archivo Excel. Asegúrate de que el formato sea correcto.");
            }
        };

        reader.readAsBinaryString(file);
    };

    // Migración individual (mantener funcionalidad original)
    const handleMigrar = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log("Migrando datos individuales:", formData);

        setIsLoading(true);
        try {
            const response = await fetch("/api/insertar", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const dataResponse = await response.json();
            console.log('✅ Migración individual exitosa:', dataResponse);
            alert('¡Persona migrada exitosamente!');
        } catch (error: any) {
            console.error("ERROR METHOD HANDLE MIGRAR:", error);
            alert(`Error al migrar: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidarDNIsMasivoOptimizado = async (): Promise<void> => {
        if (dnis.length === 0) {
            alert('No hay DNIs cargados para validar');
            return;
        }

        setIsLoading(true);
        console.log(`🔍 Validando ${dnis.length} DNIs uno por uno`);

        try {
            const resultados: DNIValidado[] = [];

            // Procesar de forma secuencial para no saturar el servidor
            for (const dni of dnis) {
                try {
                    const response = await fetch(`/api/cuenta/${dni}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ dni })
                    });

                    if (response.ok) {
                        const resultado = await response.json();
                        resultados.push({
                            dni,
                            existe: resultado.data && resultado.data.length > 0,
                            status: 'success'
                        });
                    } else {
                        resultados.push({
                            dni,
                            existe: false,
                            status: 'error',
                            error: `HTTP ${response.status}`
                        });
                    }
                } catch (error: any) {
                    resultados.push({
                        dni,
                        existe: false,
                        status: 'error',
                        error: error.message
                    });
                }

                // Pausa pequeña para no saturar
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setDnisValidados(resultados);

            const existentes = resultados.filter(r => r.existe).length;
            alert(`Validación completada!\n✅ Existentes: ${existentes}\n❌ No existentes: ${resultados.length - existentes}`);

        } catch (error: any) {
            console.error('❌ Error en validación:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
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
                    disabled={isLoading}
                    className='mb-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50'
                />

                {/* 🚀 NUEVOS CONTROLES MASIVOS */}
                <div className='mb-4 space-y-2'>
                    <div className='flex gap-2'>
                        <button
                            onClick={procesarDNIsMasivo}
                            disabled={isLoading || dnis.length === 0}
                            className='flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-4 py-2 rounded transition-colors font-semibold'
                        >
                            {isLoading ? '🔄 Procesando...' : '🚀 MIGRAR TODOS'}
                        </button>

                        {isLoading && (
                            <button
                                onClick={detenerProcesamiento}
                                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors'
                            >
                                🛑 Detener
                            </button>
                        )}
                    </div>

                    {/* Barra de progreso */}
                    {progreso.total > 0 && (
                        <div className='bg-gray-700 rounded-lg p-3'>
                            <div className='flex justify-between text-sm text-white mb-2'>
                                <span>Progreso: {progreso.procesados}/{progreso.total}</span>
                                <span>{progreso.porcentaje}%</span>
                            </div>
                            <div className='w-full bg-gray-600 rounded-full h-2'>
                                <div
                                    className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                                    style={{ width: `${progreso.porcentaje}%` }}
                                ></div>
                            </div>
                            <div className='flex justify-between text-xs text-gray-300 mt-1'>
                                <span>✅ Exitosos: {progreso.exitosos}</span>
                                <span>❌ Errores: {progreso.errores}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className='mt-4 max-h-64 overflow-y-auto'>
                    <ul className='list-disc ml-6'>
                        {dnisValidados.length > 0 ? (
                            dnisValidados.map(({ dni, existe, status, error }, index) => (
                                <li
                                    key={index}
                                    onDoubleClick={!isLoading ? handleBuscarPersonaClick(dni) : undefined}
                                    className={`cursor-pointer hover:underline ${status === 'processing' ? 'text-yellow-400' :
                                        status === 'success' ? 'text-green-400' :
                                            status === 'error' ? 'text-red-400' :
                                                existe ? 'text-green-400' : 'text-red-400'
                                        } ${isLoading ? 'opacity-70' : ''}`}
                                    title={error || (status === 'success' ? 'Migrado exitosamente' : '')}
                                >
                                    {status === 'processing' && '🔄 '}
                                    {status === 'success' && '✅ '}
                                    {status === 'error' && '❌ '}
                                    {dni} - {
                                        status === 'processing' ? 'Procesando...' :
                                            status === 'success' ? 'Migrado' :
                                                status === 'error' ? `Error: ${error}` :
                                                    existe ? 'Existe' : 'No existe'
                                    }
                                </li>
                            ))
                        ) : (
                            dnis.map((dni, index) => (
                                <li
                                    key={index}
                                    onDoubleClick={!isLoading ? handleBuscarPersonaClick(dni) : undefined}
                                    className={`cursor-pointer hover:text-blue-400 text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="nombre_completo" className='block text-sm font-medium text-gray-700 mb-1'>
                            Nombre Completo:
                        </label>
                        <input
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'
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
                            {isLoading ? 'Procesando...' : 'MIGRAR INDIVIDUAL'}
                        </button>
                    </div>

                    <div className='flex gap-2 mt-2'>
                        <button
                            onClick={handleValidarDNIsMasivoOptimizado} // ✅ Sin parámetros
                            disabled={isLoading || dnis.length === 0}   // ✅ Validación mejorada
                            className='flex-1 bg-green-800 hover:bg-green-500 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors'
                        >
                            {isLoading ? '🔄 Validando...' : 'VALIDAR TODOS LOS DNIS'}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConsultaDNI