/**
 * Functionlity for copy paste data
 */
class CopyPaste {
    /**
     *
     * @param {Object} mainInst
     * @param {CanvasRenderingContext2D} mainCtx
     * @param {Object} highlightInst
     * @param {Object} valueInst
     */
    constructor(mainInst, mainCtx, highlightInst, valueInst) {
        this.mainInst = mainInst;
        this.mainCtx = mainCtx;
        this.highlightInst = highlightInst;
        this.valueInst = valueInst;

        /**
         * Coordinates for the marching ants animation (startX, startY, endX, endY)
         * @type {number[]}
         */
        this.marchingAntsCoordinates = [0, 0, 0, 0];

        /**
         * Offset for the line dash animation.
         * @type {number}
         */
        this.lineDashOffset = 0;

        let copyIcon = document.querySelector(".copyIcon");
        let pasteIcon = document.querySelector(".pasteIcon");
        copyIcon.addEventListener("click", () => {
            this.marchingAntsCoordinates = this.mainInst.selectedDimensionsMain;
            this.mainInst.isAnimationRunning = true;
            this.startMarchingAntsAnimation();
            this.copyToClipboard();
        });
        
        pasteIcon.addEventListener("click", () => {
            this.pasteToSheet();
        });
    }

    /**
     * this function used for copy the selected area text to clipboard
     */
    copyToClipboard = () => {
        const [startX, startY, endX, endY] = this.marchingAntsCoordinates;
        let textTocopy = "";
        for (let row = startY; row <= endY; row++) {
            const rowData = this.mainInst.sheetData.find(
                (item) => item[row + 1]
            );
            let temp = "";

            for (let col = startX; col <= endX; col++) {
                let cellData = rowData ? rowData[row + 1][col] : "";
                temp = temp + "	" + (cellData ? cellData.data : "");
            }
            textTocopy += temp.slice(1) + "\n";
        }
        navigator.clipboard.writeText(textTocopy);
    };

    /**
     * this function used for paste the selected area text to sheet
     */
    pasteToSheet = async () => {
        let copiedText = await navigator.clipboard.readText();
        if (copiedText) {
            let rowsOfText = copiedText.split("\r\n");
            let numberofRows = rowsOfText.length - 2;
            let numberofCols = rowsOfText[0].split("\t").length - 1;

            this.mainInst.selectedDimensionsMain = [
                this.mainInst.x1CellIndex,
                this.mainInst.y1CellIndex,
                this.mainInst.x1CellIndex + numberofCols,
                this.mainInst.y1CellIndex + numberofRows,
            ];

            this.highlightInst.highlightSelectedArea();

            let rowIndex = 0;
            let colIndex = 0;
            for (
                let row = this.mainInst.y1CellIndex;
                row <= this.mainInst.y1CellIndex + numberofRows;
                row++
            ) {
                let rowData = this.mainInst.sheetData.find(
                    (item) => item[row + 1]
                );
                if (!rowData) {
                    this.mainInst.sheetData.push({
                        [row + 1]: {},
                    });
                }
                rowData = this.mainInst.sheetData.find((item) => item[row + 1]);

                let cells = rowsOfText[rowIndex].split("\t");
                rowIndex++;
                colIndex = 0;
                for (
                    let col = this.mainInst.x1CellIndex;
                    col <= this.mainInst.x1CellIndex + numberofCols;
                    col++
                ) {
                    if (!rowData[row + 1][col]) {
                        rowData[row + 1][col] = {
                            data: cells[colIndex],
                            properties: "*****",
                        };
                    } else {
                        rowData[row + 1][col].data = cells[colIndex];
                    }
                    colIndex++;
                }
            }
            this.mainInst.renderData();
        }
    };

    /**
     * Starts the marching ants animation for the selected area
     */
    startMarchingAntsAnimation() {
        if (this.mainInst.isAnimationRunning) {
            const [startX, startY, endX, endY] = this.marchingAntsCoordinates;

            let posX = 0;
            let posY = 0;
            let width = 0;
            let height = 0;

            let cellPositionY =
                -this.mainInst.scrollTopvalue %
                this.valueInst.defaultCellHeight;
            let startRow = this.valueInst.getCurRowIndex(
                this.mainInst.scrollTopvalue
            );

            let cellPositionX =
                -this.mainInst.scrollLeftvalue %
                this.valueInst.defaultCellWidth;
            let startCol = this.valueInst.getCurColumnIndex(
                this.mainInst.scrollLeftvalue
            );

            for (let col = startCol; col < startX; col++) {
                posX += this.valueInst.getCurCellWidth(col);
            }
            for (let row = startRow; row < startY; row++) {
                posY += this.valueInst.getCurCellHeight(row);
            }
            posX += cellPositionX;
            posY += cellPositionY;

            let tempStartCol = Math.max(startCol, startX);
            for (let col = tempStartCol; col <= endX; col++) {
                width += this.valueInst.getCurCellWidth(col);
            }

            let tempStartRow = Math.max(startRow, startY);
            for (let row = tempStartRow; row <= endY; row++) {
                height += this.valueInst.getCurCellHeight(row);
            }

            if (this.mainInst.animateFullColumn) {
                posY = 0;
                height = this.mainCtx.canvas.height;
            }
            if (this.mainInst.animateFullRow) {
                posX = 0;
                width = this.mainCtx.canvas.width;
            }

            this.lineDashOffset -= 0.2;

            if (this.lineDashOffset < 0) {
                this.lineDashOffset = 8;
            }

            this.mainCtx.save();
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearLeftHeader();
            this.mainInst.clearTopHeader();
            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();

            this.mainCtx.beginPath();
            this.mainCtx.setLineDash([5, 3]);
            this.mainCtx.lineDashOffset = this.lineDashOffset;
            this.mainCtx.lineWidth = 2;
            this.mainCtx.strokeStyle = this.mainInst.strokeColor;
            this.mainCtx.rect(posX + 1, posY + 1, width - 1, height - 1);
            this.mainCtx.stroke();
            this.mainCtx.restore();

            this.animationFrameId = requestAnimationFrame(() =>
                this.startMarchingAntsAnimation()
            );
        }
    }
}

export { CopyPaste };
