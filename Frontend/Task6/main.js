import { MakeChart } from "./JavaScriptModule/Chart.js";
import { GetValues } from "./JavaScriptModule/GetValues.js";
import { DrawHighlight } from "./JavaScriptModule/DrawHighLight.js";
import { FontStyle } from "./JavaScriptModule/ChangeFontStyle.js";
import { ResizeGrid } from "./JavaScriptModule/ResizeGrid.js";
import { CopyPaste } from "./JavaScriptModule/CopyPaste.js";
import { RowColumnManager } from "./JavaScriptModule/RowColumnManager.js";
import { ApiRequests } from "./JavaScriptModule/ApiRequests.js";
import { DataSearcher } from "./JavaScriptModule/DataSearcher.js";

class newCanvas {
    constructor(sheetName) {
        this.sheetName = sheetName;
        this.sheetData = [];
        this.prevOffset = -1;
        this.inputBox = document.getElementById("canvasinput");
        this.scale = window.devicePixelRatio;
        // window.addEventListener("resize", () => {
        //     location.reload();
        // });

        this.setupCanvas();
        this.inputBoxPosition();
        this.inputBox.style.display = "none";
        this.eventListeners();
        this.handleTopLeftClick();
        this.scrollFunction();
    }

    /**
     * Sets up the canvas and initializes necessary components.
     */
    setupCanvas() {
        this.createNewCanvas();
        this.initialVariables();
        this.initializeInstances();
        this.drawGrid();
        this.renderLeftHeader();
        this.renderTopHeader();
    }

    /**
     * Creates and configures the main, top header, and left header canvases.
     */
    createNewCanvas() {
        //sheet canvas

        const main = document.getElementById("main");
        const scroller = document.getElementById("scroller");
        const mainCanvas = document.createElement("canvas");
        mainCanvas.setAttribute("id", this.sheetName);
        mainCanvas.setAttribute("class", "canvas");
        mainCanvas.height = (scroller.offsetHeight - 20) * this.scale;
        mainCanvas.width = (scroller.offsetWidth - 20) * this.scale;
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

        topHeader.style.height = `${24 * this.scale}px`;
        topHeader.style.zIndex = 100;
        topHeader.style.marginLeft = `${40 * this.scale}px`;
        leftHeader.style.marginTop = `${24 * this.scale}px`;
        topleftDiv.style.width = `${40 * this.scale}px`;
        topleftDiv.style.height = `${24 * this.scale}px`;
    }

