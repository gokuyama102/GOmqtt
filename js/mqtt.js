const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var statusBroker = false;
setStatusBroker(false);
var cGreen = "rgb(150, 252, 116)";
var cYellow = "rgb(253, 255, 107)";
var cRed = "rgb(255, 73, 41)";
var cGreyLight = "lightgrey";
var cGreyDark = "darkgrey";
var cOrange = "argb(255, 198, 107,1)";
var username =
  urlParams.get("username") == null ? "" : urlParams.get("username");
var password =
  urlParams.get("password") == null ? "" : urlParams.get("password");
var hostname = urlParams.get("host") == null ? "" : urlParams.get("host");
var port =
  urlParams.get("port") == null ? 443 : parseInt(urlParams.get("port"));

if (port == NaN) port = 443;

document.getElementById("fname").value = username;
document.getElementById("fpassword").value = password;
document.getElementById("fhost").value = hostname;
document.getElementById("fport").value = port;

if (document.getElementById("fhost").value === "")
  document.getElementById("fbtConnect").classList.add("disableItem");
var IOLM = new Object();
var historyPDI = [[], [], [], [], [], [], [], []];
scatterChart.data.datasets[0].data = historyPDI[1];
const maxHistoryPDI = 30;
var IOLMBaseTopic = "";
var log = document.getElementById("log");

function setStatusBroker(setState) {
  statusBroker = setState;
  if (statusBroker) {
    if (document.getElementById("ftopic").value === "") {
      document.getElementById("fbtPublish").classList.add("disableItem");
    } else {
      document.getElementById("fbtPublish").classList.remove("disableItem");
    }
    document.getElementById("fname").classList.add("disableItem");
    document.getElementById("fpassword").classList.add("disableItem");
    document.getElementById("fhost").classList.add("disableItem");
    document.getElementById("fport").classList.add("disableItem");
    document.getElementById("fbtConnect").innerHTML = "Disconnect";
  } else {
    document.getElementById("fbtPublish").classList.add("disableItem");
    document.getElementById("fname").classList.remove("disableItem");
    document.getElementById("fpassword").classList.remove("disableItem");
    document.getElementById("fhost").classList.remove("disableItem");
    document.getElementById("fport").classList.remove("disableItem");
    document.getElementById("fbtConnect").innerHTML = "Connect";
  }
}

function timestamp() {
  return (
    new Date().getHours().toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    }) +
    ":" +
    new Date().getMinutes().toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    }) +
    ":" +
    new Date()
      .getSeconds()
      .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })
  );
}
addNewLogEntry("Client started. Waiting for a new connection!");
if (urlParams.get("autoconnect") != null) {
  connectBroker();
}
function connectBroker() {
  if (statusBroker) {
    client.disconnect();
    addNewLogEntry("Disconnected from broker!");
  } else {
    HideSettings();
    IOLMBaseTopic = "";
    username = document.getElementById("fname").value;
    password = document.getElementById("fpassword").value;
    hostname = document.getElementById("fhost").value;
    port = parseInt(document.getElementById("fport").value);
    client = new Paho.MQTT.Client(
      hostname,
      port,
      "IOLM_DEMO_" + parseInt(Math.random() * 100, 10)
    );
    var options = {
      useSSL: true,
      userName: username,
      password: password,
      onSuccess: onConnect,
      onFailure: doFail,
    };
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    addNewLogEntry("Trying to connect to the broker");
    showStatus("Connecting");
    client.connect(options);
  }
}

//var rISDU
function onConnect() {
  console.log("onConnect");
  setStatusBroker(true);
  addNewLogEntry("Connected to the broker!");
  showStatus("Connected!");
  addNewLogEntry("Subscribing to '#'");
  client.subscribe("#");
  addNewLogEntry("Waiting for new data");
  setTimeout(closeStatus, 7000);
  //rISDU = setInterval(requestISDU, 10000);
}

