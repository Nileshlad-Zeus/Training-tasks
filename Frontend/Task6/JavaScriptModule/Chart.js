class MakeChart {
    /**
     *
     * @param {HTMLCanvasElement} mainCanvas
     * @param {Array} sheetData
     */
    constructor(mainCanvas, sheetData) {
        this.mainCanvas = mainCanvas;
        this.sheetData = sheetData;
        this.scale = window.devicePixelRatio;
        this.draggableChart = false;
    }

    /**
     *
     * @param {Array<Array<any>>} array
     * @returns {Array<Array<any>>}
     */
    rotateMatrix(array) {
        const rows = array.length;
        const cols = array[0].length;
        const rotated = Array.from({ length: cols }, () => []);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = array[i][j];
            }
        }

        return rotated;
    }

    /**
     *
     * @param {HTMLDivElement} chartDiv
     */
    makeitDraggable(chartDiv) {
        const rect = this.mainCanvas.getBoundingClientRect();
        this.draggableChart = false;

        chartDiv.addEventListener("pointerdown", () => {
            this.draggableChart = true;
        });

        chartDiv.addEventListener("pointermove", (e) => {
            chartDiv.style.cursor = "move";

            if (this.draggableChart) {
                let clickX = (e.clientX - rect.left) / this.scale;
                let clickY = (e.clientY - rect.top) / this.scale;
                chartDiv.style.top = `${clickY - 25}px`;
                chartDiv.style.left = `${clickX - 225}px`;
            }
        });

        chartDiv.addEventListener("pointerup", () => {
            this.draggableChart = false;
        });
    }

    /**
     *
     * @param {String} chartType
     * @param {Array<number>} selectedDimensionsMain
     * @returns
     */
    drawChart(chartType, selectedDimensionsMain) {
        if (chartType == "") return;
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
        let xValues = [];
        let i = 1;

        for (let j = startY; j <= endY; j++) {
            const result = this.sheetData.find((item) => item[j]);
            const tempArray = [];

            for (let k = startX; k <= endX; k++) {
                let currentData = result ? result[j][k] : "";
                if (currentData && !isNaN(currentData.data)) {
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

        this.setStyleForEle(canvas, chartDiv);

        let dataSet = [];
        dataArray = this.rotateMatrix(dataArray);

        dataArray.forEach((d, index) => {
            if (chartType != "pie" || (chartType == "pie" && index == 0)) {
                dataSet.push({
                    label: `Series${index + 1}`,
                    fill: false,
                    data: d,
                });
            }
        });
        let chartType2 = chartType == "horizontalBar" ? "bar" : chartType;
        let barType = chartType == "horizontalBar" ? "y" : "x";
        new Chart(canvas, {
            type: chartType2,
            data: {
                labels: xValues,
                datasets: dataSet,
            },
            options: {
                indexAxis: barType,
                cutoutPercentage: 0,
            },
        });
        this.makeitDraggable(chartDiv);
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {HTMLDivElement} chartDiv
     */
    setStyleForEle(canvas, chartDiv) {
        canvas.style.backgroundColor = "white";
        canvas.style.padding = "10px";
        canvas.style.border = "1px solid gray";
        chartDiv.style.position = "absolute";
        chartDiv.style.top = "50px";
        chartDiv.style.left = "50px";
        chartDiv.style.width = "450px";
        chartDiv.style.backgroundColor = "white";
    }
}

export { MakeChart };
