const btn_select = document.querySelector("#select");
// const btn_get_info = document.querySelector('#get_info')
const btn_open = document.querySelector("#open");
const btn_read = document.querySelector("#read");
// const btn_read_get_value = document.querySelector("#get_value");
const btn_closePort = document.querySelector("#closePort");
const btn_refresh = document.querySelector("#refresh");
const btn_click = document.querySelector("#click");
let connection_status = document.querySelector(".connection_status");

let port_selected;
let configValue = {
  baudRate: 1200,
  dataBits: 8,
  stopBits: 2,
};
let isPortClosed = true;

document.addEventListener("DOMContentLoaded", async () => {
  console.log(navigator);
  let ports = await navigator.serial.getPorts();
  
  console.log("ports", ports);
  

  if (ports.length === 0) {
    port_selected = await navigator.serial.requestPort();
  } else {
    port_selected = ports[0];   
  }  
  console.log(port_selected);
  
  if (port_selected) {   
    openPort() 
  }
});

// request to select a serial port and open selected port
btn_select.onclick = async () => {
  let configValue = {
    baudRate: 1200,
    dataBits: 8,
    stopBits: 2,
  };
  // Prompt user to select any serial port.
  port_selected = await navigator.serial.requestPort();
  console.log(port_selected);
  if (port_selected) {
    port_selected.open(configValue);
  }
};

// close port

btn_closePort.onclick = async () => {
  if (port_selected) {
    port_selected.close().catch(err=>console.log(err));
    console.log("port closed");
  }
};
let closePort = async () => {
      console.log("port_selected ", port_selected);

  if (port_selected) {
    port_selected.close().catch(err=>console.log(err));
    console.log("port closed");
  }
};
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){
    console.log("close",document.hidden)
    closePort()
    
  }else{
    console.log("open",document.hidden)
    openPort()
  }
}) 

// open port on button click

btn_open.onclick = async () => {
  let configValue = {
    baudRate: 1200,
    dataBits: 8,
    stopBits: 2,
  };
  port_selected.open(configValue)
  console.log("port opened");
};

// open port

let openPort = async () => {
  let configValue = {
    baudRate: 1200,
    dataBits: 8,
    stopBits: 2,
  };
  port_selected.open(configValue).then(()=>console.log("port opened")).catch(err=>{  
      setTimeout(openPort,100);    
  });
  
};

let response, reading;
// write to selected serial port and return reading
btn_read.onclick = async () => {
  let count = 0;

  let commandStr = new Uint8Array([79, 57, 13, 10]);
  let writer = await port_selected.writable.getWriter();
  // await writer.write(encoder.encode("O90DCRLF"))
  await writer.write(commandStr);
  writer.releaseLock();

  console.log(port_selected.readable);

  if (!port_selected.readable.locked) {
    let reader = await port_selected.readable.getReader();
    let dataCodeArr = [];

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock();
        break;
      }

      // console.log("joined value", value?.join(","));
      count = +1;
      if (value) {
        for (let i of value) {
          if (i === 13 && dataCodeArr.length < 4) {
            // "response" : "A00"
            // console.log("dataCodeArr: ", dataCodeArr);
            response = dataCodeArr.join("");
            dataCodeArr = [];
          } else if (i === 10) {// \n
            continue;
          } else if (i == 13 && dataCodeArr.length > 3) {
            // reading : number
            // console.log("dataCodeArr: ", dataCodeArr);
            reading = dataCodeArr.join("");
            dataCodeArr = [];
          } else {
            dataCodeArr.push(String.fromCharCode(i));
          }
        }

        alertMsg({ response: response, reading: reading })
        response = null;
        reading = null;
      }
    }
  }
  response = null;
  reading = null;
};

function alertMsg(msg) {
  if (msg.reading?.length > 1) {
    document.querySelector(".reading").innerHTML = msg.reading
    console.log("========================");
    console.log(msg);
    console.log("========================");
  }
  response = null;
  reading = null;
}
