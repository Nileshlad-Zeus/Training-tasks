class DrawHighlight {
    constructor(
        mainInst,
        mainCtx,
        leftHeaderCtx,
        topHeaderCtx,
        mainCanvas,
        selectedDimensionsMain,
        valueInst,
        inputBox,
        inputBoxPosition,
        drawGrid,
        sheetData,
        highlightDiv
    ) {
        this.mainInst = mainInst;

        this.mainCtx = mainCtx;
        this.leftHeaderCtx = leftHeaderCtx;
        this.topHeaderCtx = topHeaderCtx;
        this.mainCanvas = mainCanvas;
        this.mainInst.selectedDimensionsMain = selectedDimensionsMain;
        this.valueInst = valueInst;
        this.inputBox = inputBox;
        this.inputBoxPosition = inputBoxPosition;
        this.drawGrid = drawGrid;
        this.sheetData = sheetData;
        this.scale = window.devicePixelRatio;
        this.highlightDiv = highlightDiv;
    }

    highlightLeftHeaders(transparentColor = "") {
        this.leftHeaderCtx.save();
        this.leftHeaderCtx.beginPath();
        this.leftHeaderCtx.moveTo(40 - 0.5, 0);
        this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
        this.leftHeaderCtx.strokeStyle = this.mainInst.gridStrokeColor;
        this.leftHeaderCtx.stroke();
        this.leftHeaderCtx.restore();

        const [startX, startY, endX, endY] =
            this.mainInst.headersHighlightCoordinate;

        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;

        let cellPositionY =
            -this.mainInst.scrollYvalue % this.valueInst.defaultCellHeight;
        let startTop = this.valueInst.getCurRowIndex(
            this.mainInst.scrollYvalue
        );

        let cellPositionX =
            -this.mainInst.scrollXvalue % this.valueInst.defaultCellWidth;
        let startLeft = this.valueInst.getCurColumnIndex(
            this.mainInst.scrollXvalue
        );

        for (let i = startLeft; i < startX; i++) {
            x += this.valueInst.getCurCellWidth(i);
        }
        for (let i = startTop; i < startY; i++) {
            y += this.valueInst.getCurCellHeight(i);
        }
        y = y + cellPositionY;
        x = x + cellPositionX;
        let temp2 = Math.max(startLeft, startX);
        for (let i = temp2; i <= endX; i++) {
            width += this.valueInst.getCurCellWidth(i);
        }
        let temp = Math.max(startTop, startY);
        for (let i = temp; i <= endY; i++) {
            height += this.valueInst.getCurCellHeight(i);
        }

        if (this.mainInst.isColSelected && this.mainInst.isRowSelected) {
            this.leftHeaderCtx.save();
            this.leftHeaderCtx.beginPath();
            this.leftHeaderCtx.fillStyle = this.mainInst.strokeColor;
            this.leftHeaderCtx.fillRect(
                0,
                0,
                44,
                this.leftHeaderCtx.canvas.height
            );
            this.leftHeaderCtx.restore();
        } else if (this.mainInst.isColSelected) {
            //left Header
            this.leftHeaderCtx.save();
            this.leftHeaderCtx.beginPath();
            this.leftHeaderCtx.moveTo(39, 0);
            this.leftHeaderCtx.lineTo(39, this.leftHeaderCtx.canvas.height);
            this.leftHeaderCtx.fillStyle = this.mainInst.headersHighlightColor;
            this.leftHeaderCtx.fillRect(
                0,
                0,
                44,
                this.leftHeaderCtx.canvas.height
            );
            this.leftHeaderCtx.lineWidth = 2;
            this.leftHeaderCtx.strokeStyle = this.mainInst.strokeColor;
            this.leftHeaderCtx.stroke();
            this.leftHeaderCtx.restore();
        } else if (this.mainInst.isRowSelected) {
            //Left Header
            this.leftHeaderCtx.save();
            this.leftHeaderCtx.beginPath();
            this.leftHeaderCtx.fillStyle = this.mainInst.strokeColor;
            this.leftHeaderCtx.fillRect(
                0,
                y - 2,
                this.leftHeaderCtx.canvas.width,
                height + 4
            );
            this.leftHeaderCtx.restore();
        } else {
            this.leftHeaderCtx.save();
            this.leftHeaderCtx.beginPath();
            this.leftHeaderCtx.moveTo(39, y - 2);
            this.leftHeaderCtx.lineTo(39, y + height + 3);
            this.leftHeaderCtx.fillStyle =
                transparentColor == ""
                    ? this.mainInst.headersHighlightColor
                    : transparentColor;
            this.leftHeaderCtx.fillRect(0, y, 40, height);
            this.leftHeaderCtx.lineWidth = 2;
            this.leftHeaderCtx.strokeStyle =
                transparentColor == ""
                    ? this.mainInst.strokeColor
                    : transparentColor;
            this.leftHeaderCtx.stroke();
            this.leftHeaderCtx.restore();
        }
    }

    highlightTopHeader(transparentColor = "") {
        console.log(transparentColor);

        const [startX, startY, endX, endY] =
            this.mainInst.headersHighlightCoordinate;
        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;

        let cellPositionY =
            -this.mainInst.scrollYvalue % this.valueInst.defaultCellHeight;
        let startTop = this.valueInst.getCurRowIndex(
            this.mainInst.scrollYvalue
        );

        let cellPositionX =
            -this.mainInst.scrollXvalue % this.valueInst.defaultCellWidth;
        let startLeft = this.valueInst.getCurColumnIndex(
            this.mainInst.scrollXvalue
        );

        for (let i = startLeft; i < startX; i++) {
            x += this.valueInst.getCurCellWidth(i);
        }
        for (let i = startTop; i < startY; i++) {
            y += this.valueInst.getCurCellHeight(i);
        }
        y = y + cellPositionY;
        x = x + cellPositionX;
        let temp2 = Math.max(startLeft, startX);
        for (let i = temp2; i <= endX; i++) {
            width += this.valueInst.getCurCellWidth(i);
        }
        let temp = Math.max(startTop, startY);
        for (let i = temp; i <= endY; i++) {
            height += this.valueInst.getCurCellHeight(i);
        }

        if (this.mainInst.isColSelected && this.mainInst.isRowSelected) {
            this.topHeaderCtx.save();
            this.topHeaderCtx.beginPath();
            this.topHeaderCtx.fillStyle = this.mainInst.strokeColor;
            this.topHeaderCtx.fillRect(
                0,
                0,
                this.topHeaderCtx.canvas.width,
                24
            );
            this.topHeaderCtx.restore();
        } else if (this.mainInst.isColSelected) {
            //Top Header
            this.topHeaderCtx.save();
            this.topHeaderCtx.beginPath();
            this.topHeaderCtx.fillStyle = this.mainInst.strokeColor;
            this.topHeaderCtx.fillRect(
                x - 2,
                0,
                width + 4,
                this.topHeaderCtx.canvas.height
            );
            this.topHeaderCtx.restore();
        } else if (this.mainInst.isRowSelected) {
            this.topHeaderCtx.save();
            this.topHeaderCtx.beginPath();
            this.topHeaderCtx.moveTo(0, 23);
            this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 23);
            this.topHeaderCtx.fillStyle = this.mainInst.headersHighlightColor;
            this.topHeaderCtx.fillRect(
                0,
                0,
                this.topHeaderCtx.canvas.width,
                26
            );
            this.topHeaderCtx.lineWidth = 2;
            this.topHeaderCtx.strokeStyle = this.mainInst.strokeColor;
            this.topHeaderCtx.stroke();
            this.topHeaderCtx.restore();
        } else {
            this.topHeaderCtx.save();
            this.topHeaderCtx.beginPath();
            console.log(transparentColor);

            this.topHeaderCtx.fillStyle =
                transparentColor == ""
                    ? this.mainInst.headersHighlightColor
                    : "#ffffff00";
            this.topHeaderCtx.fillRect(x, 0, width, 24);
            this.topHeaderCtx.moveTo(x - 2, 23);
            this.topHeaderCtx.lineTo(x + width + 2.5, 23);
            this.topHeaderCtx.lineWidth = 2;
            this.topHeaderCtx.strokeStyle =
                transparentColor == ""
                    ? this.mainInst.strokeColor
                    : transparentColor;
            this.topHeaderCtx.stroke();
            this.topHeaderCtx.restore();
        }
    }

    highlightSelectedArea(strokeColor = "", fillColor = "") {
        console.log("Highlight");

        const [startX, startY, endX, endY] =
            this.mainInst.selectedDimensionsMain;

        const nameBoxInput = document.getElementById("nameBoxInput");
        let currentCell = `${this.valueInst.convertNumToChar(startX + 1)}${
            startY + 1
        }`;
        nameBoxInput.value = currentCell;

        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;

        let cellPositionY =
            -this.mainInst.scrollYvalue % this.valueInst.defaultCellHeight;
        let startTop = this.valueInst.getCurRowIndex(
            this.mainInst.scrollYvalue
        );

        let cellPositionX =
            -this.mainInst.scrollXvalue % this.valueInst.defaultCellWidth;
        let startLeft = this.valueInst.getCurColumnIndex(
            this.mainInst.scrollXvalue
        );

        for (let i = startLeft; i < startX; i++) {
            x += this.valueInst.getCurCellWidth(i);
        }
        for (let i = startTop; i < startY; i++) {
            y += this.valueInst.getCurCellHeight(i);
        }
        y = y + cellPositionY;
        x = x + cellPositionX;
        let temp2 = Math.max(startLeft, startX);
        for (let i = temp2; i <= endX; i++) {
            width += this.valueInst.getCurCellWidth(i);
        }
        let temp = Math.max(startTop, startY);
        for (let i = temp; i <= endY; i++) {
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

        // y = y + cellPositionY;
        let cellPositionTop = 0;
        for (let i = startTop; i < startY; i++) {
            cellPositionTop += this.valueInst.getCurCellHeight(i);
        }
        this.mainInst.cellPositionTop = cellPositionTop + cellPositionY;

        this.mainCtx.save();

        this.mainCtx.fillStyle =
            fillColor == "" ? this.mainInst.areaHighlightColor : fillColor;

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
            this.mainInst.cellPositionLeft,
            this.mainInst.cellPositionTop,
            this.valueInst.getCurCellWidth(this.mainInst.x1CellIndex),
            this.valueInst.getCurCellHeight(this.mainInst.y1CellIndex)
        );

        this.mainCtx.lineWidth = 2;
        this.mainCtx.strokeStyle =
            strokeColor == "" ? this.mainInst.strokeColor : strokeColor;
        console.log(strokeColor);

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

        this.mainInst.headersHighlightCoordinate = [startX, startY, endX, endY];
    }

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
            this.highlightAreaPointerDown(e);
        });

        window.addEventListener("pointermove", (e) => {
            this.highlightAreaPointerMove(e);
        });

        window.addEventListener("pointerup", (e) => {
            this.highlightAreaPointerUp();
        });

        window.addEventListener("pointerleave", (e) => {
            this.highlightAreaPointerUp();
        });
    }

    highlightAreaPointerDown(e) {
        this.mainInst.topheaderSelected = false;
        this.mainInst.leftheaderSelected = false;
        this.inputBox.style.display = "none";
        this.mainInst.isColSelected = false;
        this.mainInst.isRowSelected = false;
        this.mainInst.alreadyCopy = 0;

        const rect = this.mainCtx.canvas.getBoundingClientRect();
        this.mainInst.isAreaSelected = true;
        const clickX =
            (e.clientX - rect.left + this.mainInst.scrollXvalue) / this.scale;
        const clickY =
            (e.clientY - rect.top + this.mainInst.scrollYvalue) / this.scale;

        const colIndex = this.valueInst.getCurColumnIndex(clickX);
        const rowIndex = this.valueInst.getCurRowIndex(clickY);

        this.mainInst.startingIndex = [
            this.valueInst.getCurColumnIndex(clickX),
            this.valueInst.getCurRowIndex(clickY),
        ];

        this.mainInst.cellPositionLeft = 0;
        this.mainInst.cellPositionTop = 0;
        this.mainInst.x1CellIndex = this.valueInst.getCurColumnIndex(clickX);
        this.mainInst.y1CellIndex = this.valueInst.getCurRowIndex(clickY);
        this.x2CellIndex = this.valueInst.getCurColumnIndex(clickX);
        this.y2CellIndex = this.valueInst.getCurRowIndex(clickY);

        for (let i = 0; i < this.mainInst.x1CellIndex; i++) {
            this.mainInst.cellPositionLeft += this.valueInst.getCurCellWidth(i);
        }
        for (
            let i = this.mainInst.scrollYvalue;
            i < this.mainInst.y1CellIndex;
            i++
        ) {
            this.mainInst.cellPositionTop += this.valueInst.getCurCellHeight(i);
        }

        const startX = Math.min(this.mainInst.startingIndex[0], colIndex);
        const startY = Math.min(this.mainInst.startingIndex[1], rowIndex);
        const endX = Math.max(this.mainInst.startingIndex[0], colIndex);
        const endY = Math.max(this.mainInst.startingIndex[1], rowIndex);

        this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
        this.highlightSelectedArea();
        this.mainInst.drawGrid();
        this.mainInst.clearLeftHeader();
        this.mainInst.clearTopHeader();
        // this.highlightHeaders();
        this.mainInst.renderLeftHeader();
        this.mainInst.renderTopHeader();
    }

    highlightAreaPointerMove(e) {
        if (this.mainInst.isAreaSelected) {
            const rect = this.mainCtx.canvas.getBoundingClientRect();
            const clickX =
                (e.clientX - rect.left + this.mainInst.scrollXvalue) /
                this.scale;
            const clickY =
                (e.clientY - rect.top + this.mainInst.scrollYvalue) /
                this.scale;

            const colIndex = this.valueInst.getCurColumnIndex(clickX);
            const rowIndex = this.valueInst.getCurRowIndex(clickY);

            // Determine dimensions of selection
            const startX = Math.max(
                0,
                Math.min(this.mainInst.startingIndex[0], colIndex)
            );
            const startY = Math.max(
                0,
                Math.min(this.mainInst.startingIndex[1], rowIndex)
            );
            const endX = Math.max(this.mainInst.startingIndex[0], colIndex);
            const endY = Math.max(this.mainInst.startingIndex[1], rowIndex);

            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
            this.mainInst.headersHighlightCoordinate = [
                startX,
                startY,
                endX,
                endY,
            ];
            this.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.renderLeftHeader();
            this.mainInst.renderTopHeader();
        }
    }

    highlightAreaPointerUp(e) {
        this.mainInst.isAreaSelected = false;
        const [startX, startY, endX, endY] =
            this.mainInst.selectedDimensionsMain;

        let sum = 0,
            max = Number.MIN_VALUE,
            min = Number.MAX_VALUE,
            avg = 0,
            count = 0,
            numerical_count = 0;
        for (
            let j = this.mainInst.scrollYvalue + startY;
            j <= this.mainInst.scrollYvalue + endY;
            j++
        ) {
            const result = this.sheetData.find((item) => item[j + 1]);
            for (let i = startX; i <= endX; i++) {
                let currentData = result ? result[j + 1][i + 2] : "";
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
