class DrawHighlight {
    constructor(
        mainInst,
        mainCtx,
        leftHeaderCtx,
        topHeaderCtx,
        selectedDimensionsMain,
        valueInst,
        inputBox,
        inputBoxPosition,
        drawGrid,
        sheetData
    ) {
        this.mainInst = mainInst;
        this.mainCtx = mainCtx;
        this.leftHeaderCtx = leftHeaderCtx;
        this.topHeaderCtx = topHeaderCtx;
        this.mainInst.selectedDimensionsMain = selectedDimensionsMain;
        this.valueInst = valueInst;
        this.inputBox = inputBox;
        this.inputBoxPosition = inputBoxPosition;
        this.drawGrid = drawGrid;
        this.sheetData = sheetData;
        this.scale = window.devicePixelRatio;

        /**
         * @type {string} - color used to fill selected area
         */
        this.areaHighlightColor = "rgb(231,241,236)";

        /**
         * @type {string} - color used to fill headers of selected area
         */
        this.headersHighlightColor = "rgb(202,234,216)";

        /**
         * coordinates for highlighting headers [x,y,width,height]
         * @type {number[]}
         */
        this.headersHighlightCoordinate = [0, 0, 0, 0];

        /**
         * Indicate whether an area is selected
         * @type {boolean}
         */
        this.isAreaSelected = false;

        /**
         * Starting index of the mouse down event for selection.
         * @type {number[] | null}
         */
        this.startingIndex = [0, 0];

        this.highlightSelectedAreaEvents();
        this.highlightSelectedArea();
    }

    /**
     * Calculates the fill area based on the header type and scroll positions.
     * @param {string} header - The header type, either "leftheader" or another value indicating column header.
     * @returns {number[]} - An array containing [x, y, width, height] representing the fill area coordinates and dimensions.
     */
    calculateFillArea(header) {
        const [startX, startY, endX, endY] = this.headersHighlightCoordinate;
        let x = 0,
            y = 0,
            width = 0,
            height = 0;

        const scrollTop = this.mainInst.scrollTopvalue;
        const scrollLeft = this.mainInst.scrollLeftvalue;
        const cellHeight = this.valueInst.defaultCellHeight;
        const cellWidth = this.valueInst.defaultCellWidth;

        let cellPositionY = -scrollTop % cellHeight;
        let startTop = Math.ceil(scrollTop / 21);

        let cellPositionX = -scrollLeft % cellWidth;
        let startLeft = this.valueInst.getCurColumnIndex(scrollLeft);

        if (header == "leftheader") {
            for (let i = startTop; i < startY; i++) {
                y += this.valueInst.getCurCellHeight(i);
            }

            for (let i = Math.max(startTop, startY); i <= endY; i++) {
                height += this.valueInst.getCurCellHeight(i);
            }
        } else {
            for (let i = startLeft; i < startX; i++) {
                x += this.valueInst.getCurCellWidth(i);
            }
            for (let i = Math.max(startLeft, startX); i <= endX; i++) {
                width += this.valueInst.getCurCellWidth(i);
            }
        }
        y += cellPositionY <= -1 ? 21 + cellPositionY : cellPositionY;
        x += cellPositionX;
        return [x, y, width, height];
    }

    /**
     * Highlights the left headers based on the selected columns or rows.
     * @param {string} [transparentColor=""] - The color to be used for transparent highlighting. Defaults to an empty string.
     */
    highlightLeftHeaders(transparentColor = "") {
        const [x, y, width, height] = this.calculateFillArea("leftheader");

        this.leftHeaderCtx.save();
        this.leftHeaderCtx.beginPath();

        const isColSelected = this.mainInst.isColSelected;
        const isRowSelected = this.mainInst.isRowSelected;
        const strokeColor = this.mainInst.strokeColor;
        const highlightColor = transparentColor || this.headersHighlightColor;

        if (isColSelected && isRowSelected) {
            this.leftHeaderCtx.fillStyle = strokeColor;
            this.leftHeaderCtx.fillRect(
                0,
                0,
                44,
                this.leftHeaderCtx.canvas.height
            );
        } else if (isColSelected) {
            this.leftHeaderCtx.moveTo(39, 0);
            this.leftHeaderCtx.lineTo(39, this.leftHeaderCtx.canvas.height);
            this.leftHeaderCtx.fillStyle = this.headersHighlightColor;
            this.leftHeaderCtx.fillRect(
                0,
                0,
                44,
                this.leftHeaderCtx.canvas.height
            );
            this.leftHeaderCtx.lineWidth = 2;
            this.leftHeaderCtx.strokeStyle = strokeColor;
            this.leftHeaderCtx.stroke();
        } else if (isRowSelected) {
            this.leftHeaderCtx.fillStyle = strokeColor;
            this.leftHeaderCtx.fillRect(
                0,
                y - 2,
                this.leftHeaderCtx.canvas.width,
                height + 4
            );
        } else {
            this.leftHeaderCtx.moveTo(39, y - 2);
            this.leftHeaderCtx.lineTo(39, y + height + 3);
            this.leftHeaderCtx.fillStyle =
                transparentColor == ""
                    ? this.headersHighlightColor
                    : transparentColor;
            this.leftHeaderCtx.fillRect(0, y, 40, height);
            this.leftHeaderCtx.lineWidth = 2;
            this.leftHeaderCtx.strokeStyle =
                transparentColor == ""
                    ? this.mainInst.strokeColor
                    : transparentColor;
            this.leftHeaderCtx.stroke();
        }
        this.leftHeaderCtx.restore();
    }

