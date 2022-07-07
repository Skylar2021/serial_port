const btn_select = document.querySelector("#select");
// const btn_get_info = document.querySelector('#get_info')
const btn_open = document.querySelector("#open");
const btn_read = document.querySelector("#read");
// const btn_read_get_value = document.querySelector("#get_value");
const btn_closePort = document.querySelector("#closePort");
const btn_refresh = document.querySelector("#refresh");

// let port = navigator.serial
let port_selected;
let configValue = {
  baudRate: 1200,
  dataBits: 8,
  stopBits: 2,
};
let isPortClosed = true;

// listen to browser and auto connect serial port

// navigator.serial.getPorts().then((ports) => {
//     console.log(ports)
//     // Initialize the list of available ports with `ports` on page load.
// });

navigator.serial.addEventListener("connect", (e) => {
    // Add |e.target| to the UI or automatically connect.
    console.log("connect", e);
  
    // if(port_selected){
    //     console.log(port_selected.readable)
    //     port_selected.open(configValue);
    // }
    console.log("connect", port_selected);
  });
  
  navigator.serial.addEventListener("disconnect", (e) => {
    console.log("disconnect", e);
    // Remove |e.target| from the UI. If the device was open the
    // disconnection can also be observed as a stream error.
    console.log("disconnect", port_selected);
  });

document.addEventListener("DOMContentLoaded", async () => {
  let ports = await navigator.serial.getPorts();
  // Populate the UI with options for the user to select or
  // automatically connect to devices.
  console.log("ports", ports);
  // console.log("ports",ports[0])

  if (ports.length === 0) {
    port_selected = await navigator.serial.requestPort();
  } else {
    port_selected = ports[0];
    // console.log("port_selected ", port_selected);
  }

  // console.log("port_selected get signal",navigator.serial)
  console.log(port_selected);
  // console.log(port_selected.readable);
  if (port_selected) {
    // console.log(port_selected.readable)

    // await port_selected.close(configValue);
    await port_selected.open(configValue); //return false if opened
    isPortClosed = port_selected.readable.locked; //false if opened
    document.querySelector(".connection_status").innerHTML = "connected";
    // console.log("port_selected 1", port_selected.readable.locked);
    // console.log("123");
  }
//   if (isPortClosed) {
//     console.log("refresh");
//     history.go();
//   }
  // console.log("port_selected locked",port_selected?.readable?.locked)
  // console.log("port_selected 2",port_selected.readable)
  // console.log(port_selected)
})

// while(isPortClosed){
//     document.querySelector(".connection_status").innerHTML = "connected";
// }

setTimeout(()=>{

    document.addEventListener("DOMContentLoaded", async () => {
        console.log("refresh");
      let connection_status = document.querySelector(".connection_status").innerHTML;
      if (connection_status === "disconnect" || connection_status === "") {
        console.log("refresh");
            // window.location.reload();
        // document.location.reload();
        // history.go();
      }
    });

},100)

btn_refresh.onclick = () => {};
navigator.serial.addEventListener("connect", (e) => {
  // Add |e.target| to the UI or automatically connect.
  console.log("connect", e);

  // if(port_selected){
  //     console.log(port_selected.readable)
  //     port_selected.open(configValue);
  // }
  console.log("connect", port_selected);
});

navigator.serial.addEventListener("disconnect", (e) => {
  console.log("disconnect", e);
  // Remove |e.target| from the UI. If the device was open the
  // disconnection can also be observed as a stream error.
  console.log("disconnect", port_selected);
});

// btn_get_info.onclick = async () => {
//     // Prompt user to select any serial port.
//     // port = await navigator.serial.requestPort();

//     // console.log(navigator)
//     console.log(port)
//     // console.log(port.getInfo())
// }

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
  //   const { usbProductId, usbVendorId } = port_selected.getInfo();
  //   console.log(usbProductId, usbVendorId);
};

// forget port

btn_closePort.onclick = async () => {
  if (port_selected) {
    port_selected.close();
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

// write to selected serial port
btn_read.onclick = async () => {
  // let isWrite = await port_selected.writable
  // const encoder = new TextEncoder();
  let count = 0,
    resData = "";
  let response, reading;
  let rrr = {
    response: "",
    reading: "",
  };
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
      // let isRead = await port_selected.readable

      const { value, done } = await reader.read();

      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock();
        break;
      }

      // console.log(value);
      console.log("joined value", value?.join(","));
      if (value) {
        // console.log(value?.length);
        // let res = value?.map((code) => parseInt(code));
        // console.log("res: ", res);
        // data = String.fromCharCode(value);
        // console.log("data: ", data);
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
            // console.log(i, String.fromCharCode(i));
            dataCodeArr.push(String.fromCharCode(i));
            // dataCodeArr.push(i);
            // console.log("dataCodeArr: ", dataCodeArr);
          }
        }
        // console.log({ "response": response, "reading": reading });
        alertMsg({ response: response, reading: reading });
      }

      // let data = new Uint8Array
      // console.log(value);
      // console.log("resData: ", resData.join(""))
    }
    // console.log({ "result":reading ? "0": "-1" ,"response": response, "reading": reading });
    //console.log({ "2response": response, "reading": reading });

    // console.log("rrr: ", rrr)
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

// let readFromBal = async () =>{

//     let isRead = await port_selected.readable
//     let reader = await port_selected.readable.getReader()
//     while(1){
//         const { value, done } = await reader.read();
//         if (done) {
//             // Allow the serial port to be closed later.
//             reader.releaseLock();
//             break;
//         }
//         // value is a Uint8Array.
//         console.log(value);
//         // let data = new Uint8Array
//         // console.log(value);
//     }
// }

// while(true){
//     readFromBal()
// }

/*
btn_read_get_value.onclick = async () => {
  let isRead = await port_selected.readable;
  let reader = await port_selected.readable.getReader();
  while (1) {
    const { value, done } = await reader.read();
    if (done) {
      // Allow the serial port to be closed later.
      reader.releaseLock();
      break;
    }
    // value is a Uint8Array.
    console.log(value);
    let data = new Uint8Array();
    // console.log(value);
  }
  // reader.releaseLock();

  console.log("readable:");
  console.log(isRead);
  console.log("reader:");
  console.log(reader);
};
*/
// btn_get_value.onclick = async () => {
//     let data = new Uint8Array([79,57,13,10])
//     let anyValue = await port_selected.writable.getWriter().write(data)
// console.log("anyValue:")
// console.log(anyValue)

// }

// Read from a serial port by pressing "print" button on balance

/*
// select a serial port
btn_select.onclick = async () => {
    // Prompt user to select any serial port.
    port_selected = await navigator.serial.requestPort();
    console.log(port_selected)
    
}
// open port
btn_open.onclick = async () => {
    let configValue = {
        baudRate: 1200,
        dataBits: 8,
        stopBits: 2,        
    }
    port_selected.open(configValue)
    console.log(port_selected)
}

// read from selected serial port
btn_read_get_value.onclick = async () => {
    let isRead = await port_selected.readable
    let reader = await port_selected.readable.getReader()
    while(1){
        const { value, done } = await reader.read();
        if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
        }
        // value is a Uint8Array.
        console.log(value);
        let data = new Uint8Array
        // console.log(value);
    }
    // reader.releaseLock();
    
    console.log("readable:")
    console.log(isRead)
    console.log("reader:")
    console.log(reader)
}

btn_get_value.onclick = async () => {
    let anyValue = await port_selected.readable.getReader().read()
console.log("anyValue:")
console.log(anyValue)
}

*/