function publish(topic, message, qos, retain) {
  if (IsJsonString(message)) {
    var mmessage = new Paho.MQTT.Message(message);
    mmessage.destinationName = topic;
    mmessage.qos = parseInt(qos);
    mmessage.retain = retain;
    client.send(mmessage);
    console.log(mmessage);
    addNewLogEntryWithValue(
      "Trying to publish at " + mmessage.destinationName,
      mmessage.payloadString
    );
  } else {
    addNewLogEntryWithValue(
      "Failed to publish at " + topic + "!",
      "Please check if the message is a valid JSON: " + message
    );
  }
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function requestISDU() {
  if (IOLM[IOLMBaseTopic]["port"]["1"]["status"]["state"] == "Operate") {
    var mmessage = new Paho.MQTT.Message(
      '{"op": "read","index": 65,"format": "raw"}'
    );
    mmessage.destinationName = IOLMBaseTopic + "/port/1/isdu/request/index65";
    client.send(mmessage);
  }
}

function doFail(e) {
  console.log(e);
  setStatusBroker(false);
  addNewLogEntryWithValue(
    "Failed to connect to the broker!",
    "Please, check if username is correct and if the broker is active. Refresh the page to try again."
  );
}

function onConnectionLost(responseObject) {
  //clearInterval(rISDU);
  setStatusBroker(false);
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
    addNewLogEntry("Lost connection to the broker!");
  }
}

function getImgSrc(objectName) {
  var source = JSON.parse(sensorImg);
  var link = source[objectName];
  if (link != undefined) {
    return link;
  } else {
    return "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D";
  }
}

function startsWith(prodName, expression) {
  if (prodName.slice(0, expression.length) == expression) {
    return true;
  } else {
    return false;
  }
}

function findSensorType(prodName) {
  if (startsWith(prodName, "OMT")) {
    return "Dis+SS+Qlt";
  } else if (startsWith(prodName, "NR") || startsWith(prodName, "OB")) {
    return "SS+Qlt";
  } else if (startsWith(prodName, "UC")) {
    return "Dis+SS";
  } else if (startsWith(prodName, "PMI")) {
    return "Dis+SS/PMI";
  } else if (startsWith(prodName, "IQT")) {
    return "RW+Len+Data";
  } else if (startsWith(prodName, "ENA58TL")) {
    return "ENA58TL";
  } else {
    return prodName;
  }
}

function addTemplate(prodName, portNum) {
  var prodType = findSensorType(prodName).split("/");
  switch (prodType[0]) {
    case "SS+Qlt":
      return (
        '<br>Switching signal: <a id="port' +
        portNum +
        '/pdi"></a>' +
        '<br>Stability: <a id="port' +
        portNum +
        '/stability"></a>'
      );
      break;
    case "Dis+SS":
      return (
        '<br>Distance: <a id="port' +
        portNum +
        '/pdi"></a>' +
        '<br>Switching signal: <a id="port' +
        portNum +
        '/signal"></a>'
      );
    case "Dis+SS+Qlt":
      return (
        '<br>Distance: <a id="port' +
        portNum +
        '/pdi"></a>' +
        '<br>Switching signal: <a id="port' +
        portNum +
        '/signal"></a>' +
        '<br>Signal quality: <a id="port' +
        portNum +
        '/quality"></a>'
      );
      break;
    case "RW+Len+Data":
      return (
        '<br>Mode: <a id="port' +
        portNum +
        '/mode"></a>' +
        '<br>Length: <a id="port' +
        portNum +
        '/len"></a>' +
        '<br>Data: <a id="port' +
        portNum +
        '/pdi"></a>'
      );
      break;
    case "ENA58TL":
      return (
        '<br>Position: <a id="port' +
        portNum +
        '/position"></a>' +
        '<br>Direction: <a id="port' +
        portNum +
        '/direction"></a>' +
        '<br>Temperature: <a id="port' +
        portNum +
        '/temperature"></a>'
      );
      break;
    case "iTHERM CompactLine TM311":
      return (
        '<br>Temperature: <a id="port' +
        portNum +
        '/Temp"></a>' +
        '<br>Switching signal: <a id="port' +
        portNum +
        '/signal"></a>' +
        '<br>Diagnostic: <a id="port' +
        portNum +
        '/Diagnostic"></a>'
      );
    case "Ceraphant":
      return (
        '<br>Pressure: <a id="port' +
        portNum +
        '/pressure"></a>' +
        '<br>Switching signal: <a id="port' +
        portNum +
        '/signal"></a>'
      );
    case "Picomag":
      return (
        '<br>Switching signal: <a id="port' +
        portNum +
        '/signal"></a>' +
        '<br>Temperature: <a id="port' +
        portNum +
        '/temperature"></a>' +
        '<br>Volume Flow: <a id="port' +
        portNum +
        '/volumeflow"></a>' +
        '<br>Totalizer: <a id="port' +
        portNum +
        '/totalizer"></a>' +
        '<br>Conductivity: <a id="port' +
        portNum +
        '/conductivity"></a>'
      );
    case "Liquipoint":
      return (
        '<br>Coverage: <a id="port' +
        portNum +
        '/coverage"></a>' +
        '<br>Switching signal: <a id="port' +
        portNum +
        '/signal"></a>'
      );
    default:
      return '<br>PDI: <a id="port' + portNum + '/pdi"></a>';
  }
}