    /**
     * Highlights the top header based on the selected columns or rows.
     * @param {string} [transparentColor=""] - The color to be used for transparent highlighting. Defaults to an empty string.
     */
    highlightTopHeader(transparentColor = "") {
        const [x, y, width, height] = this.calculateFillArea("topheader");

        this.topHeaderCtx.save();
        this.topHeaderCtx.beginPath();

        const isColSelected = this.mainInst.isColSelected;
        const isRowSelected = this.mainInst.isRowSelected;
        const strokeColor = this.mainInst.strokeColor;
        const highlightColor = transparentColor || this.headersHighlightColor;

        if (isColSelected && isRowSelected) {
            this.topHeaderCtx.fillStyle = strokeColor;
            this.topHeaderCtx.fillRect(
                0,
                0,
                this.topHeaderCtx.canvas.width,
                24
            );
        } else if (isColSelected) {
            this.topHeaderCtx.fillStyle = strokeColor;
            this.topHeaderCtx.fillRect(
                x - 2,
                0,
                width + 4,
                this.topHeaderCtx.canvas.height
            );
        } else if (isRowSelected) {
            this.topHeaderCtx.moveTo(0, 23);
            this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 23);
            this.topHeaderCtx.fillStyle = this.headersHighlightColor;
            this.topHeaderCtx.fillRect(
                0,
                0,
                this.topHeaderCtx.canvas.width,
                26
            );
            this.topHeaderCtx.lineWidth = 2;
            this.topHeaderCtx.strokeStyle = strokeColor;
            this.topHeaderCtx.stroke();
        } else {
            this.topHeaderCtx.fillStyle = highlightColor;
            this.topHeaderCtx.fillRect(x, 0, width, 24);
            this.topHeaderCtx.moveTo(x - 2, 23);
            this.topHeaderCtx.lineTo(x + width + 2.5, 23);
            this.topHeaderCtx.lineWidth = 2;
            this.topHeaderCtx.strokeStyle =
                transparentColor || this.mainInst.strokeColor;
            this.topHeaderCtx.stroke();
        }
        this.topHeaderCtx.restore();
    }

    /**
     * Highlights the selected area within the grid based on the current selection.
     * @param {string} [strokeColor=""] - The color for the border stroke. Defaults to an empty string, which uses the default stroke color.
     * @param {string} [fillColor=""] - The color for filling the selected area. Defaults to an empty string, which uses the default fill color.
     */
    highlightSelectedArea(strokeColor = "", fillColor = "") {
        const [startX, startY, endX, endY] =
            this.mainInst.selectedDimensionsMain;

        const nameBoxInput = document.getElementById("nameBoxInput");
        let currentCell = `${this.valueInst.convertNumToChar(startX + 1)}${
            startY + 1
        }`;
        nameBoxInput.value = currentCell;

        let x = 0,
            y = 0,
            width = 0,
            height = 0;

        const scrollTop = this.mainInst.scrollTopvalue;
        const scrollLeft = this.mainInst.scrollLeftvalue;

        let cellPositionY = -scrollTop % this.valueInst.defaultCellHeight;
        let startTop = Math.ceil(scrollTop / 21);

        let cellPositionX = -scrollLeft % this.valueInst.defaultCellWidth;
        let startLeft = this.valueInst.getCurColumnIndex(scrollLeft);

        for (let i = startLeft; i < startX; i++) {
            x += this.valueInst.getCurCellWidth(i);
        }
        for (let i = startTop; i < startY; i++) {
            y += this.valueInst.getCurCellHeight(i);
        }

        y += cellPositionY <= -1 ? 21 + cellPositionY : cellPositionY;
        x += cellPositionX;

        for (let i = Math.max(startLeft, startX); i <= endX; i++) {
            width += this.valueInst.getCurCellWidth(i);
        }

        for (let i = Math.max(startTop, startY); i <= endY; i++) {
            height += this.valueInst.getCurCellHeight(i);
        }

        this.mainInst.cellPositionLeft = 0;
        this.mainInst.cellPositionTop = 0;

        if (this.mainInst.isColSelected || this.mainInst.isRowSelected) {
            this.mainInst.x1CellIndex = startX;
            this.mainInst.y1CellIndex = startY;
        }

        for (let i = 0; i < this.mainInst.x1CellIndex; i++) {
            this.mainInst.cellPositionLeft += this.valueInst.getCurCellWidth(i);
        }

        let cellPositionTop = 0;
        let cellPositionLeft = 0;

        for (let i = startTop; i < this.mainInst.y1CellIndex; i++) {
            cellPositionTop += this.valueInst.getCurCellHeight(i);
        }
        for (let i = startLeft; i < this.mainInst.x1CellIndex; i++) {
            cellPositionLeft += this.valueInst.getCurCellWidth(i);
        }

        for (let i = 0; i < this.mainInst.y1CellIndex; i++) {
            this.mainInst.cellPositionTop += this.valueInst.getCurCellHeight(i);
        }

        this.mainCtx.save();

        this.mainCtx.fillStyle =
            fillColor == "" ? this.areaHighlightColor : fillColor;

        if (this.mainInst.isColSelected) {
            this.mainInst.currSelectedCol = [startX, endX];
            if (
                this.mainInst.topheaderSelected &&
                this.mainInst.leftheaderSelected
            ) {
                this.mainInst.currSelectedRow = [0, 100];
            } else {
                this.mainInst.currSelectedRow = "all";
            }
            this.mainCtx.fillRect(x, 0, width, this.mainCtx.canvas.height);
        } else if (this.mainInst.isRowSelected) {
            this.mainInst.currSelectedRow = [startY, endY];
            this.mainInst.currSelectedCol = "all";
            this.mainCtx.fillRect(0, y, this.mainCtx.canvas.width, height);
        } else {
            this.mainInst.currSelectedCol = [startX, endX];
            this.mainInst.currSelectedRow = [startY, endY];
            this.mainCtx.fillRect(x, y, width, height);
        }

        if (this.mainInst.isTopAreaSelected) {
            this.mainInst.currSelectedCol = [startX, endX];
        }

        if (this.mainInst.isLeftAreaSelected) {
            this.mainInst.currSelectedRow = [startY, endY];
        }

        this.mainCtx.fillStyle = this.mainInst.whiteColor;
        this.mainCtx.fillRect(
            cellPositionLeft,
            cellPositionTop,
            this.valueInst.getCurCellWidth(this.mainInst.x1CellIndex),
            this.valueInst.getCurCellHeight(this.mainInst.y1CellIndex)
        );
        this.mainCtx.lineWidth = 2;
        this.mainCtx.strokeStyle =
            strokeColor == "" ? this.mainInst.strokeColor : strokeColor;

        if (this.mainInst.isColSelected) {
            this.mainCtx.strokeRect(
                x - 0.5,
                -0.5,
                width + 1,
                this.mainCtx.canvas.height
            );
        } else if (this.mainInst.isRowSelected) {
            this.mainCtx.strokeRect(
                -1,
                y - 1,
                this.mainCtx.canvas.width,
                height + 2
            );
        } else {
            this.mainCtx.strokeRect(x - 0.5, y - 0.5, width + 1, height + 1);
        }

        this.mainCtx.restore();
        this.headersHighlightCoordinate = [startX, startY, endX, endY];
    }

    /**
     * event listeners to handle highlighting and interaction within the grid.
     */
    highlightSelectedAreaEvents() {
        this.mainCtx.canvas.addEventListener("dblclick", (e) => {
            this.mainInst.inputBoxPosition();
            this.inputBox.focus();
            this.mainInst.isAnimationRunning = false;
            this.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.renderLeftHeader();
            this.mainInst.renderTopHeader();
        });

        this.mainCtx.canvas.addEventListener("pointerdown", (e) => {
            if (e.button != 0) return;
            this.highlightAreaPointerDown(e);
        });

        window.addEventListener("pointermove", (e) => {
            this.highlightAreaPointerMove(e);
        });

        window.addEventListener("pointerup", () => {
            this.highlightAreaPointerUp();
        });

        window.addEventListener("pointerleave", () => {
            this.highlightAreaPointerUp();
        });
    }

    /**
     * Handles the pointer down event to initiate the selection of an area in the grid.
     * @param {PointerEvent} e
     */
    highlightAreaPointerDown(e) {
        const contextmenu = document.getElementById("contextmenu");
        contextmenu.style.display = "none";
        this.mainInst.topheaderSelected = false;
        this.mainInst.leftheaderSelected = false;
        this.inputBox.style.display = "none";
        this.mainInst.isColSelected = false;
        this.mainInst.isRowSelected = false;

        const rect = this.mainCtx.canvas.getBoundingClientRect();
        this.isAreaSelected = true;
        const clickX =
            (e.clientX - rect.left + this.mainInst.scrollLeftvalue) /
            this.scale;
        const clickY =
            (e.clientY - rect.top + this.mainInst.scrollTopvalue) / this.scale;

        const colIndex = this.valueInst.getCurColumnIndex(clickX);
        const rowIndex = this.valueInst.getCurRowIndex(clickY);

        this.startingIndex = [colIndex, rowIndex];

        this.mainInst.cellPositionLeft = 0;
        this.mainInst.cellPositionTop = 0;
        this.mainInst.x1CellIndex = colIndex;
        this.mainInst.y1CellIndex = rowIndex;
        this.x2CellIndex = colIndex;
        this.y2CellIndex = rowIndex;

        for (
            let i = this.mainInst.scrollLeftvalue;
            i < this.mainInst.x1CellIndex;
            i++
        ) {
            this.mainInst.cellPositionLeft += this.valueInst.getCurCellWidth(i);
        }
        for (
            let i = this.mainInst.scrollTopvalue;
            i < this.mainInst.y1CellIndex;
            i++
        ) {
            this.mainInst.cellPositionTop += this.valueInst.getCurCellHeight(i);
        }

        const startX = Math.min(this.startingIndex[0], colIndex);
        const startY = Math.min(this.startingIndex[1], rowIndex);
        const endX = Math.max(this.startingIndex[0], colIndex);
        const endY = Math.max(this.startingIndex[1], rowIndex);

        this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
        this.highlightSelectedArea();
        this.mainInst.drawGrid();
        this.mainInst.clearLeftHeader();
        this.mainInst.clearTopHeader();
        this.mainInst.renderLeftHeader();
        this.mainInst.renderTopHeader();
    }

    /**
     * Handles the pointer move event to update the selection area in the grid.
     * @param {PointerEvent} e
     * */

    highlightAreaPointerMove(e) {
        if (this.isAreaSelected) {
            const rect = this.mainCtx.canvas.getBoundingClientRect();
            const clickX =
                (e.clientX - rect.left + this.mainInst.scrollLeftvalue) /
                this.scale;
            const clickY =
                (e.clientY - rect.top + this.mainInst.scrollTopvalue) /
                this.scale;

            const colIndex = this.valueInst.getCurColumnIndex(clickX);
            const rowIndex = this.valueInst.getCurRowIndex(clickY);

            // Determine dimensions of selection
            const startX = Math.max(
                0,
                Math.min(this.startingIndex[0], colIndex)
            );
            const startY = Math.max(
                0,
                Math.min(this.startingIndex[1], rowIndex)
            );
            const endX = Math.max(this.startingIndex[0], colIndex);
            const endY = Math.max(this.startingIndex[1], rowIndex);

            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
            this.headersHighlightCoordinate = [startX, startY, endX, endY];
            this.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.renderLeftHeader();
            this.mainInst.renderTopHeader();
        }
    }

    /**
     * Handles the pointer up event, finalizing the selection area and calculating statistical data.
     */
    highlightAreaPointerUp() {
        this.isAreaSelected = false;
        const [startX, startY, endX, endY] =
            this.mainInst.selectedDimensionsMain;

        let sum = 0,
            max = Number.MIN_VALUE,
            min = Number.MAX_VALUE,
            avg = 0,
            count = 0,
            numerical_count = 0;
        for (
            let j = this.mainInst.scrollTopvalue + startY;
            j <= this.mainInst.scrollTopvalue + endY;
            j++
        ) {
            const result = this.sheetData.find((item) => item[j + 1]);
            for (let i = startX; i <= endX; i++) {
                let currentData = result ? result[j + 1][i] : "";
                count++;
                if (!isNaN(Number(currentData?.data))) {
                    sum += Number(currentData.data);
                    max = Math.max(max, currentData.data);
                    min = Math.min(min, currentData.data);
                    numerical_count++;
                }
                avg = sum / numerical_count;
            }
        }
        const mathsCalculation = document.getElementById("mathsCalculation");
        if (numerical_count == 0 || count <= 1) {
            mathsCalculation.innerHTML = `
            <p>Count: ${count}</p>
            `;
        } else {
            mathsCalculation.innerHTML = `
          <p>Average: ${avg.toFixed(2)}</p>
          <p>Count: ${count}</p>
          <p>Numerical Count: ${numerical_count}</p>
          <p>Min: ${min}</p>
          <p>Max: ${max}</p>
          <p>Sum: ${sum}</p>
          `;
        }
    }
}
export { DrawHighlight };