    /**
     * Registers event listeners for keyboard and mouse interactions.
     */
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
            this.apiRequestsInst.updateData();
        });
    }

    /**
     * Initializes various instances required for grid functionality.
     */
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
        this.apiRequestsInst = new ApiRequests(
            this,
            this.mainCtx,
            this.highlightInst,
            this.valueInst,
            this.rowColumnManagerInst
        );
        this.dataSearcherInst = new DataSearcher(
            this,
            this.highlightInst,
            this.apiRequestsInst
        );
    }

    /**
     * Initializes various variables used for grid management.
     */
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

    /**
     *  Positions the input box based on the current cell's location.
     */
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

    /**
     *  Handles the click event on the top-left corner of the grid.
     */
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

    //---------------------clear canvas-------------------
    /**
     * Clears the main canvas by removing all content within its bounds.
     */
    clearMainCanvas() {
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
    }

    /**
     * Clears the top header canvas by removing all content within its bounds.
     */
    clearTopHeader() {
        this.topHeaderCtx.clearRect(
            0,
            0,
            this.topHeaderCanvas.width,
            this.topHeaderCanvas.height
        );
    }

    /**
     * Clears the left header canvas by removing all content within its bounds.
     */
    clearLeftHeader() {
        this.leftHeaderCtx.clearRect(
            0,
            0,
            this.leftHeaderCanvas.width,
            this.leftHeaderCanvas.height
        );
    }

    //----------------------draw grid----------------------
    /**
     * Draws a grid on the main canvas, highlighting a selected area and rendering data.
     * @param {String} strokeColor
     * @param {String} fillColor
     */
    drawGrid(strokeColor = "", fillColor = "") {
        this.clearMainCanvas();
        this.highlightInst.highlightSelectedArea(strokeColor, fillColor);
        this.drawRows();
        this.drawColumns();
        this.renderData();
    }

    /**
     * Draws the rows of the grid on the main canvas.
     */
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

    /**
     * Draws the columns of the grid on the main canvas.
     */
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

    //----------------------Render Data----------------------
    /**
     * Render the visible portion of a grid data onto the main canvas
     */
    renderData() {
        const canvasHeight = this.mainCanvas.height;
        const canvasWidth = this.mainCanvas.width;

        const rowHeight = 21;
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

        let adjustedStartRow = startRow;
        let availableRow = [];
        let adjustedEndRow = endRow;
        for (let rowIndex = startRow; rowIndex <= adjustedEndRow; rowIndex++) {
            let result = this.sheetData.find((item) => item[rowIndex + 1]);
            if (result) {
                availableRow.push(rowIndex + 1);
            } else {
                adjustedEndRow++;
            }
        }

        for (
            let rowIndex = startRow;
            rowIndex <= adjustedEndRow + 1;
            rowIndex++
        ) {
            if (!availableRow.includes(rowIndex + 1)) {
                cellPositionY += this.valueInst.getCurCellHeight(rowIndex);
                continue;
            } else {
                adjustedStartRow++;
            }

            let cellPositionX = -this.scrollLeftvalue % colWidth;
            let rowData = this.sheetData[adjustedStartRow - 1];

            cellPositionY += this.valueInst.getCurCellHeight(rowIndex);
            let availableRowIndex = Object.keys(rowData) - "0";

            for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
                let cellProperties =
                    rowData[availableRowIndex][colIndex]?.properties;

                if (cellProperties) {
                    const fontColor = this.extractProperty(cellProperties, 1);
                    const fontStyle = this.extractProperty(cellProperties, 2);
                    const fontWeight = this.extractProperty(cellProperties, 3);
                    const fontSize = this.extractProperty(
                        cellProperties,
                        4,
                        "12pt"
                    );
                    const fontFamily = this.extractProperty(
                        cellProperties,
                        5,
                        "calibri"
                    );

                    this.mainCtx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
                    this.mainCtx.fillStyle = `${fontColor}`;

                    let newData = rowData[availableRowIndex][colIndex]?.data;
                    this.mainCtx.save();
                    this.mainCtx.beginPath();
                    this.mainCtx.rect(
                        cellPositionX + 4,
                        cellPositionY - 21,
                        this.valueInst.getCurCellWidth(colIndex) - 10,
                        this.valueInst.getCurCellHeight(rowIndex)
                    );
                    this.mainCtx.clip();
                    this.mainCtx.fillText(
                        newData,
                        cellPositionX + 4,
                        cellPositionY - 1
                    );
                    this.mainCtx.restore();
                }
                cellPositionX += this.valueInst.getCurCellWidth(colIndex);
            }
            availableRowIndex++;
        }
    }

    /**
     * Extracts a specific property value from a string of properties.
     * @param {String} properties
     * @param {number} position
     * @param {string} [defaultValue=""]
     * @returns {string}
     */
    extractProperty(properties, position, defaultValue = "") {
        const positions = this.getPos(properties, "*", position);
        return (
            properties?.slice(positions[0] + 1, positions[1]) || defaultValue
        );
    }

    /**
     * Finds the start and end positions of the nth occurrence of a substring within a string.
     * @param {String} [str=""]
     * @param {String} subStr
     * @param {number[]} i
     * @returns
     */
    getPos(str = "", subStr, i) {
        return [
            str.split(subStr, i).join(subStr).length,
            str.split(subStr, i + 1).join(subStr).length,
        ];
    }

    /**
     * Renders the top header row on the canvas, displaying column headers
     * @param {string} [transparentColor=""]
     */
    renderTopHeader(transparentColor = "") {
        const canvasHeight = this.mainCanvas.width;
        const colWidth = 100;
        const startCol = Math.floor(this.scrollLeftvalue / colWidth);
        const endCol = Math.ceil(
            (this.scrollLeftvalue + canvasHeight) / colWidth
        );
        let cellPositionX = -this.scrollLeftvalue % colWidth;

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

        for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
            cellPositionX += this.valueInst.getCurCellWidth(colIndex);

            this.topHeaderCtx.save();
            this.topHeaderCtx.beginPath();
            this.topHeaderCtx.moveTo(cellPositionX + 0.5, 0);
            this.topHeaderCtx.lineTo(
                cellPositionX + 0.5,
                this.topHeaderCtx.canvas.height
            );

            if (this.isColumnSelectedFun(colIndex + 1)) {
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
        for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
            cellPositionX += this.valueInst.getCurCellWidth(colIndex);
            this.topHeaderCtx.save();
            let headerText = this.valueInst.convertNumToChar(colIndex + 1);
            let xPosition =
                cellPositionX - this.valueInst.getCurCellWidth(colIndex) / 2;
            let yPosition = 16;

            this.topHeaderCtx.fillStyle = this.headerFillStyle(
                "topheader",
                colIndex,
                transparentColor,
                this.currSelectedCol
            );
            this.topHeaderCtx.font = this.headerFont("topheader", colIndex);
            this.topHeaderCtx.fillText(headerText, xPosition, yPosition + 1);
            this.topHeaderCtx.restore();

            if (
                colIndex == this.resizeGridInst.columnIndexAtDraggablepoint &&
                cellPositionX - this.resizeGridInst.columnDraggedPos >= 20
            ) {
                this.resizeLineVertical.style.top = 0;
                this.resizeLineVertical.style.left = `${
                    cellPositionX * this.scale
                }px`;
            }
        }
    }

    /**
     * Renders the left header row on the canvas, displaying column headers
     * @param {string} [transparentColor=""]
     */
    renderLeftHeader(transparentColor = "") {
        const rowHeight = 21;
        const startRow = Math.floor(this.scrollTopvalue / rowHeight);
        const endRow = Math.ceil(
            (this.scrollTopvalue + this.mainCanvas.height) / rowHeight
        );
        let cellPosition = -this.scrollTopvalue % rowHeight;

        this.leftHeaderCtx.save();
        this.leftHeaderCtx.beginPath();
        this.leftHeaderCtx.moveTo(40 - 0.5, 0);
        this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
        this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
        this.leftHeaderCtx.stroke();
        this.leftHeaderCtx.restore();
        this.highlightInst.highlightLeftHeaders(transparentColor);

        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            cellPosition += this.valueInst.getCurCellHeight(rowIndex);

            this.leftHeaderCtx.save();
            this.leftHeaderCtx.beginPath();
            this.leftHeaderCtx.moveTo(2, cellPosition + 0.5);
            this.leftHeaderCtx.lineTo(
                this.leftHeaderCtx.canvas.width,
                cellPosition + 0.5
            );

            if (this.isRowSelectedFun(rowIndex)) {
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
        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            cellPosition += this.valueInst.getCurCellHeight(rowIndex);
            this.leftHeaderCtx.save();
            let headerText = (rowIndex + 1).toString();
            let yPosition =
                cellPosition - this.valueInst.getCurCellHeight(rowIndex) / 2;

            this.leftHeaderCtx.fillStyle = this.headerFillStyle(
                "leftheader",
                rowIndex,
                transparentColor,
                this.currSelectedRow
            );
            this.leftHeaderCtx.font = this.headerFont("leftheader", rowIndex);

            this.leftHeaderCtx.textAlign = "right";
            this.leftHeaderCtx.fillText(headerText, 35, yPosition + 4);
            this.leftHeaderCtx.restore();

            if (
                rowIndex == this.resizeGridInst.rowIndexAtDraggablepoint &&
                cellPosition - this.resizeGridInst.rowDraggedPos > 10
            ) {
                this.resizeLineHorizontal.style.top = `${
                    cellPosition * this.scale
                }px`;
                this.resizeLineHorizontal.style.left = 0;
            }
        }
    }

    /**
     * Determines the font style for the header based on the header type and selection state.
     * @param {String} header
     * @param {Number} index
     * @returns {String}
     */
    headerFont(header, index) {
        if (
            header == "leftheader" &&
            (this.isRowSelectedFun(index) || this.currSelectedRow === index)
        ) {
            return "bold 14px Arial";
        } else if (
            this.isColumnSelectedFun(index) ||
            this.currSelectedCol === index
        ) {
            return "bold 16px Arial";
        }
        return "10pt Arial";
    }

    /**
     * Determines the fill style for the header based on the header type, selection state, and other parameters.
     * @param {String} header
     * @param {Number} index
     * @param {Sting} transparentColor
     * @param {number} currSelectedIndex
     * @returns {string}
     */
    headerFillStyle(header, index, transparentColor, currSelectedIndex) {
        if (transparentColor) return this.gridStrokeColor;
        if (Array.isArray(currSelectedIndex)) {
            if (header == "leftheader") {
                if (this.isRowSelectedFun(index)) return this.whiteColor;
            } else {
                if (this.isColumnSelectedFun(index)) return this.whiteColor;
            }
            if (currSelectedIndex[0] <= index && index <= currSelectedIndex[1])
                return this.strokeColor;
        } else if (currSelectedIndex === index) {
            return this.whiteColor;
        } else if (currSelectedIndex === "all") {
            return this.strokeColor;
        }
        return this.gridStrokeColor;
    }

    /**
     * Checks if a column is selected based on the current selection state
     * @param {Number} colIndex
     * @returns
     */
    isColumnSelectedFun(colIndex) {
        return (
            this.topheaderSelected &&
            this.currSelectedCol &&
            this.currSelectedCol[0] <= colIndex &&
            colIndex <= this.currSelectedCol[1]
        );
    }

    /**
     * Checks if a row is selected based on the current selection state
     * @param {Number} rowIndex
     * @returns
     */
    isRowSelectedFun(rowIndex) {
        return (
            this.leftheaderSelected &&
            this.currSelectedRow &&
            this.currSelectedRow[0] <= rowIndex &&
            rowIndex <= this.currSelectedRow[1]
        );
    }

    //----------------------Scroll Functionality----------------------

    /**
     * a function to handle scroll behaviour
     */
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
                this.apiRequestsInst.fetchUserData(offset);
            }

            if (this.scrollTopvalue > 9000) {
                main.style.height = `${this.scrollTopvalue + 1000}px`;
            }

            if (this.scrollLeftvalue > 100) {
                main.style.width = `${this.scrollLeftvalue + 2000}px`;
            }

            this.clearMainCanvas();
            this.clearLeftHeader();
            this.clearTopHeader();
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

    //----------------------keyboard Events----------------------
    /**
     * a function to handle to all keyboard events
     * @param {PointerEvent} e - took the value of a key
     * @returns
     */
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
            this.apiRequestsInst.deleteData();
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
            this.apiRequestsInst.updateData();
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
