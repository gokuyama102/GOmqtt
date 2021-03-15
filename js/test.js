function tttest(varr, portNum) {
  var sSignal1 = (varr[14] & 0b00000100) >> 2;
  var sSignal2 = (varr[14] & 0b00001000) >> 3;
  var sTemperature = ((varr[12] << 8) + varr[13]) / 10;
  var sVolumeflow = getFloatValue(varr.slice(8, 12));
  var sTotalizer = getFloatValue(varr.slice(4, 8));
  var sConductivity = getFloatValue(varr.slice(0, 4));

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
  console.log(
    sSignal1 +
      "," +
      sSignal2 +
      "," +
      sTemperature +
      "," +
      sVolumeflow +
      "," +
      sTotalizer +
      "," +
      sConductivity
  );
}
