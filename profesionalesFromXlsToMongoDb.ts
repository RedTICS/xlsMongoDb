// Imports
import * as configPrivate from './config.private.js'
import * as config from './config'
// Require
var MongoClient = require('mongodb').MongoClient;
var mongoXlsx: any = require('mongo-xlsx');

var model = null;
let url = configPrivate.urlMongoAndes;
let coleccion = configPrivate.collectionName;

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('ERROR BD', err);
        db.close();
    }

    mongoXlsx.xlsx2MongoData(config.xlsx, model, function (err, solapas) {
        solapas.forEach(datos => {
            if (datos.numeroDocumento) {
            // Sólo importamos los que tengan documento y lo utilizo como clave para futuras actualizaciones con SAVE
                let prof = {
                    _id: datos.numeroDocumento,
                    documento: datos.numeroDocumento,
                    apellido: datos.apellido,
                    nombre: datos.nombre,
                    matricula: datos.matricula,
                    legajo: datos.legajo,
                    codigoSisa: datos.codigoSisa,
                    activo: datos.activo,
                    telefono: datos.telefono,
                    mail: datos.mail,
                    especialidad: datos.especialidad
                }

                db.collection(coleccion).save(prof, function (err2, result) {
                    if (err2) {
                        console.log('ERROR ------------->:', err2);
                        db.close();

                    } else {
                        console.log('Se ha insertado:', prof);
                        db.close();
                    }

                });
            }
            
        })
    })
})