export const xlsx = './files/profesionales2.xlsx';
export const algorithms = 'Levenshtein';
// Estos pesos se deben a que no tenemos los datos de fecha de nacimiento y sexo en el excel
export const weights = {
    identity: 0.3,
    name: 0.4,
    gender: 0,
    birthDate: 0.3
};