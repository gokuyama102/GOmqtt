const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var statusBroker = false;
setStatusBroker(false);
var cGreen = "green";
var cYellow = "yellow";
var cRed = "red";
var cGreyLight = "lightgrey";
var cGreyDark = "darkgrey";
var cOrange = "orange";
var username = (urlParams.get('username') == null) ? "" : urlParams.get('username');
var password = (urlParams.get('password') == null) ? "" : urlParams.get('password');
var hostname = (urlParams.get('host') == null) ? "" : urlParams.get('host');
var port = (urlParams.get('port') == null) ? 443 : parseInt(urlParams.get('port'));
if (port == NaN) port = 443;

document.getElementById("fname").value = username;
document.getElementById("fpassword").value = password;
document.getElementById("fhost").value = hostname;
document.getElementById("fport").value = port;

var IOLM = new Object();
var IOLMBaseTopic = "";
var log = document.getElementById("log");

function setStatusBroker(setState) {
    statusBroker = setState;
    if (statusBroker) {
        document.getElementById("fbtPublish").classList.remove("disableItem");
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
    return new Date().getHours().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
        + ":" + new Date().getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
        + ":" + new Date().getSeconds().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
}

var t = "<strong>" + timestamp() + " Client started. Waiting for a new connection!</strong>";

log.innerHTML = t + "<br><br>" + log.innerHTML;

function connectBroker() {
    if (statusBroker) {
        client.disconnect();
        var t = "<strong>" + timestamp() + " Disconnected from broker!</strong>";
        log.innerHTML = t + "<br><br>" + log.innerHTML;
    } else {
        HideSettings();
        username = document.getElementById("fname").value;
        password = document.getElementById("fpassword").value;
        hostname = document.getElementById("fhost").value;
        port = parseInt(document.getElementById("fport").value);
        client = new Paho.MQTT.Client(hostname, port, "IOLM_DEMO_" + parseInt(Math.random() * 100, 10));
        var options = {
            useSSL: true,
            userName: username,
            password: password,
            onSuccess: onConnect,
            onFailure: doFail
        }
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
        var t = "<strong>" + timestamp() + " Trying to connect to the broker</strong>";
        log.innerHTML = t + "<br><br>" + log.innerHTML;
        client.connect(options);
    }
}

//var rISDU
function onConnect() {
    console.log("onConnect");
    setStatusBroker(true);
    var t = "<strong>" + timestamp() + " Connected to the broker!</strong>";
    log.innerHTML = t + "<br><br>" + log.innerHTML;
    var t = "<strong>" + timestamp() + " Subscribing to '#' </strong>";
    log.innerHTML = t + "<br><br>" + log.innerHTML;
    client.subscribe("#");
    var t = "<strong>" + timestamp() + " Waiting for new data </strong>";
    log.innerHTML = t + "<br><br>" + log.innerHTML;
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
        t = "<strong>" + timestamp() + " Trying to publish at " + mmessage.destinationName + "</strong>: " + mmessage.payloadString;
        log.innerHTML = t + "<br><br>" + log.innerHTML;
    } else {
        t = "<strong>" + timestamp() + " Failed to publish at " + topic + "!</strong> Please check if the message is a valid JSON: " + message;
        log.innerHTML = t + "<br><br>" + log.innerHTML;
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
        var mmessage = new Paho.MQTT.Message("{\"op\": \"read\",\"index\": 65,\"format\": \"raw\"}");
        mmessage.destinationName = IOLMBaseTopic + "/port/1/isdu/request/index65";
        client.send(mmessage);
    }
}

function doFail(e) {
    console.log(e);
    setStatusBroker(false);
    var t = "<strong>" + timestamp() + " Failed to connect to the broker!</strong> Please, check if username is correct and if the broker is active. Refresh the page to try again.";
    log.innerHTML = t + "<br><br>" + log.innerHTML;
}

function onConnectionLost(responseObject) {
    //clearInterval(rISDU);
    setStatusBroker(false);
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
        var t = "<strong>" + timestamp() + " Lost connection to the broker!</strong>";
        log.innerHTML = t + "<br><br>" + log.innerHTML;
    }
}

