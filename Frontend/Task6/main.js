import { MakeChart } from "./JavaScriptModule/Chart.js";
import { GetValues } from "./JavaScriptModule/GetValues.js";
import { DrawHighlight } from "./JavaScriptModule/DrawHighLight.js";
import { FontStyle } from "./JavaScriptModule/ChangeFontStyle.js";
import { ResizeGrid } from "./JavaScriptModule/ResizeGrid.js";
import { CopyPaste } from "./JavaScriptModule/CopyPaste.js";
import { RowColumnManager } from "./JavaScriptModule/RowColumnManager.js";
//infinite scrolling
class newCanvas {
    constructor(sheetName) {
        this.sheetName = sheetName;
        this.sheetData = [];
        this.prevOffset = -1;
        this.progressbarEle = document.getElementById("progressbarEle");
        this.inputBox = document.getElementById("canvasinput");
        this.scale = window.devicePixelRatio;

        this.intervalid = setInterval(this.fetchProgress, 100);

        // window.addEventListener("resize", () => {
        //     location.reload();
        // });

        this.setupCanvas();
        this.inputBoxPosition();
        this.inputBox.style.display = "none";
        this.eventListeners();
        this.initializefindandReplace();
        this.initializeGraphFun();
        this.handleTopLeftClick();

        this.scrollFunction();
    }
    setupCanvas() {
        this.createNewCanvas();
        this.initialVariables();
        this.initializeInstances();
        this.drawGrid();
        this.renderLeftHeader();
        this.renderTopHeader();
    }
    eventListeners() {
        document.addEventListener("keydown", (event) => {
            const editingSectionModal = document.querySelector(
                ".findandselectSectionModal"
            );
            if (
                editingSectionModal.style.display == "" ||
                editingSectionModal.style.display == "none"
            ) {
                this.keyBoardEvents(event);
            }
        });

        this.mainCtx.canvas.addEventListener("pointerdown", (e) => {
            this.updateData();
        });
    }
    initializeInstances() {
        this.valueInst = new GetValues(this);
        this.highlightInst = new DrawHighlight(
            this,
            this.mainCtx,
            this.leftHeaderCtx,
            this.topHeaderCtx,
            this.selectedDimensionsMain,
            this.valueInst,
            this.inputBox,
            this.inputBoxPosition,
            this.drawGrid,
            this.sheetData
        );

        this.copyPasteInst = new CopyPaste(
            this,
            this.mainCtx,
            this.highlightInst,
            this.valueInst
        );

        this.resizeGridInst = new ResizeGrid(
            this,
            this.valueInst,
            this.highlightInst,
            this.copyPasteInst
        );

        this.fontStyleInst = new FontStyle(this, this.sheetData);
        this.chartInst = new MakeChart(this, this.mainCanvas, this.sheetData);
        this.rowColumnManagerInst = new RowColumnManager(
            this,
            this.mainCanvas,
            this.valueInst,
            this.highlightInst
        );
    }
    initializefindandReplace() {
        this.startPosition = {
            rowNo: -1,
            columnNo: -1,
            searchRow: 0,
            searchCol: 0,
        };
        const findtextInput = document.querySelector("#findtextInput");
        const findtextInput2 = document.querySelector("#findtextInput2");
        const findNextBtn = document.getElementById("findNextBtn");

        findNextBtn.addEventListener("click", () => {
            let findvalue = findtextInput2.value;
            this.findNext(findvalue);
        });

        const replacetextInput = document.querySelector("#replacetextInput");
        const replaceAllFun = document.querySelector("#replaceAllFun");
        replaceAllFun.addEventListener("click", () => {
            let findText = findtextInput.value;

            let replaceText = replacetextInput.value;
            this.findAndReplace(findText, replaceText);
        });
    }
    initializeGraphFun() {
        var charts = document.querySelectorAll(".chart");
        this.chartArray = [];
        Array.from(charts).forEach((chart) => {
            chart.addEventListener("click", (e) => {
                let chartType = e.target.htmlFor
                    ? e.target.htmlFor
                    : e.target.id;
                this.chartInst.drawChart(
                    chartType,
                    this.selectedDimensionsMain
                );
            });
        });
    }
    handleTopLeftClick() {
        const topleft = document.getElementById("topleft");
        topleft.addEventListener("click", () => {
            this.x1CellIndex = 0;
            this.y1CellIndex = 0;
            this.topheaderSelected = true;
            this.leftheaderSelected = true;

            this.isColSelected = true;
            this.isRowSelected = true;

            this.currSelectedCol = [0, 100];
            this.currSelectedRow = [0, 100];

            this.selectedDimensionsMain = [0, 0, 200, 200];
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.renderLeftHeader();
            this.renderTopHeader();
        });
    }
    fetchProgress = async () => {
        try {
            const response = await fetch(
                `http://localhost:5022/api/Employee/GetProgress`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();

            let percentage =
                (data.result[0].currentchunks / data.result[0].totalchunks) *
                100;
            this.progressbarEle.value = percentage;
            if (percentage > 0) {
                this.progressbarEle.style.display = "block";
            }
            if (percentage == 100) {
                this.progressbarEle.style.display = "none";
                clearInterval(this.intervalid);
                this.fetchUserData(0);
            }
        } catch (error) {
            clearInterval(this.intervalid);
        }
    };
    fetchUserData = async (offset = 0) => {
        const response = await fetch(
            `http://localhost:5022/api/Employee?offset=${offset}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();
        let sheetData = this.convertJsonData(data.result);
        this.sheetData.push(...sheetData);
        this.renderData();
    };
    convertJsonData = (data) => {
        const result = [];
        if (data.length > 0) {
            const keys = Object.keys(data[0]);
            data.forEach((item, index) => {
                const formattedItem = {};

                keys.forEach((key, idx) => {
                    if (key != "RowNo" && key != "id") {
                        formattedItem[idx - 2] = {
                            data: item[key],
                            properties: "*****",
                        };
                    }
                });

                result.push({ [item["RowNo"]]: formattedItem });
            });
        }
        return result;
    };
    initialVariables() {
        /**
         * check whether to update a value or not
         */
        this.isValueupdate = false;
        /**
         * current vertical scroll position
         * @type {number}
         */
        this.scrollTopvalue = 0;

        /**
         * current horizontal scroll position
         * @type {number}
         */
        this.scrollLeftvalue = 0;

        /**
         * color used to highlight text from top header and left header of selected area
         * and border of selected area
         * @type {string} -
         */
        this.strokeColor = "rgb(16,124,65)";

        /**
         * gray color used for draw rows and columns
         * @type {string}
         */
        this.gridStrokeColor = "rgb(128, 128, 128)";

        /**
         * color used when user selected particular column or row
         * @type {string}
         */
        this.whiteColor = "rgb(255, 255, 255)";

        /**
         * Index of current selected columns
         * @type {Array | null | number | string}
         */
        this.currSelectedCol = null;

        /**
         * Index of current selected row
         * @type {Array | null | number | string}
         */
        this.currSelectedRow = null;

        /**
         * Indicates whether a column is selected.
         * @type {boolean}
         */
        this.isColSelected = false;

        /**
         * Indicates whether a row is selected.
         * @type {boolean}
         */
        this.isRowSelected = false;

        /**
         * Index of the top-left cell in the current selection.
         * @type {number}
         */
        this.x1CellIndex = 0;

        /**
         * Index of the bottom-right cell in the current selection.
         * @type {number}
         */
        this.x2CellIndex = 0;

        /**
         * Index of the top-left cell in the current selection (vertical).
         * @type {number}
         */
        this.y1CellIndex = 0;

        /**
         * Index of the bottom-right cell in the current selection (vertical).
         * @type {number}
         */
        this.y2CellIndex = 0;

        /**
         * Input Cell position from Top
         * @type {number}
         */
        this.cellPositionTop = 0;

        /**
         * Input Cell position from Left
         * @type {number}
         */
        this.cellPositionLeft = 0;

        /**
         * Indicates whether the top header is selected.
         * @type {boolean}
         */
        this.topheaderSelected = false;

        /**
         * Indicates whether the left header is selected.
         * @type {boolean}
         */
        this.leftheaderSelected = false;

        /**
         * coordinates of the selected area [startX,startY,endX,endY]
         * @type {number[]}
         */
        this.selectedDimensionsMain = [0, 0, 0, 0];

        /**
         * Indicates whether the marching ants animation is running.
         * @type {boolean}
         */
        this.isAnimationRunning = false;

        /**
         * Indicates whether the animation should cover the full column.
         * @type {boolean}
         */
        this.animateFullColumn = false;

        /**
         * Indicates whether the animation should cover the full row.
         * @type {boolean}
         */
        this.animateFullRow = false;

        /**
         * Indicates whether the left area is selected.
         * @type {boolean}
         */
        this.isLeftAreaSelected = false;

        /**
         * Indicates whether the Top area is selected.
         * @type {boolean}
         */
        this.isTopAreaSelected = false;

        /**
         * Reference to the vertical resize line element.
         * @type {HTMLElement}
         */
        this.resizeLineVertical = document.getElementById("resizeLineVertical");

        /**
         * Reference to the horizontal resize line element.
         * @type {HTMLElement}
         */
        this.resizeLineHorizontal = document.getElementById(
            "resizeLineHorizontal"
        );
    }
    createNewCanvas() {
        //sheet canvas

        const main = document.getElementById("main");
        const scroller = document.getElementById("scroller");
        const mainCanvas = document.createElement("canvas");
        mainCanvas.setAttribute("id", this.sheetName);
        mainCanvas.setAttribute("class", "canvas");

        // mainCanvas.width = Math.floor(2100 * this.scale);
        // mainCanvas.width = Math.floor(1200 * this.scale);
        mainCanvas.height = (scroller.offsetHeight - 20) * this.scale;
        mainCanvas.width = (scroller.offsetWidth - 20) * this.scale;
        // mainCanvas.width = Math.floor(1200 * this.scale);
        // mainCanvas.height = (500 - 20) * this.scale;
        // mainCanvas.height = (main.offsetHeight - 20) * this.scale;
        main.appendChild(mainCanvas);
        this.mainCanvas = mainCanvas;
        this.mainCtx = this.mainCanvas.getContext("2d");
        this.mainCtx.scale(this.scale, this.scale);

        //topheader canvas
        const topHeader = document.getElementById("topHeader");
        const topHeaderCanvas = document.createElement("canvas");
        topHeaderCanvas.setAttribute("id", `topHeader-${this.sheetName}`);
        topHeaderCanvas.setAttribute("class", "topHeaderCanvas");
        topHeaderCanvas.width = Math.floor(2100 * this.scale);
        topHeaderCanvas.height = Math.floor(24 * this.scale);
        topHeader.appendChild(topHeaderCanvas);
        this.topHeaderCanvas = topHeaderCanvas;
        this.topHeaderCtx = this.topHeaderCanvas.getContext("2d");
        this.topHeaderCtx.scale(this.scale, this.scale);

        //leftheader canvas
        const leftHeader = document.getElementById("leftHeader");
        const leftHeaderCanvas = document.createElement("canvas");
        leftHeaderCanvas.setAttribute("id", `leftHeader-${this.sheetName}`);
        leftHeaderCanvas.setAttribute("class", "leftHeaderCanvas");
        leftHeaderCanvas.width = Math.floor(40 * this.scale);
        // leftHeaderCanvas.height = Math.floor(1200 * this.scale);
        leftHeaderCanvas.height = leftHeader.offsetHeight * this.scale;
        leftHeader.appendChild(leftHeaderCanvas);
        this.leftHeaderCanvas = leftHeaderCanvas;
        this.leftHeaderCtx = this.leftHeaderCanvas.getContext("2d");
        this.leftHeaderCtx.scale(this.scale, this.scale);

        this.mainCanvas.style.cursor = "cell";

        const topleftDiv = document.getElementById("topleftDiv");

        // main.style.top = `${24 * this.scale}px`;
        // main.style.marginLeft = `${40 * this.scale}px`;
        topHeader.style.height = `${24 * this.scale}px`;
        topHeader.style.zIndex = 100;
        topHeader.style.marginLeft = `${40 * this.scale}px`;
        leftHeader.style.marginTop = `${24 * this.scale}px`;
        topleftDiv.style.width = `${40 * this.scale}px`;
        topleftDiv.style.height = `${24 * this.scale}px`;
    }
    clearCanvas() {
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.topHeaderCtx.clearRect(
            0,
            0,
            this.topHeaderCanvas.width,
            this.topHeaderCanvas.height
        );
        this.leftHeaderCtx.clearRect(
            0,
            0,
            this.leftHeaderCanvas.width,
            this.leftHeaderCanvas.height
        );
    }
    clearMainCanvas() {
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
    }
    clearTopHeader() {
        this.topHeaderCtx.clearRect(
            0,
            0,
            this.topHeaderCanvas.width,
            this.topHeaderCanvas.height
        );
    }
    clearLeftHeader() {
        this.leftHeaderCtx.clearRect(
            0,
            0,
            this.leftHeaderCanvas.width,
            this.leftHeaderCanvas.height
        );
    }
    inputBoxPosition() {
        this.inputBox.style.display = "block";
        this.inputBox.style.top = `${
            (this.cellPositionTop + 0.6) * this.scale
        }px`;
        this.inputBox.style.left = `${
            (this.cellPositionLeft + 0.6) * this.scale
        }px`;
        this.inputBox.style.height = `${
            (this.valueInst.getCurCellHeight(this.y1CellIndex) - 1.2) *
            this.scale
        }px`;
        this.inputBox.style.width = `${
            (this.valueInst.getCurCellWidth(this.x1CellIndex) - 1.2) *
            this.scale
        }px`;
    }

    searchData(dataArray, searchValue, startPosition) {
        for (let i = startPosition.searchRow; i < dataArray.length; i++) {
            const rowNo = parseInt(Object.keys(dataArray[i])[0]);
            const columns = dataArray[i][rowNo];

            for (let colNo in columns) {
                if (parseInt(colNo) > startPosition.columnNo) {
                    console.log(columns[colNo].data);
                    if (columns[colNo].data === searchValue) {
                        return {
                            rowNo: rowNo,
                            columnNo: parseInt(colNo),
                            searchRow: i,
                        };
                    }
                }
            }
            startPosition.columnNo = -1;
        }
        startPosition.rowNo = 0;
        return null;
    }

    findNext(findvalue) {
        const scroller = document.getElementById("scroller");
        let findAndReplaceStatus2 = document.getElementById(
            "findAndReplaceStatus2"
        );
        if (findvalue == "") {
            findAndReplaceStatus2.style.display = "block";
            findAndReplaceStatus2.innerText =
                "Your search should include at least one character";
            return;
        }
        let result = this.searchData(
            this.sheetData,
            findvalue,
            this.startPosition
        );
        if (result) {
            this.startPosition = result;
            let x = result.rowNo;
            let y = result.columnNo;

            this.selectedDimensionsMain = [y, x - 1, y, x - 1];
            this.scrollTopvalue = Math.max(0, (x - 10) * 21);

            scroller.scrollTop = this.scrollTopvalue;
            this.mainCtx.clearRect(
                0,
                0,
                this.mainCanvas.width,
                this.mainCanvas.height
            );
            this.clearLeftHeader();
            this.clearTopHeader();
            this.highlightInst.highlightSelectedArea();
            this.renderLeftHeader();
            this.renderTopHeader();
            this.drawGrid();
        } else {
            findAndReplaceStatus2.style.display = "block";
            findAndReplaceStatus2.innerText = "No more occurrences found.";
            this.startPosition = { rowNo: 0, columnNo: -1 };
        }
    }

    findAndReplace = async (findText, replaceText) => {
        let findAndReplaceStatus = document.getElementById(
            "findAndReplaceStatus"
        );

        findAndReplaceStatus.style.display = "block";
        findAndReplaceStatus.innerText = "Updating...";
        const response = await fetch(
            `http://localhost:5022/api/Employee/findandreplace`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    findText: findText,
                    replaceText: replaceText,
                }),
            }
        );
        const data = await response.json();

        if (data.status) {
            this.sheetData = [];
            await this.fetchUserData(0);
            findAndReplaceStatus.innerText = `Matches Replaced (${data.noOfRowsAffected})`;
        }

        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.drawGrid();
    };

    //----------------------draw grid----------------------
    trimData(data, j, fontSize) {
        if (data == null) {
            return " ";
        }
        if (!isNaN(data)) {
            data = data.toString();
        }
        let cellwidth = this.valueInst.getCurCellWidth(j);
        let length = data.length;
        let textWidth = this.mainCtx.measureText(data).width;
        let newfontSize = fontSize.slice(0, -2);
        let length2 = (textWidth - cellwidth) / (newfontSize - 2);
        data = data.slice(0, length - length2 - 2);
        return data;
    }
    drawGrid(strokeColor = "", fillColor = "") {
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea(strokeColor, fillColor);
        this.drawRows();
        this.drawColumns();
        this.renderData(strokeColor);
    }
    getPos(str = "", subStr, i) {
        return [
            str.split(subStr, i).join(subStr).length,
            str.split(subStr, i + 1).join(subStr).length,
        ];
    }
    renderTopHeader(transparentColor = "") {
        this.topHeaderCtx.save();
        this.topHeaderCtx.beginPath();

        this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
        this.topHeaderCtx.moveTo(0, 24 - 0.5);
        this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24 - 0.5);
        this.topHeaderCtx.stroke();
        this.topHeaderCtx.restore();
        this.highlightInst.highlightTopHeader(transparentColor);

        this.topHeaderCtx.font = "10pt Arial";
        this.topHeaderCtx.textAlign = "center";

        const canvasHeight = this.mainCanvas.width;
        const colWidth = 100;

        const startCol = Math.floor(this.scrollLeftvalue / colWidth);
        const endCol = Math.ceil(
            (this.scrollLeftvalue + canvasHeight) / colWidth
        );

        let cellPositionX = -this.scrollLeftvalue % colWidth;

        for (let i = startCol; i <= endCol; i++) {
            cellPositionX += this.valueInst.getCurCellWidth(i);
            this.topHeaderCtx.save();
            this.topHeaderCtx.beginPath();
            this.topHeaderCtx.moveTo(cellPositionX + 0.5, 0);
            this.topHeaderCtx.lineTo(
                cellPositionX + 0.5,
                this.topHeaderCtx.canvas.height
            );

            if (
                this.topheaderSelected &&
                this.currSelectedCol[0] <= i &&
                i < this.currSelectedCol[1]
            ) {
                this.topHeaderCtx.strokeStyle = this.whiteColor;
                this.topHeaderCtx.lineWidth = 1;
            } else {
                this.topHeaderCtx.lineWidth = 0.2;
                this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
            }
            this.topHeaderCtx.stroke();
            this.topHeaderCtx.restore();
        }

        cellPositionX = -this.scrollLeftvalue % colWidth;
        for (let i = startCol; i <= endCol; i++) {
            cellPositionX += this.valueInst.getCurCellWidth(i);
            this.topHeaderCtx.save();
            let text = this.valueInst.convertNumToChar(i + 1);
            let xPosition =
                cellPositionX - this.valueInst.getCurCellWidth(i) / 2;
            let yPosition = 15;

            this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            if (transparentColor != "") {
                this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            } else if (Array.isArray(this.currSelectedCol)) {
                if (
                    this.topheaderSelected &&
                    this.currSelectedCol[0] <= i &&
                    i <= this.currSelectedCol[1]
                ) {
                    this.topHeaderCtx.font = "bold 16px Arial";
                    this.topHeaderCtx.fillStyle = this.whiteColor;
                } else if (
                    this.currSelectedCol[0] <= i &&
                    i <= this.currSelectedCol[1]
                ) {
                    this.topHeaderCtx.fillStyle = this.strokeColor;
                }
            } else if (this.currSelectedCol == i) {
                this.topHeaderCtx.fillStyle = this.whiteColor;
                this.topHeaderCtx.font = "bold 16px Arial";
            } else if (this.currSelectedCol == "all") {
                this.topHeaderCtx.fillStyle = this.strokeColor;
            } else {
                this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            }
            this.topHeaderCtx.fillText(text, xPosition, yPosition + 1);
            this.topHeaderCtx.restore();

            if (
                i == this.resizeGridInst.columnIndexAtDraggablepoint &&
                cellPositionX - this.resizeGridInst.columnDraggedPos >= 20
            ) {
                this.resizeLineVertical.style.top = 0;
                this.resizeLineVertical.style.left = `${
                    cellPositionX * this.scale
                }px`;
            }
        }
    }
    renderLeftHeader(transparentColor = "") {
        this.leftHeaderCtx.save();
        this.leftHeaderCtx.beginPath();
        this.leftHeaderCtx.moveTo(40 - 0.5, 0);
        this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
        this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
        this.leftHeaderCtx.stroke();
        this.leftHeaderCtx.restore();
        this.highlightInst.highlightLeftHeaders(transparentColor);

        const canvasHeight = this.mainCanvas.height;
        const rowHeight = this.valueInst.getCurCellHeight(0);
        const startRow = Math.floor(this.scrollTopvalue / rowHeight);
        const endRow = Math.ceil(
            (this.scrollTopvalue + canvasHeight) / rowHeight
        );
        let cellPosition = -this.scrollTopvalue % rowHeight;
        for (let i = startRow; i <= endRow; i++) {
            cellPosition += this.valueInst.getCurCellHeight(i);
            this.leftHeaderCtx.save();
            this.leftHeaderCtx.beginPath();
            this.leftHeaderCtx.moveTo(2, cellPosition + 0.5);
            this.leftHeaderCtx.lineTo(
                this.leftHeaderCtx.canvas.width,
                cellPosition + 0.5
            );

            if (
                this.leftheaderSelected &&
                this.currSelectedRow[0] <= i &&
                i < this.currSelectedRow[1]
            ) {
                this.leftHeaderCtx.lineWidth = 1;
                this.leftHeaderCtx.strokeStyle = this.whiteColor;
            } else {
                this.leftHeaderCtx.lineWidth = 0.2;
                this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
            }

            this.leftHeaderCtx.stroke();
            this.leftHeaderCtx.restore();
        }

        cellPosition = -this.scrollTopvalue % rowHeight;
        this.leftHeaderCtx.font = "14px Arial";
        for (let i = startRow; i <= endRow; i++) {
            cellPosition += this.valueInst.getCurCellHeight(i);
            this.leftHeaderCtx.save();
            let text = (i + 1).toString();
            let yPosition =
                cellPosition - this.valueInst.getCurCellHeight(i) / 2;

            this.leftHeaderCtx.fillStyle = this.gridStrokeColor;
            if (transparentColor != "") {
                this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            } else if (Array.isArray(this.currSelectedRow)) {
                if (
                    this.leftheaderSelected &&
                    this.currSelectedRow[0] <= i &&
                    i <= this.currSelectedRow[1]
                ) {
                    this.leftHeaderCtx.font = "bold 14px Arial";
                    this.leftHeaderCtx.fillStyle = this.whiteColor;
                } else if (
                    this.currSelectedRow[0] <= i &&
                    i <= this.currSelectedRow[1]
                ) {
                    this.leftHeaderCtx.fillStyle = this.strokeColor;
                }
            } else if (this.currSelectedRow == i) {
                this.leftHeaderCtx.font = "bold 14px Arial";
                this.leftHeaderCtx.fillStyle = this.whiteColor;
            } else if (this.currSelectedRow == "all") {
                this.leftHeaderCtx.fillStyle = this.strokeColor;
            } else {
                this.leftHeaderCtx.fillStyle = this.gridStrokeColor;
            }
            this.leftHeaderCtx.textAlign = "right";
            this.leftHeaderCtx.fillText(text, 35, yPosition + 4);
            this.leftHeaderCtx.restore();

            if (
                i == this.resizeGridInst.rowIndexAtDraggablepoint &&
                cellPosition - this.resizeGridInst.rowDraggedPos > 10
            ) {
                this.resizeLineHorizontal.style.top = `${
                    cellPosition * this.scale
                }px`;
                this.resizeLineHorizontal.style.left = 0;
            }
        }
    }

    //----------------------Scroll Functionality----------------------
    renderData() {
        let i = 0;

        const canvasHeight = this.mainCanvas.height;
        const canvasWidth = this.mainCanvas.width;

        const rowHeight = this.valueInst.getCurCellHeight(0);
        const colWidth = 100;

        const startRow = Math.floor(this.scrollTopvalue / rowHeight);
        const endRow = Math.min(
            this.sheetData.length - 1,
            Math.ceil((this.scrollTopvalue + canvasHeight) / rowHeight)
        );

        let cellPositionY = -this.scrollTopvalue % rowHeight;

        const startCol = Math.floor(this.scrollLeftvalue / colWidth);
        const endCol = Math.ceil(
            (this.scrollLeftvalue + canvasWidth) / colWidth
        );

        let m = startRow;
        let availableRow = [];
        let endRow1 = endRow;
        for (let n = startRow; n <= endRow1; n++) {
            let result = this.sheetData.find((item) => item[n + 1]);
            if (result) {
                availableRow.push(n + 1);
            } else {
                endRow1 = endRow1 + 1;
            }
        }

        for (let n = startRow; n <= endRow1 + 1; n++) {
            if (!availableRow.includes(n + 1)) {
                cellPositionY += this.valueInst.getCurCellHeight(n);
                continue;
            } else {
                m++;
            }

            let cellPositionX = -this.scrollLeftvalue % colWidth;
            let data = this.sheetData[m - 1];

            cellPositionY += this.valueInst.getCurCellHeight(n);
            i = Object.keys(data) - "0";

            for (let j = startCol; j <= endCol; j++) {
                let currProperties = data[i][j]?.properties;

                if (currProperties) {
                    let colorPos = this.getPos(currProperties, "*", 1);
                    let fontColor = currProperties?.slice(
                        colorPos[0] + 1,
                        colorPos[1]
                    );

                    let fontStylePos = this.getPos(currProperties, "*", 2);
                    let fontStyle = currProperties?.slice(
                        fontStylePos[0] + 1,
                        fontStylePos[1]
                    );

                    let fontWeightPos = this.getPos(currProperties, "*", 3);
                    let fontWeight = currProperties?.slice(
                        fontWeightPos[0] + 1,
                        fontWeightPos[1]
                    );

                    let fontSizePos = this.getPos(currProperties, "*", 4);
                    let fontSize =
                        currProperties?.slice(
                            fontSizePos[0] + 1,
                            fontSizePos[1]
                        ) || "12pt";

                    let fontFamPos = this.getPos(currProperties, "*", 5);
                    let fontFam =
                        currProperties?.slice(
                            fontFamPos[0] + 1,
                            fontFamPos[1]
                        ) || "calibri";
                    this.mainCtx.save();
                    this.mainCtx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFam}`;
                    let newData = this.trimData(data[i][j]?.data, j, fontSize);
                    this.mainCtx.fillStyle = `${fontColor}`;
                    this.mainCtx.fillText(
                        newData,
                        cellPositionX + 4,
                        cellPositionY - 4
                    );
                    this.mainCtx.restore();
                }
                cellPositionX += this.valueInst.getCurCellWidth(j);
            }
            i++;
        }
    }

    drawRows() {
        const canvasHeight = this.mainCanvas.height;
        const rowHeight = this.valueInst.getCurCellHeight(0);

        const startRow = Math.floor(this.scrollTopvalue / rowHeight);
        const endRow = Math.ceil(
            (this.scrollTopvalue + canvasHeight) / rowHeight
        );

        let cellPositionY = -this.scrollTopvalue % rowHeight;

        for (let i = startRow; i <= endRow; i++) {
            cellPositionY += this.valueInst.getCurCellHeight(i);

            this.mainCtx.beginPath();
            // this.mainCtx.save();
            this.mainCtx.moveTo(0, cellPositionY + 0.5);
            this.mainCtx.lineTo(this.mainCanvas.width, cellPositionY + 0.5);
            this.mainCtx.lineWidth = 0.2;
            this.mainCtx.strokeStyle = this.gridStrokeColor;
            this.mainCtx.stroke();
            // this.mainCtx.restore();
        }
    }

    drawColumns() {
        const canvasHeight = this.mainCanvas.width;
        const colWidth = 100;

        const startCol = Math.floor(this.scrollLeftvalue / colWidth);
        const endCol = Math.ceil(
            (this.scrollLeftvalue + canvasHeight) / colWidth
        );

        let cellPositionX = -this.scrollLeftvalue % colWidth;

        for (let i = startCol; i <= endCol; i++) {
            cellPositionX += this.valueInst.getCurCellWidth(i);
            this.mainCtx.beginPath();
            this.mainCtx.moveTo(cellPositionX + 0.5, 0);
            this.mainCtx.lineTo(
                cellPositionX + 0.5,
                this.mainCtx.canvas.height
            );
            this.mainCtx.lineWidth = 0.2;
            this.mainCtx.strokeStyle = this.gridStrokeColor;
            this.mainCtx.stroke();
        }
    }

    scrollFunction() {
        const scroller = document.getElementById("scroller");
        const main = document.getElementById("main");

        scroller.addEventListener("scroll", (e) => {
            this.inputBox.style.display = "none";
            this.scrollTopvalue = Math.max(0, e.target.scrollTop);
            this.scrollLeftvalue = Math.max(0, e.target.scrollLeft);

            let offset = Math.floor(
                (Math.max(0, e.target.scrollTop / 21) + 100) / 500
            );

            if (
                Math.max(0, e.target.scrollTop) >= 8400 &&
                this.prevOffset != offset
            ) {
                this.prevOffset = offset;
                this.fetchUserData(offset);
            }

            if (this.scrollTopvalue > 9000) {
                main.style.height = `${this.scrollTopvalue + 1000}px`;
            }

            if (this.scrollLeftvalue > 100) {
                main.style.width = `${this.scrollLeftvalue + 2000}px`;
            }

            this.mainCtx.clearRect(
                0,
                0,
                this.mainCanvas.width,
                this.mainCanvas.height
            );
            this.leftHeaderCtx.clearRect(
                0,
                0,
                this.leftHeaderCanvas.width,
                this.leftHeaderCanvas.height
            );
            this.topHeaderCtx.clearRect(
                0,
                0,
                this.topHeaderCanvas.width,
                this.topHeaderCanvas.height
            );
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.renderLeftHeader();
            this.renderTopHeader();
        });

        this.mainCanvas.addEventListener("wheel", (e) => {
            if (e.deltaY > 0) {
                scroller.scrollTop = scroller.scrollTop + (e.deltaY + 100);
            } else {
                scroller.scrollTop = scroller.scrollTop + (e.deltaY - 100);
            }
        });
    }

    //----------------------keyboard Evenets----------------------
    updateData = async () => {
        if (this.isValueupdate == false) return;
        let value = this.inputBox.value;
        let rowData = this.sheetData.find((item) => item[this.activeRow]);
        if (rowData == undefined) {
            const formattedItem = {};
            const newRowNo = this.activeRow.toString();
            formattedItem[this.x1CellIndex] = {
                data: value,
                properties: "*****",
            };
            this.sheetData.push({ [newRowNo]: formattedItem });
            await this.rowColumnManagerInst.InsertRow();
        }
        rowData = this.sheetData.find((item) => item[this.activeRow]);
        rowData[this.activeRow][this.x1CellIndex].data = value;

        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.drawGrid();

        const response = await fetch(
            `http://localhost:5022/api/Employee/updatevalue?column=${this.activeColumn}&row=${this.activeRow}&text=${value}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();

        if (data.status) {
            this.inputBox.value = null;
            let length = this.sheetData.length;

            this.sheetData = [];
            for (let i = 0; i < length / 500; i++) {
                await this.fetchUserData(i);
            }
        }

        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.drawGrid();
    };

    deleteData = async () => {
        const [startCol, startRow, endCol, endRow] =
            this.selectedDimensionsMain;

        let startCol1 = this.valueInst.convertNumToChar(startCol + 1);
        let endCol1 = this.valueInst.convertNumToChar(endCol + 1);
        let isThereAnyData = false;
        for (let row = startRow; row <= endRow; row++) {
            let rowData = this.sheetData.find((item) => item[row + 1]);
            if (rowData) {
                for (let col = startCol; col <= endCol; col++) {
                    if (rowData[row + 1][col].data) {
                        isThereAnyData = true;
                    }
                    rowData[row + 1][col].data = null;
                }
            }
        }

        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.drawGrid();

        if (isThereAnyData) {
            const response = await fetch(
                `http://localhost:5022/api/Employee/deletedata?startRow=${
                    startRow + 1
                }&endRow=${endRow + 1}&startCol=${startCol1}&endCol=${endCol1}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();

            if (data.status) {
                this.inputBox.value = null;
                let length = this.sheetData.length;

                this.sheetData = [];
                for (let i = 0; i < length / 500; i++) {
                    await this.fetchUserData(i);
                }
            }
            this.mainCtx.clearRect(
                0,
                0,
                this.mainCanvas.width,
                this.mainCanvas.height
            );
            this.drawGrid();
        }
    };

    keyBoardEvents = async (e) => {
        let flag = false;
        this.activeColumn = this.valueInst.convertNumToChar(
            this.x1CellIndex + 1
        );
        this.activeRow = this.y1CellIndex + 1;

        let startX, startY, endX, endY;
        if ((e.ctrlKey && e.key === "c") || (e.ctrlKey && e.key === "C")) {
            this.copyPasteInst.marchingAntsCoordinates =
                this.selectedDimensionsMain;

            if (this.isColSelected) {
                this.animateFullRow = false;
                this.animateFullColumn = true;
            } else if (this.isRowSelected) {
                this.animateFullRow = true;
                this.animateFullColumn = false;
            } else {
                this.animateFullRow = false;
                this.animateFullColumn = false;
            }
            cancelAnimationFrame(this.copyPasteInst.animationFrameId);
            this.isAnimationRunning = true;
            this.copyPasteInst.startMarchingAntsAnimation();
            this.copyPasteInst.copyToClipboard();
            return;
        } else if (
            (e.ctrlKey && e.key === "v") ||
            (e.ctrlKey && e.key === "V")
        ) {
            this.copyPasteInst.pasteToSheet();
            return;
        } else if (e.shiftKey) {
            this.inputBox.style.display = "none";
            if (e.key === "ArrowDown") {
                this.y2CellIndex = Math.max(0, this.y2CellIndex + 1);
            } else if (e.key === "ArrowRight") {
                this.x2CellIndex = Math.max(0, this.x2CellIndex + 1);
            } else if (e.key === "ArrowUp") {
                this.y2CellIndex = Math.max(0, this.y2CellIndex - 1);
            } else if (e.key == "ArrowLeft") {
                this.x2CellIndex = Math.max(0, this.x2CellIndex - 1);
            } else if (/^[a-zA-Z()~!@#$%^&*]$/.test(e.key)) {
                this.isValueupdate = true;
                this.x2CellIndex = this.x1CellIndex;
                this.y2CellIndex = this.y1CellIndex;
                flag = true;
                this.isAnimationRunning = false;
                this.inputBoxPosition();
                this.inputBox.focus();
                return;
            } else {
                this.inputBox.blur();
                this.x2CellIndex = this.x1CellIndex;
                this.y2CellIndex = this.y1CellIndex;
                flag = true;
                this.isAnimationRunning = false;
                return;
            }
            this.inputBox.blur();
            flag = true;
            startX = Math.min(this.x1CellIndex, this.x2CellIndex);
            endX = Math.max(this.x1CellIndex, this.x2CellIndex);
            startY = Math.min(this.y1CellIndex, this.y2CellIndex);
            endY = Math.max(this.y1CellIndex, this.y2CellIndex);
            this.selectedDimensionsMain = [startX, startY, endX, endY];
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.clearTopHeader();
            this.clearLeftHeader();
            this.renderTopHeader();
            this.renderLeftHeader();
        } else if (e.key == "Enter" || e.key == "ArrowDown") {
            this.cellPositionTop += this.valueInst.getCurCellHeight(
                this.y1CellIndex
            );
            this.y1CellIndex = this.y1CellIndex + 1;
        } else if (e.key == "ArrowUp" && this.y1CellIndex >= 1) {
            this.cellPositionTop -= this.valueInst.getCurCellHeight(
                this.y1CellIndex - 1
            );
            this.y1CellIndex = this.y1CellIndex - 1;
        } else if (e.key == "Tab" || e.key == "ArrowRight") {
            this.cellPositionLeft += this.valueInst.getCurCellWidth(
                this.x1CellIndex
            );
            this.x1CellIndex = this.x1CellIndex + 1;
        } else if (e.key == "ArrowLeft" && this.x1CellIndex >= 1) {
            this.cellPositionLeft -= this.valueInst.getCurCellWidth(
                this.x1CellIndex - 1
            );
            this.x1CellIndex = this.x1CellIndex - 1;
        } else if (e.ctrlKey || e.key == "CapsLock") {
            return;
        } else if (e.key == "Delete") {
            this.deleteData();
        } else {
            flag = true;
            this.isValueupdate = true;
            this.isAnimationRunning = false;
            this.inputBoxPosition();
            this.inputBox.focus();
        }

        if (
            (e.key === "Enter" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === "Tab" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowLeft") &&
            !e.shiftKey
        ) {
            this.updateData();
            this.inputBox.value = null;
            this.isValueupdate = false;
            this.inputBox.style.display = "none";
            this.topheaderSelected = false;
            this.leftheaderSelected = false;
            this.isColSelected = false;
            this.isRowSelected = false;
        }

        if (!e.ctrlKey && e.key != "Delete" && flag == false) {
            e.preventDefault();
            this.inputBox.blur();
            this.selectedDimensionsMain = [
                this.x1CellIndex,
                this.y1CellIndex,
                this.x1CellIndex,
                this.y1CellIndex,
            ];
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.clearTopHeader();
            this.clearLeftHeader();
            this.renderTopHeader();
            this.renderLeftHeader();
        }
    };
}
export { newCanvas };