function findIOLMObject(mObject) {
  path = mObject.split("/");
  var mIOLM = IOLM;

  for (i = 0; i < path.length; i++) {
    mIOLM = mIOLM[path[i]];
    if (mIOLM == undefined) return "undefined";
  }
  return mIOLM;
}

function addNewLogEntryWithValue(boldText, valueText) {
  var text =
    "<strong>" + timestamp() + " " + boldText + "</strong> " + valueText;
  log.innerHTML = text + "<br><br>" + log.innerHTML;
}

function addNewLogEntry(boldText) {
  var text = "<strong>" + timestamp() + " " + boldText + "</strong>";
  log.innerHTML = text + "<br><br>" + log.innerHTML;
}

function onMessageArrived(message) {
  //Datalogger
  addNewLogEntryWithValue(message.destinationName, message.payloadString);

  //Parsing IOLM data
  path = message.destinationName.split("/");
  var mIOLM = IOLM;
  if (IOLMBaseTopic == "") {
    IOLMBaseTopic = path[0];
  }
  for (i = 0; i < path.length - 1; i++) {
    if (mIOLM[path[i]] === undefined) {
      mIOLM[path[i]] = new Object();
    }
    mIOLM = mIOLM[path[i]];
  }

  mIOLM[path[path.length - 1]] = JSON.parse(message.payloadString);
  //console.log(IOLM);

  //Pass data to tree view
  var treeView = document.getElementById("myUL");
  //path exists?
  //if not, create path
  if (document.getElementById(message.destinationName) === null) {
    var mItem = path.shift();
    var relativePath = mItem;
    var pElement = treeView;
    for (var i = path.length; i >= 0; i--) {
      if (document.getElementById(relativePath) === null) {
        var newLI = document.createElement("li");
        var newSpan = document.createElement("span");
        var newUL = document.createElement("ul");
        newUL.id = relativePath;
        newUL.className = "nested";
        newSpan.className = "caret";
        newSpan.innerHTML = mItem;
        newSpan.addEventListener("click", function () {
          this.parentElement
            .querySelector(".nested")
            .classList.toggle("active");
          this.classList.toggle("caret-down");
        });
        newLI.appendChild(newSpan);
        newLI.appendChild(newUL);
        pElement.appendChild(newLI);
      }
      pElement = document.getElementById(relativePath);
      mItem = path.shift();
      relativePath = relativePath + "/" + mItem;
    }
  }
  //if yes, update data
  if (document.getElementById(message.destinationName) != null) {
    document.getElementById(message.destinationName).innerHTML = JSON.stringify(
      JSON.parse(message.payloadString),
      null,
      4
    )
      .replace(/\n/g, "<br>")
      .replace(/ /g, "&nbsp");
  }

  //update IOLM Monitor

  var portNum = message.destinationName.substr(
    message.destinationName.search("/port/") + 6,
    1
  );
  if (portNum > 0) {
    var IOLMref = findIOLMObject(message.destinationName);
    var mPort = document.getElementById("framePort" + portNum);
    switch (message.destinationName) {
      case IOLMBaseTopic + "/port/" + portNum + "/deviceinfo":
        if (
          document.getElementById("port" + portNum + "/serial").innerHTML !=
          IOLMref["serial"]
        ) {
          setFramePortValue(
            portNum,
            "prodname",
            IOLMref["prodname"],
            "transparent"
          );
          setFramePortValue(
            portNum,
            "serial",
            IOLMref["serial"],
            "transparent"
          );
          document.getElementById("pImage" + portNum).src = getImgSrc(
            IOLMref["prodname"]
          );

          document.getElementById("diagPort" + portNum).innerHTML = addTemplate(
            IOLMref["prodname"],
            portNum
          );
        }
        break;
      case IOLMBaseTopic + "/port/" + portNum + "/status":
        setFramePortValue(
          portNum,
          "status",
          IOLMref["status"] + " - " + IOLMref["state"],
          "transparent"
        );

        switch (
          document.getElementById("port" + portNum + "/status").innerHTML
        ) {
          case "Inactive - CommLost":
            mPort.style.backgroundColor = cRed;
            break;
          case "Inactive - Init":
            mPort.style.backgroundColor = cGreyDark;
            break;
          default:
            mPort.style.backgroundColor = cGreyLight;
            break;
        }

        break;
      case IOLMBaseTopic + "/port/" + portNum + "/pdi":
        historyPDI[portNum - 1].push({
          x: Date.now(),
          y: IOLMref["uint"],
        });

        if (historyPDI[portNum - 1].length > maxHistoryPDI) {
          historyPDI[portNum - 1].shift();
        }
        if (portNum == 2) {
          /* scatterChart.data.datasets[0].data = historyPDI[1]; */
          scatterChart.update();
        }

        if (
          document.getElementById("port" + portNum + "/prodname").innerHTML !=
          ""
        ) {
          switch (
            findSensorType(
              document.getElementById("port" + portNum + "/prodname").innerHTML
            )
          ) {
            case "SS+Qlt":
              var sSignal = IOLMref["raw"][0] & 0b0001;
              var sStability = (IOLMref["raw"][0] & 0b0010) >> 1;

              setFramePortValue(portNum, "pdi", sSignal);

              if (sStability == 1) {
                setFramePortValue(
                  portNum,
                  "stability",
                  "&nbspAlarm&nbsp",
                  cYellow
                );
              } else {
                setFramePortValue(
                  portNum,
                  "stability",
                  "&nbspOK&nbsp",
                  "transparent"
                );
              }
              break;
            case "Dis+SS":
              var sSignal1 = IOLMref["raw"][1] & 0b0001;
              var sSignal2 = (IOLMref["raw"][1] & 0b0010) >> 1;
              var sDistance =
                (IOLMref["raw"][0] << 6) +
                ((IOLMref["raw"][1] & 0b11111100) >> 2);
              if (sDistance == 16383) {
                setFramePortValue(portNum, "pdi", "&nbspNo Echo&nbsp", cRed);
              } else {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbsp" + sDistance + " mm&nbsp",
                  "transparent"
                );
              }

              setFramePortValue(
                portNum,
                "signal",
                "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2
              );
              break;
            case "Dis+SS/PMI":
              var sSignal1 = IOLMref["raw"][1] & 0b0001;
              var sSignal2 = (IOLMref["raw"][1] & 0b0010) >> 1;
              var sSignal3 = (IOLMref["raw"][1] & 0b0100) >> 2;
              var sDistance =
                (IOLMref["raw"][0] << 4) +
                ((IOLMref["raw"][1] & 0b11110000) >> 4);

              if (sDistance == 4092) {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbspInsufficient signal quality&nbsp",
                  cRed
                );
              } else if (sDistance == 4093) {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbspBelow Detection Range&nbsp",
                  cRed
                );
              } else if (sDistance == 4094) {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbspAbove Detection Range&nbsp",
                  cRed
                );
              } else if (sDistance == 4095) {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbspNo Damping Element detected&nbsp",
                  cRed
                );
              } else {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbsp" + (sDistance * 0.05).toFixed(2) + " mm&nbsp",
                  cGreen
                );
              }
              setFramePortValue(
                portNum,
                "signal",
                "&nbspSS1: " +
                  sSignal1 +
                  "   /   SS2: " +
                  sSignal2 +
                  "   /   SS3: " +
                  sSignal3
              );
              break;
            case "Dis+SS+Qlt":
              var sSignal1 = IOLMref["raw"][3] & 0b0001;
              var sSignal2 = (IOLMref["raw"][3] & 0b0010) >> 1;
              var sQuality = (IOLMref["raw"][3] & 0b1100) >> 2;
              var sDistance = (IOLMref["raw"][0] << 8) + IOLMref["raw"][1];

              if (sDistance == 32776) {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbspOut of Range - Below Range&nbsp"
                );
              } else if (sDistance == 32760) {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbspOut of Range - Above Range&nbsp"
                );
              } else if (sDistance == 32764) {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbspNo Measurement Data&nbsp"
                );
              } else {
                setFramePortValue(
                  portNum,
                  "pdi",
                  "&nbsp" + (sDistance * 0.1).toFixed(1) + " mm&nbsp"
                );
              }

              if (sQuality == 3) {
                setFramePortValue(
                  portNum,
                  "quality",
                  "&nbspExcellent&nbsp",
                  cGreen
                );
              } else if (sQuality == 2) {
                setFramePortValue(
                  portNum,
                  "quality",
                  "&nbspGood&nbsp",
                  cYellow
                );
              } else if (sQuality == 1) {
                setFramePortValue(
                  portNum,
                  "quality",
                  "&nbspAcceptable&nbsp",
                  cOrange
                );
              } else {
                setFramePortValue(
                  portNum,
                  "quality",
                  "&nbspInsufficient&nbsp",
                  cRed
                );
              }
              setFramePortValue(
                portNum,
                "signal",
                "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2
              );
              break;
            case "RW+Len+Data":
              var sRead = IOLMref["raw"][0] & 0b0001;
              var sWrite = (IOLMref["raw"][0] & 0b0010) >> 1;
              var sTaskActive = (IOLMref["raw"][0] & 0b0100) >> 2;
              var sError = (IOLMref["raw"][0] & 0b1000) >> 3;
              var sLen = IOLMref["raw"][1];
              var sData = IOLMref["raw"].slice(4, 32);

              if (sError == 1) {
                setFramePortValue(portNum, "mode", "&nbspError&nbsp", cRed);
              } else if (sTaskActive == 1) {
                if (sRead == 1) {
                  setFramePortValue(
                    portNum,
                    "mode",
                    "&nbspReading TAG&nbsp",
                    "transparent"
                  );
                } else if (sWrite == 1) {
                  setFramePortValue(
                    portNum,
                    "mode",
                    "&nbspTAG was Written&nbsp",
                    "transparent"
                  );
                } else {
                  setFramePortValue(
                    portNum,
                    "mode",
                    "&nbspActive - No TAG present&nbsp",
                    "transparent"
                  );
                }
              } else {
                setFramePortValue(
                  portNum,
                  "mode",
                  "&nbspInactive&nbsp",
                  cGreyDark
                );
              }

              setFramePortValue(portNum, "len", sLen, "transparent");
              setFramePortValue(
                portNum,
                "pdi",
                sData.slice(0, sLen),
                "transparent"
              );
              break;
            case "ENA58TL":
              var sPosition =
                (IOLMref["raw"][4] << 24) +
                (IOLMref["raw"][5] << 16) +
                (IOLMref["raw"][6] << 8) +
                IOLMref["raw"][7];
              var sDirection = (IOLMref["raw"][11] & 0b0100) >> 2;
              var sTemperature =
                (IOLMref["raw"][0] << 24) +
                (IOLMref["raw"][1] << 16) +
                (IOLMref["raw"][2] << 8) +
                IOLMref["raw"][3];

              setFramePortValue(portNum, "position", sPosition, "transparent");
              if (sDirection == 1) {
                setFramePortValue(
                  portNum,
                  "direction",
                  "CounterClockwise",
                  "transparent"
                );
              } else {
                setFramePortValue(
                  portNum,
                  "direction",
                  "Clockwise",
                  "transparent"
                );
              }
              setFramePortValue(
                portNum,
                "temperature",
                sTemperature,
                "transparent"
              );
              break;
            case "iTHERM CompactLine TM311":
              var sSignal = IOLMref["raw"][3] & 0b0001;
              var sStatus = (IOLMref["raw"][3] & 0b11110) >> 1;
              var sTemperature = (IOLMref["raw"][0] << 8) + IOLMref["raw"][1];
              setFramePortValue(
                portNum,
                "Temp",
                sTemperature / 10 + " °C",
                "transparent"
              );
              setFramePortValue(portNum, "signal", sSignal, "transparent");
              setFramePortValue(portNum, "Diagnostic", sStatus, "transparent");
              break;
            case "Ceraphant":
              var sSignal1 = IOLMref["raw"][3] & 0b0001;
              var sSignal2 = (IOLMref["raw"][3] & 0b0010) >> 1;
              var sPressure =
                (IOLMref["raw"][0] << 22) +
                (IOLMref["raw"][1] << 14) +
                (IOLMref["raw"][1] << 6) +
                (IOLMref["raw"][0] >> 2);
              setFramePortValue(portNum, "pressure", sPressure, "transparent");
              setFramePortValue(
                portNum,
                "signal",
                "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2
              );
              break;
            case "Liquipoint":
              var sSignal1 = (IOLMref["raw"][0] & 0b01000000) >> 6;
              var sSignal2 = (IOLMref["raw"][0] & 0b10000000) >> 7;
              var sCoverage =
                ((IOLMref["raw"][0] & 0b00111111) << 8) + IOLMref["raw"][1];

              setFramePortValue(
                portNum,
                "coverage",
                "&nbsp" + sCoverage / 10 + " %&nbsp",
                "transparent"
              );

              setFramePortValue(
                portNum,
                "signal",
                "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2
              );
              break;
            case "Picomag":
              var sSignal1 = (IOLMref["raw"][14] & 0b00000100) >> 2;
              var sSignal2 = (IOLMref["raw"][14] & 0b00001000) >> 3;
              var sTemperature =
                ((IOLMref["raw"][12] << 8) + IOLMref["raw"][13]) / 10;
              var sVolumeflow = getFloatValue(IOLMref["raw"].slice(8, 12));
              var sTotalizer = getFloatValue(IOLMref["raw"].slice(4, 8));
              var sConductivity = getFloatValue(IOLMref["raw"].slice(0, 4));

              setFramePortValue(
                portNum,
                "temperature",
                "&nbsp" + sTemperature + " °C&nbsp",
                "transparent"
              );
              setFramePortValue(
                portNum,
                "volumeflow",
                "&nbsp" + sVolumeflow + "  l/s&nbsp",
                "transparent"
              );
              setFramePortValue(
                portNum,
                "totalizer",
                "&nbsp" + sTotalizer + " &nbsp",
                "transparent"
              );
              setFramePortValue(
                portNum,
                "conductivity",
                "&nbsp" + sConductivity + " µS/cm&nbsp",
                "transparent"
              );
              setFramePortValue(
                portNum,
                "signal",
                "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2
              );
              break;
            default:
              setFramePortValue(portNum, "pdi", IOLMref["raw"], "transparent");
              break;
          }
        } else {
          document.getElementById("diagPort" + portNum).innerHTML = "";
        }
        break;
      case IOLMBaseTopic + "/port/" + portNum + "/isdu/response/index65":
        if (portNum < 3) {
          if (IOLMref["status"] == "OK") {
            switch (IOLMref["raw"][4]) {
              case 1:
                document.getElementById(
                  "port" + portNum + "/temperature"
                ).innerHTML = "Critical High Temperature";
                break;
              case 2:
                document.getElementById(
                  "port" + portNum + "/temperature"
                ).innerHTML = "Overtemperature";
                break;
              default:
                setFramePortValue(portNum, "temperature", "OK");
                break;
            }
          }
        }
        break;
      default:
    }
  }
}

function setFramePortValue(portN, field, value, color) {
  document.getElementById("port" + portN + "/" + field).innerHTML = value;
  if (color != undefined) {
    document.getElementById(
      "port" + portN + "/" + field
    ).style.backgroundColor = color;
  }
}

function getFloatValue(data) {
  var buf = new ArrayBuffer(4);
  var view = new DataView(buf);
  data.forEach(function (b, i) {
    view.setUint8(i, b);
  });
  return view.getFloat32(0);
}