function getImgSrc(objectName) {
    switch (objectName) {
        case "NRB4-12GM40-E2-IO-C-V1":
            return "https://files.pepperl-fuchs.com/webcat/navi/productInfo/pd/b243986a.png";
            break;
        case "OMT550-R200-2EP-IO-V1":
            return "https://files.pepperl-fuchs.com/webcat/navi/productInfo/pd/b248653a.png";
            break;
        case "UC6000-30GM-IUEP-IO-V15":
            return "https://files.pepperl-fuchs.com/webcat/navi/productInfo/pd/b235010a.png";
            break;
        case "PMI40-F90-IU2EP-IO-V15":
            return "https://files.pepperl-fuchs.com/webcat/navi/productInfo/pd/b246119a.png";
            break;
        case "OBG5000-R100-2EP-IO-V31":
            return "https://files.pepperl-fuchs.com/webcat/navi/productInfo/pd/b241434a.png";
            break;
        case "IQT1-F61-IO-V1":
            return "https://files.pepperl-fuchs.com/webcat/navi/productInfo/pd/b246502b.png";
            break;
        default:
            return "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D";
            break;
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
    } else if (startsWith(prodName, "NR") ||
        startsWith(prodName, "OB")) {
        return "SS+Qlt";
    } else if (startsWith(prodName, "UC")) {
        return "Dis+SS";
    } else if (startsWith(prodName, "PMI")) {
        return "Dis+SS/PMI";
    } else if (startsWith(prodName, "IQT")) {
        return "RW+Len+Data";
    } else {
        return "Unknown";
    }
}

function addTemplate(prodName, portNum) {
    var prodType = findSensorType(prodName).split("/");

    switch (prodType[0]) {
        case "SS+Qlt":
            return "<br>Switching signal: <a id=\"port" + portNum + "/pdi\"></a>" +
                "<br>Stability: <a id=\"port" + portNum + "/stability\"></a>";
            break;
        case "Dis+SS":
            return "<br>Distance: <a id=\"port" + portNum + "/pdi\"></a>" +
                "<br>Switching signal: <a id=\"port" + portNum + "/signal\"></a>";
            break;
        case "Dis+SS+Qlt":
            return "<br>Distance: <a id=\"port" + portNum + "/pdi\"></a>" +
                "<br>Switching signal: <a id=\"port" + portNum + "/signal\"></a>" +
                "<br>Signal quality: <a id=\"port" + portNum + "/quality\"></a>";
            break;
        case "RW+Len+Data":
            return "<br>Mode: <a id=\"port" + portNum + "/mode\"></a>" +
                "<br>Length: <a id=\"port" + portNum + "/len\"></a>" +
                "<br>Data: <a id=\"port" + portNum + "/pdi\"></a>";
            break;
        default:
            return "<br>PDI: <a id=\"port" + portNum + "/pdi\"></a>";
            break;
    }
}

