var PortMonitor = document.getElementById("PortMonitor");
var DataExplorer = document.getElementById("DataExplorer");
var Datalogger = document.getElementById("Datalogger");
var Settings = document.getElementById("Settings");
var Publish = document.getElementById("Publish");
PortMonitor.style.display = "block";
DataExplorer.style.display = "none";
Datalogger.style.display = "none";
Settings.style.display = "flex";
Publish.style.display = "none";

function ShowPublish() {
  Settings.style.display = "none";
  Publish.style.display = "flex";
}
function HidePublish() {
  Publish.style.display = "none";
}

function ShowSettings() {
  Settings.style.display = "flex";
  Publish.style.display = "none";
}

function HideSettings() {
  Settings.style.display = "none";
}

function MenuPortStatus() {
  PortMonitor.style.display = "block";
  DataExplorer.style.display = "none";
  Datalogger.style.display = "none";
  Settings.style.display = "none";
  Publish.style.display = "none";
}

function MenuDataExplorer() {
  PortMonitor.style.display = "none";
  DataExplorer.style.display = "block";
  Datalogger.style.display = "none";
  Settings.style.display = "none";
  Publish.style.display = "none";
}

function MenuDatalogger() {
  PortMonitor.style.display = "none";
  DataExplorer.style.display = "none";
  Datalogger.style.display = "block";
  Settings.style.display = "none";
  Publish.style.display = "none";
}

function foolProofing(ele) {
  switch (ele.id) {
    case "fhost":
      if (ele.value === "") {
        document.getElementById("fbtConnect").classList.add("disableItem");
      } else {
        document.getElementById("fbtConnect").classList.remove("disableItem");
      }
      break;
    case "ftopic":
      if (ele.value === "") {
        document.getElementById("fbtPublish").classList.add("disableItem");
      } else {
        document.getElementById("fbtPublish").classList.remove("disableItem");
      }
      break;
    default:
  }
}
