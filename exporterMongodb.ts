import {
    collectionName
} from './config';
// Imports
import * as config from './config.js'
// Require
var MongoClient = require('mongodb').MongoClient;
var mongoXlsx: any = require('mongo-xlsx');

var model = null;
let url = config.urlMongoAndes;
let coleccion = config.collectionName;

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('ERROR BD', err);
        db.close();
    }

    mongoXlsx.xlsx2MongoData(config.xlsx, model, function (err, solapas) {
        solapas.forEach(datos => {

            for (let obraSocial in datos) {
                let os = {
                    nombre: datos[obraSocial].nombre,
                    codigoNacion: (datos[obraSocial].codigoNacion) ? datos[obraSocial].codigoNacion : 'Sin Datos',
                    sigla: datos[obraSocial].sigla ? datos[obraSocial].sigla : 'Sin Datos',
                    domicilio: datos[obraSocial].domicilio ? datos[obraSocial].domicilio : 'Sin Datos',
                    contacto: datos[obraSocial].contacto ? datos[obraSocial].contacto : 'Sin Datos',
                    telefono: datos[obraSocial].telefono ? datos[obraSocial].telefono : 'Sin Datos',
                    cuit: datos[obraSocial].cuit ? datos[obraSocial].cuit : 'Sin Datos'
                }

                db.collection(coleccion).save(os, function (err2, result) {
                    if (err2) {
                        console.log('ERROR ------------->:', err2);
                        db.close();

                    } else {
                        console.log('Se ha insertado:', os);
                        db.close();
                    }

                });
            }
        })
    })
})