# xlsMongoDb
Tiene como objetivo poder migrar datos desde archivos en formato EXCEL *.xlsx a una base de datos Mongodb.
## Instalación
```bash
# Linux / Windows
Primero clonamos el proyecto desde GITHUB

1 - git clone https://github.com/RedTICS/xlsMongoDb.git
2 - sudo npm install

```
## Precondiciones

Deberá tener funcionando una base de datos mongodb, además deberá crear un archivo config.private.ts donde deberá exportar las constantes de connectionString y collection.

## Archivo excel

Debe tenerse en cuenta que este programa si bien permite parsear cualquier archivo excel donde cada objeto es transformado a JSON. Debe realizarse la implementación particular de lo que se quiera resolver.

### Profesionales

En este caso, contamos con la información de un listado de profesionales con campos específicos. El archivo debe copiarse en la carpeta /files. Tener en cuenta que por el momento funciona sólo para esta estructura de datos.

## Transpilación y ejecución del programa

Para generar los archivos .js ejecutamos la siguiente instrucción
1) tsc -p .

Luego ejecutamos el programa

2) node profesionalesFromXlsToMongoDb.js