function onMessageArrived(message) {

    //Datalogger
    t = "<strong>" + timestamp() + " " + message.destinationName + "</strong>: " + message.payloadString;
    log.innerHTML = t + "<br><br>" + log.innerHTML;

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
    console.log(IOLM);

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
                    this.parentElement.querySelector(".nested").classList.toggle("active");
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
        document.getElementById(message.destinationName).innerHTML = JSON.stringify(JSON.parse(message.payloadString), null, 4).replace(/\n/g, "<br>").replace(/ /g, "&nbsp");
    }

    //update IOLM Status
    function findIOLMObject(mObject) {
        path = mObject.split("/");
        var mIOLM = IOLM;

        for (i = 0; i < path.length; i++) {
            mIOLM = mIOLM[path[i]];
        }
        return mIOLM;
    }

    var portNum = message.destinationName.substr(message.destinationName.search("/port/") + 6, 1);
    if (portNum > 0) {
        var IOLMref = findIOLMObject(message.destinationName);
        var mPort = document.getElementById("framePort" + portNum);
        switch (message.destinationName) {
            case IOLMBaseTopic + "/port/" + portNum + "/deviceinfo":
                if (document.getElementById("port" + portNum + "/serial").innerHTML != IOLMref["serial"]) {
                    document.getElementById("port" + portNum + "/prodname").innerHTML = IOLMref["prodname"];
                    document.getElementById("port" + portNum + "/serial").innerHTML = IOLMref["serial"];
                    document.getElementById("pImage" + portNum).src = getImgSrc(IOLMref["prodname"]);

                    document.getElementById("diagPort" + portNum).innerHTML =
                        addTemplate(IOLMref["prodname"], portNum);
                }
                break;
            case IOLMBaseTopic + "/port/" + portNum + "/status":
                document.getElementById("port" + portNum + "/status").innerHTML = IOLMref["status"] + " - " + IOLMref["state"];

                switch (document.getElementById("port" + portNum + "/status").innerHTML) {
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

                if (document.getElementById("port" + portNum + "/prodname").innerHTML != "") {
                    switch (findSensorType(document.getElementById("port" + portNum + "/prodname").innerHTML)) {
                        case "SS+Qlt":
                            var sSignal = IOLMref["raw"][0] & 0b0001;
                            var sStability = (IOLMref["raw"][0] & 0b0010) >> 1;

                            document.getElementById("port" + portNum + "/pdi").innerHTML = sSignal;

                            if (sStability == 1) {
                                document.getElementById("port" + portNum + "/stability").innerHTML = "&nbspAlarm&nbsp";
                                document.getElementById("port" + portNum + "/stability").style.backgroundColor = cYellow;
                            } else {
                                document.getElementById("port" + portNum + "/stability").innerHTML = "&nbspOK&nbsp";
                                document.getElementById("port" + portNum + "/stability").style.backgroundColor = "transparent";
                            }
                            break;

                        case "Dis+SS":
                            var sSignal1 = IOLMref["raw"][1] & 0b0001;
                            var sSignal2 = (IOLMref["raw"][1] & 0b0010) >> 1;
                            var sDistance = ((IOLMref["raw"][0]) << 6) + ((IOLMref["raw"][1] & 0b11111100) >> 2);

                            if (sDistance == 16383) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspNo Echo&nbsp";
                                document.getElementById("port" + portNum + "/pdi").style.backgroundColor = cRed;
                            } else {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbsp" + sDistance + " mm&nbsp";
                                document.getElementById("port" + portNum + "/pdi").style.backgroundColor = cGreen;
                            }

                            document.getElementById("port" + portNum + "/signal").innerHTML = "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2;
                            break;

                        case "Dis+SS/PMI":
                            var sSignal1 = IOLMref["raw"][1] & 0b0001;
                            var sSignal2 = (IOLMref["raw"][1] & 0b0010) >> 1;
                            var sSignal3 = (IOLMref["raw"][1] & 0b0100) >> 2;
                            var sDistance = ((IOLMref["raw"][0]) << 4) + ((IOLMref["raw"][1] & 0b11110000) >> 4);

                            if (sDistance == 4092) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspInsufficient signal quality&nbsp";
                                document.getElementById("port" + portNum + "/pdi").style.backgroundColor = cRed;
                            } else if (sDistance == 4093) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspBelow Detection Range&nbsp";
                                document.getElementById("port" + portNum + "/pdi").style.backgroundColor = cRed;
                            } else if (sDistance == 4094) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspAbove Detection Range&nbsp";
                                document.getElementById("port" + portNum + "/pdi").style.backgroundColor = cRed;
                            } else if (sDistance == 4095) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspNo Damping Element detected&nbsp";
                                document.getElementById("port" + portNum + "/pdi").style.backgroundColor = cRed;
                            } else {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbsp" + (sDistance * 0.05).toFixed(2) + " mm&nbsp";
                                document.getElementById("port" + portNum + "/pdi").style.backgroundColor = cGreen;
                            }

                            document.getElementById("port" + portNum + "/signal").innerHTML = "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2 + "   /   SS3: " + sSignal3;
                            break;

                        case "Dis+SS+Qlt":
                            var sSignal1 = IOLMref["raw"][3] & 0b0001;
                            var sSignal2 = (IOLMref["raw"][3] & 0b0010) >> 1;
                            var sQuality = (IOLMref["raw"][3] & 0b1100) >> 2;
                            var sDistance = ((IOLMref["raw"][0]) << 8) + ((IOLMref["raw"][1]));

                            if (sDistance == 32776) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspOut of Range - Below Range&nbsp";
                            } else if (sDistance == 32760) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspOut of Range - Above Range&nbsp";
                            } else if (sDistance == 32764) {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbspNo Measurement Data&nbsp";
                            } else {
                                document.getElementById("port" + portNum + "/pdi").innerHTML = "&nbsp" + (sDistance * 0.1).toFixed(1) + " mm&nbsp";
                            }

                            if (sQuality == 3) {
                                document.getElementById("port" + portNum + "/quality").innerHTML = "&nbspExcellent&nbsp";
                                document.getElementById("port" + portNum + "/quality").style.backgroundColor = cGreen;
                            } else if (sQuality == 2) {
                                document.getElementById("port" + portNum + "/quality").innerHTML = "&nbspGood&nbsp";
                                document.getElementById("port" + portNum + "/quality").style.backgroundColor = cYellow;
                            } else if (sQuality == 1) {
                                document.getElementById("port" + portNum + "/quality").innerHTML = "&nbspAcceptable&nbsp";
                                document.getElementById("port" + portNum + "/quality").style.backgroundColor = cOrange;
                            } else {
                                document.getElementById("port" + portNum + "/quality").innerHTML = "&nbspInsufficient&nbsp";
                                document.getElementById("port" + portNum + "/quality").style.backgroundColor = cRed;
                            }

                            document.getElementById("port" + portNum + "/signal").innerHTML = "&nbspSS1: " + sSignal1 + "   /   SS2: " + sSignal2;
                            break;

                        case "RW+Len+Data":
                            var sRead = IOLMref["raw"][0] & 0b0001;
                            var sWrite = (IOLMref["raw"][0] & 0b0010) >> 1;
                            var sTaskActive = (IOLMref["raw"][0] & 0b0100) >> 2;
                            var sError = (IOLMref["raw"][0] & 0b1000) >> 3;
                            var sLen = IOLMref["raw"][1];
                            var sData = IOLMref["raw"].slice(4, 32);

                            if (sError == 1) {
                                document.getElementById("port" + portNum + "/mode").innerHTML = "&nbspError&nbsp";
                                document.getElementById("port" + portNum + "/mode").style.backgroundColor = cRed;
                            } else if (sTaskActive == 1) {
                                if (sRead == 1) {
                                    document.getElementById("port" + portNum + "/mode").innerHTML = "&nbspReading TAG&nbsp";
                                } else if (sWrite == 1) {
                                    document.getElementById("port" + portNum + "/mode").innerHTML = "&nbspTAG was Written&nbsp";
                                } else {
                                    document.getElementById("port" + portNum + "/mode").innerHTML = "&nbspActive - No TAG present&nbsp";
                                }
                            } else {
                                document.getElementById("port" + portNum + "/mode").innerHTML = "&nbspInactive&nbsp";
                                document.getElementById("port" + portNum + "/mode").style.backgroundColor = cGreyDark;
                            }

                            document.getElementById("port" + portNum + "/len").innerHTML = sLen;
                            document.getElementById("port" + portNum + "/pdi").innerHTML = sData.slice(0, sLen);
                            break;

                        default:
                            document.getElementById("port" + portNum + "/pdi").innerHTML = IOLMref["raw"];
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
                                document.getElementById("port" + portNum + "/temperature").innerHTML =
                                    "Critical High Temperature";
                                break;
                            case 2:
                                document.getElementById("port" + portNum + "/temperature").innerHTML =
                                    "Overtemperature";
                                break;
                            default:
                                document.getElementById("port" + portNum + "/temperature").innerHTML =
                                    "OK";
                                break;
                        }
                    }
                }
                break;

            default:
        }
    }
}