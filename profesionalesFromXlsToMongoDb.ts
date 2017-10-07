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

        solapas.forEach(datos => {
            let p = new Promise((resolve, reject) => {

                let nombreCompleto = datos.Profesional.split(',');

                // Creo el DTO de profesional
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

                let condicion = {
                    'documento': datos.Documento
                };

                db.collection(coleccion).findOne(condicion)
                    .then(async function (profesionalEncontrado) {
                        console.log(profesionalEncontrado);
                        if (profesionalEncontrado) {
                            let match = new Matching();
                            let valorMatching = await matchPacientes(profesional, profesionalEncontrado);
                            if (valorMatching > 0.9) {
                                db.collection(coleccion).updateOne({
                                    _id: profesionalEncontrado._id
                                }, {

                                    $set: {
                                        contacto: profesional.contacto,
                                        matriculas: profesional.matriculas
                                    }

                                }, function (err, prof) {
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
                                } else {
                                    resolve();
                                }
                            });
                        }
                    })

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
        try {
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
        } catch (e) {
            console.log('Error paso por catch', e);
            resolve();
        }
    })
};

