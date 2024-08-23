/**
 * To generate Graph or Chart
 */

class MakeChart {
    /**
     * @param {object} mainInst
     * @param {HTMLCanvasElement} mainCanvas
     * @param {Array} sheetData
     */
    constructor(mainInst, mainCanvas, sheetData) {
        this.mainInst = mainInst;
        this.mainCanvas = mainCanvas;
        this.sheetData = sheetData;
        this.scale = window.devicePixelRatio;
        this.isGraphDraggable = false;
    }

    /**
     * Rotates a matrix 90 degrees clockwise
     * @param {Array<Array<any>>} array
     * @returns {Array<Array<any>>}
     */
    rotateMatrix(array) {
        const rows = array.length;
        const cols = array[0].length;
        const rotatedArray = Array.from({ length: cols }, () => []);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                rotatedArray[col][rows - 1 - row] = array[row][col];
            }
        }

        return rotatedArray;
    }

    /**
     * Makes a graph Div draggable
     * @param {HTMLDivElement} graphDivElement
     * @param {Array<number>} selectedDimensions
     */
    makegraphDraggable(graphDivElement, selectedDimensions) {
        const rect = this.mainCanvas.getBoundingClientRect();
        this.isGraphDraggable = false;

        graphDivElement.addEventListener("click", () => {
            this.mainInst.selectedDimensionsMain = selectedDimensions;
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.renderTopHeader("#ffffff00");
            this.mainInst.renderLeftHeader("#ffffff00");
            this.mainInst.drawGrid("rgb(124,83,172)", "rgb(235,229,243)");
        });

        graphDivElement.addEventListener("pointerdown", () => {
            this.isGraphDraggable = true;
        });

        graphDivElement.addEventListener("pointermove", (e) => {
            graphDivElement.style.cursor = "move";

            if (this.isGraphDraggable) {
                let mouseX = (e.clientX - rect.left) / this.scale;
                let mouseY = (e.clientY - rect.top) / this.scale;
                graphDivElement.style.top = `${mouseY - 25}px`;
                graphDivElement.style.left = `${mouseX - 225}px`;
            }
        });

        graphDivElement.addEventListener("pointerup", () => {
            this.isGraphDraggable = false;
        });
    }

    /**
     * Draws a Graph on a canvas based on graph type and selected dimensions.
     * @param {String} typeOfGraph
     * @param {Array<number>} selectedDimensions
     * @returns
     */
    drawChart(typeOfGraph, selectedDimensions) {
        if (typeOfGraph === "") return;
        const [startX, startY, endX, endY] = selectedDimensions;

        if (startX == 0 && startY == 0 && endX == 0 && endY == 0) {
            return;
        }
        let main = document.getElementById("main");
        let graphDivElement = document.createElement("div");
        let canvas = document.createElement("canvas");
        graphDivElement.appendChild(canvas);
        main.appendChild(graphDivElement);

        let dataArray = [];
        let xValues = [];
        let seriesIndex = 1;

        for (let row = startY; row <= endY; row++) {
            const rowData = this.sheetData.find((item) => item[row + 1]);
            const tempArray = [];
            for (let col = startX; col <= endX; col++) {
                let cellData = rowData ? rowData[row + 1][col] : "";
                if (cellData && !isNaN(cellData.data)) {
                    tempArray.push(Number(cellData.data));
                }
            }
            if (tempArray.length > 0) {
                xValues.push(seriesIndex++);
                dataArray.push(tempArray);
            }
        }

        if (dataArray.length <= 0) {
            return;
        }

        this.applyStyleToElements(canvas, graphDivElement);

        let dataSet = [];
        dataArray = this.rotateMatrix(dataArray);

        dataArray.forEach((data, index) => {
            if (typeOfGraph != "pie" || (typeOfGraph == "pie" && index == 0)) {
                dataSet.push({
                    label: `Series${index + 1}`,
                    fill: false,
                    data: data,
                });
            }
        });
        let adjustedtypeOfGraph =
            typeOfGraph == "horizontalBar" ? "bar" : typeOfGraph;
        let indexAxis = typeOfGraph == "horizontalBar" ? "y" : "x";
        new Chart(canvas, {
            type: adjustedtypeOfGraph,
            data: {
                labels: xValues,
                datasets: dataSet,
            },
            options: {
                indexAxis: indexAxis,
                cutoutPercentage: 0,
            },
        });
        this.makegraphDraggable(graphDivElement, selectedDimensions);
    }

    /**
     * Apply CSS styles to the canvas and Graph Div Elements
     * @param {HTMLCanvasElement} canvas
     * @param {HTMLDivElement} graphDivElement
     */
    applyStyleToElements(canvas, graphDivElement) {
        canvas.style.backgroundColor = "white";
        canvas.style.padding = "10px";
        canvas.style.paddingTop = "25px";
        canvas.style.border = "1px solid gray";

        graphDivElement.style.position = "absolute";
        graphDivElement.style.top = "50px";
        graphDivElement.style.left = "50px";
        graphDivElement.style.width = "450px";
        graphDivElement.style.backgroundColor = "white";
    }
}

export { MakeChart };
