const btn_select = document.querySelector("#select");
// const btn_get_info = document.querySelector('#get_info')
const btn_open = document.querySelector("#open");
const btn_read = document.querySelector("#read");
// const btn_read_get_value = document.querySelector("#get_value");
const btn_closePort = document.querySelector("#closePort");
// const btn_refresh = document.querySelector("#refresh");

let port_selected;
let configValue = {
  baudRate: 1200,
  dataBits: 8,
  stopBits: 2,
};
let isPortClosed = true;

// listen to browser and auto connect serial port

document.addEventListener("DOMContentLoaded", async () => {
  let ports = await navigator.serial.getPorts();
  // Populate the UI with options for the user to select or
  // automatically connect to devices.
  console.log("ports", ports);

  if (ports.length === 0) {
    port_selected = await navigator.serial.requestPort();
  } else {
    port_selected = ports[4];
  }

  console.log(port_selected);
  if (port_selected) {

    await port_selected.open(configValue).then(()=>console.log("port opened")).catch(err=>{  
      setTimeout(openPort,100);  }); //return false if opened
    isPortClosed = port_selected.readable.locked; //false if opened
    // document.querySelector(".connection_status").innerHTML = "connected";
  }

  // port_selected = await navigator.serial.requestPort();
  // await port_selected.open({
  //   baudRate: 1200,
  //   dataBits: 8,
  //   stopBits: 2,
  // })

})

// request to select a serial port and open selected port
btn_select.onclick = async () => {
  let configValue = {
    baudRate: 1200,
    dataBits: 8,
    stopBits: 2,
  };
  // Prompt user to select any serial port.
  port_selected = await navigator.serial.requestPort({path:"COM1"});
  console.log(port_selected);
  if (port_selected) {
    port_selected.open(configValue);
  }
 
};

// close port

btn_closePort.onclick = async () => {
  if (port_selected) {
    await port_selected.close();
  }
};

// open port

btn_open.onclick = async () => {
  let configValue = {
    baudRate: 1200,
    dataBits: 8,
    stopBits: 2,
  };
  port_selected.open(configValue);
};

const handlePortConnectFail = async() =>{
  port_selected = await navigator.serial.requestPort()
  await port_selected.open({
    baudRate: 1200,
    dataBits: 8,
    stopBits: 2,
  })
}

// write to selected serial port
btn_read.onclick = async () => {
 
  let count = 0,
    resData = "";
  let response, reading;
  let rrr = {
    response: "",
    reading: "",
  };
  let commandStr = new Uint8Array([79, 57, 13, 10]);
  let writer = await port_selected.writable.getWriter().catch(err=>{
    console.log("retry")
    handlePortConnectFail()});
  await writer.write(commandStr);
  writer.releaseLock();

  console.log(port_selected.readable);

  if (!port_selected.readable.locked) {
    let reader = await port_selected.readable.getReader();
    let dataCodeArr = [];

    while (true) {
     
      const { value, done } = await reader.read();

      if (done) {
        reader.releaseLock();
        break;
      }

      console.log("joined value", value?.join(","));
      if (value) {

        for (let i of value) {
          count = +1;
          if (i === 13 && dataCodeArr.length < 4) {
            // "response" : "A00"
            console.log("dataCodeArr: ", dataCodeArr);
            response = dataCodeArr.join("");
            dataCodeArr = [];
          } else if (i === 10) {
            continue;
          } else if (i == 13 && dataCodeArr.length > 3) {
            // reading
            console.log("dataCodeArr: ", dataCodeArr);
            reading = dataCodeArr.join("");
            dataCodeArr = [];
          } else {
            dataCodeArr.push(String.fromCharCode(i));
           
          }
        }
        alertMsg({ response: response, reading: reading });
      }

     
    }
  
  }

  return {
    response: response,
    reading: reading,
  };
};

function alertMsg(msg) {
  console.log("========================");
  console.log(msg);
  console.log("========================");
}

// const ports = await navigator.serial.getPorts(); 
// if(ports.length==0){ 
    
//   port = await navigator.serial.requestPort(); 
// }else{ 
//     port=ports[0]; 
// } 
// await port.open({ baudRate: 1200 });


