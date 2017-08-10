import * as http from 'http';
import * as configPrivate from './config.private';

export class ProfesionalAndes {
    addProfesional(profesional: any) {
        return new Promise((resolve: any, reject: any) => {
            let options = {
                host: configPrivate.hostApi,
                port: configPrivate.portApi,
                path: configPrivate.pathProfesional,
                // Authentication: token,
                method: 'POST',
                headers: {
                    // 'Authorization': token,
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function(res) {
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API en insert: ' + e.message + ' ----- ', e);
                reject(e.message);
            });
            /*write data to request body*/
            req.write(JSON.stringify(profesional));
            req.end();
        });

    };
    updateProfesional(profesional: any, id) {
        return new Promise((resolve: any, reject: any) => {
            let identificador = id;
            console.log('El id por parametro', identificador);
            let options = {
                host: configPrivate.hostApi,
                port: configPrivate.portApi,
                path: configPrivate.pathProfesional + '/' + identificador,
                method: 'PUT',
                headers: {
                    // 'Authorization': token,
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function(res) {
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API en update : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
            /*write data to request body*/
            req.write(JSON.stringify(profesional));
            req.end();
        });

    };

    /*No debería borrarse un paciente de mpi pero dejamos implementado el método por las dudas*/
    deleteProfesional(profesional: any) {
        return new Promise((resolve: any, reject: any) => {
            let options = {
                host: configPrivate.hostApi,
                port: configPrivate.portApi,
                path: configPrivate.pathProfesional + '/' + profesional._id,
                method: 'DELETE',
                headers: {
                    // 'Authorization': token,
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function(res) {
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
           req.end();
        });
    }
}
