class MakeChart {
  constructor(mainCanvas, sheetData) {
    this.mainCanvas = mainCanvas;
    this.sheetData = sheetData;
    this.scale = window.devicePixelRatio;
    this.draggableChart = false;
  }

  rotateMatrix(array) {
    const rows = array.length;
    const cols = array[0].length;
    const rotated = [];

    for (let i = 0; i < cols; i++) {
      rotated[i] = [];
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = array[i][j];
      }
    }

    return rotated;
  }

  makeitDraggable(chartDiv) {
    let rect = this.mainCanvas.getBoundingClientRect();
    this.draggableChart = false;

    chartDiv.addEventListener("pointerdown", (e) => {
      this.draggableChart = true;
    });
    chartDiv.addEventListener("pointermove", (e) => {
      chartDiv.style.cursor = "move";
      let clickX = (e.clientX - rect.left) / this.scale;
      let clickY = (e.clientY - rect.top) / this.scale;
      if (this.draggableChart) {
        chartDiv.style.top = `${clickY - 50}px`;
        chartDiv.style.left = `${clickX - 225}px`;
      }
    });
    chartDiv.addEventListener("pointerup", (e) => {
      this.draggableChart = false;
    });
  }

  barChart(chartType, selectedDimensionsMain) {
    const [startX, startY, endX, endY] = selectedDimensionsMain;
    if (startX == 0 && startY == 0 && endX == 0 && endY == 0) {
      return;
    }
    let main = document.getElementById("main");
    let chartDiv = document.createElement("div");
    let canvas = document.createElement("canvas");
    chartDiv.appendChild(canvas);
    main.appendChild(chartDiv);

    let dataArray = [];
    let tempArray = [];
    let xValues = [];
    let i = 1;
    for (let j = startY; j <= endY; j++) {
      const result = this.sheetData.find((item) => item[j]);
      tempArray = [];
      for (let i = startX; i <= endX; i++) {
        let currentData = result ? result[j][i] : "";
        if (currentData && currentData != "" && !isNaN(currentData.data)) {
          tempArray.push(Number(currentData.data));
        }
      }
      if (tempArray.length > 0) {
        xValues.push(i++);
        dataArray.push(tempArray);
      }
    }
    if (dataArray.length <= 0) {
      return;
    }
    chartDiv.style.position = "absolute";
    chartDiv.style.border = "1px solid gray";
    chartDiv.style.top = "50px";
    chartDiv.style.left = "50px";
    chartDiv.style.width = "450px";
    chartDiv.style.padding = "10px";
    chartDiv.style.backgroundColor = "white";

    let dataSet = [];
    let backgroundColor = [
      "#4472C4",
      "#ED7D31",
      "#A5A5A5",
      "#FFC000",
      "#5B9BD5",
      "#F4B400",
      "#D3A7A1",
      "#009B77",
      "#6D6E71",
      "#FF6F61",
      "#C2C2C2",
      "#F2C6A1",
      "#2E8B57",
      "#FFC107",
      "#4F81BD",
    ];

    dataArray = this.rotateMatrix(dataArray);

    dataArray.forEach((d, index) => {
      if (chartType != "pie" || (chartType == "pie" && index == 0)) {
        dataSet.push({
          label: `Series${index + 1}`,
          backgroundColor:
            chartType == "pie" || chartType == "doughnut"
              ? backgroundColor
              : backgroundColor[index],
          borderColor:
            chartType == "pie" || chartType == "doughnut"
              ? "white"
              : backgroundColor[index],
          fill: false,
          data: d,
        });
      }
    });

    new Chart(canvas, {
      type: chartType,
      data: {
        labels: xValues,
        datasets: dataSet,
      },
      options: {
        indexAxis: "y",
        cutoutPercentage: chartType == "doughnut" ? 80 : 0,
      },
    });
    this.makeitDraggable(chartDiv);
  }
}

export { MakeChart };
