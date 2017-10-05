// My Imports
import * as configPrivate from './config.private.js'
import * as config from './config'
import {
    ProfesionalAndes
} from './profesionalAndes'
import {
    Matching
} from '@andes/match';
import * as moment from 'moment';

// Imports 3rd Parties
let mongoClient = require('mongodb').MongoClient;
let mongoXlsx = require('mongo-xlsx');
let arrayPromesas = [];
let url = configPrivate.urlMongoAndes;
let coleccion = configPrivate.collection;
let model = null;
let contador = 0;

mongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Error al conectarse a la base de datos', err);
        db.close();
    }
    mongoXlsx.xlsx2MongoData(config.xlsx, model, function (err, solapas) {

        solapas.forEach(async datos => {
            let p = new Promise(async(resolve, reject) => {

                let nombreCompleto = datos.Profesional.split(',');
                let profesional = {
                    documento: datos.Documento,
                    nombre: nombreCompleto[1],
                    apellido: nombreCompleto[0],
                    // Convierto la fecha de nacimiento a Date
                    fechaNacimiento: new Date((datos.ProfesionalFechaNacimiento - (25567 + 2)) * 86400 * 1000),
                    contacto: [{
                            tipo: 'celular',
                            valor: datos.ProfesionalTelefonoCelular ? datos.ProfesionalTelefonoCelular : '',
                            activo: true
                        },
                        {
                            tipo: 'email',
                            valor: datos.ProfesionalMail ? datos.ProfesionalMail : '',
                            activo: true
                        }
                    ],
                    // Le voy a asignar lo que dice que tiene de Título
                    rol: datos.ProfesionalTitulo,
                    matriculas: [{
                        numero: datos.ProfesionalMatricula,
                        periodo: {
                            inicio: new Date((datos.ProfesionalFechaAlta - (25567 + 2)) * 86400 * 1000),
                            fin: new Date((datos.ProfesionalFchVtoMatricula - (25567 + 2)) * 86400 * 1000)
                        },
                        // Si no tiene especialidad se asigna título (rol)
                        descripcion: datos.Especialidad ? datos.Especialidad : datos.ProfesionalTitulo
                    }],
                }

                let condicion = {'documento': profesional.documento};
                db.collection(coleccion).find(condicion).toArray(async function (err, profesionalEncontrado: any) {
                    if (profesionalEncontrado.length > 0) {
                        console.log('entra para actualizar: ', profesionalEncontrado)
                        let profDB = profesionalEncontrado[0];
                        let match = new Matching();
                        let valorMatching = await matchPacientes(profesional, profDB);
                        console.log('dps del match ',valorMatching );
                        if (valorMatching > 0.9) {
                            console.log('antes del update');
                            db.collection(coleccion).updateOne({
                                _id: profDB._id
                            }, {

                                $set: {
                                    contacto: profesional.contacto,
                                    matriculas: profesional.matriculas
                                }

                            }, function (err, prof){
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        } else {
                            // Si el matcheo es menor no hago nada
                            resolve()
                        }
                    } else {
                        // Si no existe en la bd lo inserta
                        db.collection(coleccion).insertOne(profesional, function (err, prof) {
                            if (err) {
                                console.log('error', err);
                                reject(err);
                            } else
                            {
                                resolve();
                            }
                        });
                    }
                });
            });

            arrayPromesas.push(p);
        });

        Promise.all(arrayPromesas).then(resultado => {
            console.log('Terminó el proceso');
            db.close();
        })

    })

})

function matchPacientes(pacienteApp, pacienteVinculado) {
    return new Promise((resolve, reject) => {
        let match = new Matching();
        let pacApp = {
            apellido: pacienteApp.apellido,
            nombre: pacienteApp.nombre,
            sexo: pacienteApp.sexo.toUpperCase(),
            fechaNacimiento: pacienteApp.fechaNacimiento,
            documento: pacienteApp.documento
        };
        let pac = {
            apellido: pacienteVinculado.apellido,
            nombre: pacienteVinculado.nombre,
            sexo: pacienteVinculado.sexo.toUpperCase(),
            fechaNacimiento: pacienteVinculado.fechaNacimiento,
            documento: pacienteVinculado.documento
        }
        let valorMatching = match.matchPersonas(pacApp, pac, config.weights, 'Levenshtein');
        if (valorMatching) {
            resolve(valorMatching)
        } else {
            resolve(null)
        }
    })
};












// if (datos.numeroDocumento) {
//     let profXLS = {
//         documento: datos.numeroDocumento,
//         nombre: datos.nombre,
//         apellido: datos.apellido,
//         matriculas: [{
//             numero: datos.matricula,
//             descripcion: datos.especialidad
//         }],
//         legajo: datos.legajo ? datos.legajo : '',
//         codigoSisa: datos.codigoSisa ? datos.sisa : '',
//         activo: datos.activo,
//         contacto: [{
//                 tipo: 'celular',
//                 valor: datos.telefono ? datos.telefono : '',
//                 activo: true
//             },
//             {
//                 tipo: 'email',
//                 valor: datos.mail ? datos.mail : '',
//                 activo: true
//             }
//         ],
//     };
//     // Condición de búsqueda para ver si el profesinal ya existe en la BD  

//     let condicion = {

//         'documento': datos.numeroDocumento,
//     };
//     db.collection(coleccion).find(condicion).toArray(function (err, profesionalEncontrado: any) {
//         if (profesionalEncontrado.length > 0) {
//             let profDB = profesionalEncontrado[0];
//             let match = new matching();
//             let valorMatching = match.matchPersonas(profDB, profXLS, config.weights, config.algorithms);
//             // Tengo que convertir el valor numérico del documento a string
//             profXLS.documento = String(profXLS.documento);
//             if (valorMatching > 0.9) {
//                 profesionalOperations.updateProfesional(profXLS, profDB._id)
//                     .then((rta: any) => {
//                         cantProfesionalesActualizados = cantProfesionalesActualizados + 1;
//                         console.log('Entro para hacer el update del paciente ', cantProfesionalesActualizados, 'valor Match: ', valorMatching);
//                     })
//             } else {
//                 profesionalOperations.addProfesional(profXLS)
//                     .then((rta: any) => {
//                         cantProfesionalesNuevoBajoMatch = cantProfesionalesNuevoBajoMatch + 1;
//                         console.log('Entro para hacer un insert por bajo % ', cantProfesionalesNuevoBajoMatch, 'valor Match: ', valorMatching);
//                     })
//             }
//         } else {
//             // Si no encontró ningún registro directamente lo inserta en la BD

//             // Tengo que convertir el valor numérico del documento a string
//             profXLS.documento = String(profXLS.documento);

//             profesionalOperations.addProfesional(profXLS)
//                 .then((rta: any) => {
//                     cantProfesionalesNuevos = cantProfesionalesNuevos + 1;
//                     console.log('Entro para hacer un insert del paciente ', cantProfesionalesNuevos);
//                 })

//         }
//     })

// }