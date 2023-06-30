const re = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/

const date = new Date();

console.log(date.toISOString())

console.log(re.exec(${date.toISOString()}`)[0]);