// My Imports
import * as configPrivate from './config.private.js'
import * as config from './config'
import {
    ProfesionalAndes
} from './profesionalAndes'
import {
    matching
} from '@andes/match';

// Imports 3rd Parties
let mongoClient = require('mongodb').MongoClient;
let mongoXlsx = require('mongo-xlsx');

let model = null;
let url = configPrivate.urlMongoAndes;
let coleccion = configPrivate.collection;
let profesionalOperations = new ProfesionalAndes();
let unToken = 1;

mongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Error al conectarse a la base de datos', err);
        db.close();
    }
    mongoXlsx.xlsx2MongoData(config.xlsx, model, function (err, solapas) {
        solapas.forEach(datos => {
            if (datos.numeroDocumento) {
                let profXLS = {
                    documento: datos.numeroDocumento,
                    nombre: datos.nombre,
                    apellido: datos.apellido,
                    matriculas: [{
                        numero: datos.matricula,
                        descripcion: datos.especialidad
                    }],
                    legajo: datos.legajo ? datos.legajo : '',
                    codigoSisa: datos.codigoSisa ? datos.sisa : '',
                    activo: datos.activo,
                    contacto: [{
                            tipo: 'celular',
                            valor: datos.telefono ? datos.telefono : '',
                            activo: true
                        },
                        {
                            tipo: 'email',
                            valor: datos.mail ? datos.mail : '',
                            activo: true
                        }
                    ],
                };
                // Condición de búsqueda para ver si el profesinal ya existe en la BD    
                let condicion = {
                    'documento': datos.numeroDocumento,
                };
                db.collection(coleccion).find(condicion).toArray(function (err, profesionalEncontrado: any) {
                    if (profesionalEncontrado.length > 0) {
                        let profDB = profesionalEncontrado[0];
                        let match = new matching();
                        let valorMatching = match.matchPersonas(profDB, profXLS, config.weights, config.algorithms);
                        if (valorMatching > 0.9) {
                            console.log('id', profDB._id);
                            profesionalOperations.updateProfesional(profXLS, profDB._id)
                                .then((rta: any) => {
                                    console.log('Entro para hacer el update del paciente ', profXLS);
                                })
                        } else {
                            profesionalOperations.addProfesional(profXLS)
                                .then((rta: any) => {
                                    console.log('Entro para hacer un insert del paciente ', profXLS);
                                })
                        }
                    } else {
                        // Si no encontró ningún registro directamente lo inserta en la BD
                        profesionalOperations.addProfesional(profXLS)
                            .then((rta: any) => {
                                console.log('Entro para hacer un insert del paciente ', profXLS);
                            })

                    }
                })

            }

        });
        db.close();
    })

})