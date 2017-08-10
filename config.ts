export const xlsx = './files/profesionales.xlsx';
export const algorithms = 'Levenshtein';
// Estos pesos se deben a que no tenemos los datos de fecha de nacimiento y sexo en el excel
export const weights = {
    identity: 0.6,
    name: 0.4,
    gender: 0,
    birthDate: 0
};