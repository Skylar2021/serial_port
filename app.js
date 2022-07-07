// import { SerialPort } from 'serialport';
const { SerialPort } = require('serialport')


SerialPort.list().then(ports => {
    ports.forEach(function(port) {
        console.log(port.path)
        console.log(port)
    })
})

const port = new SerialPort({
    path: "COM1",
    baudRate: 1200,
    autoOpen: true,
    
})

let reading = port.read()
console.log("readable:",port.readable)
console.log("reading:",reading)

// port.on('data', function(chunk) {
//     console.log(chunk);
// });
// port.on('error', function(err) {
//     sendData(500, err.message);
// });
