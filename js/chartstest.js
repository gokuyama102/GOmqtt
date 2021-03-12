var ctx = document.getElementById("myChart").getContext("2d");
var cdata = [];
var config = {
  type: "line",
  data: {
    datasets: [
      {
        label: "Port 3",
        data: cdata,
        borderColor: "rgba(0,165,135,1)",
        backgroundColor: "rgba(0,165,135,0.1)",
      },
    ],
  },
  options: {
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            unit: "second",
            stepSize: 5,
          },
          scaleLabel: {
            display: true,
            labelString: "Time",
          },
        },
      ],
      yAxes: [
        {
          ticks: { min: 0 },
        },
      ],
    },
  },
};

var scatterChart = new Chart(ctx, config);
