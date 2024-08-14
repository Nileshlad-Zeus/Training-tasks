class ResizeGrid {
  /**
   * 
   * @param {Object} mainInst 
   * @param {Object} valueInst 
   * @param {Object} highlightInst 
   */
    constructor(mainInst, valueInst, highlightInst) {
        this.mainInst = mainInst;
        this.valueInst = valueInst;
        this.highlightInst = highlightInst;
        this.scale = window.devicePixelRatio;

        this.colFlag = false;
        this.rowFlag = false;
    }

    /**
     * event Listeners for grid resize
     */
    resizeGridEvents() {
        this.pointerDownHeader = this.mainInst.mainCanvas;

        this.mainInst.topHeaderCanvas.addEventListener("pointerdown", (e) => {
            this.pointerDownHeader = this.mainInst.topHeaderCanvas;
            this.resizeGridPointerDown(e, this.mainInst.topHeaderCanvas);
        });

        this.mainInst.leftHeaderCanvas.addEventListener("pointerdown", (e) => {
            this.pointerDownHeader = this.mainInst.leftHeaderCanvas;
            this.resizeGridPointerDown(e, this.mainInst.leftHeaderCanvas);
        });

        window.addEventListener("pointermove", (e) => {
            let text = e.target.id;
            let result = text.replace(/-sheet-[0,100]/, "");
            if (result == "topHeader") {
                this.pointerDownHeader = this.mainInst.topHeaderCanvas;
            } else if (result == "leftHeader") {
                this.pointerDownHeader = this.mainInst.leftHeaderCanvas;
            }
            this.resizeGridPointerMove(e, this.pointerDownHeader);
        });

        window.addEventListener("pointerup", () => this.resizeGridPointerUp());
        window.addEventListener("pointerleave", () =>this.resizeGridPointerUp());
    }

    /**
     * 
     * @param {PointerEvent} e 
     * @param {HTMLCanvasElement} header 
     */
    resizeGridPointerDown(e, header) {
        this.mainInst.inputBox.style.display = "none";

        if (this.mainInst.isAnimationRunning) {
            this.mainInst.alreadyCopy = 1;
        }

        let rect = header.getBoundingClientRect();
        const clickX = (e.clientX - rect.left + this.mainInst.scrollXvalue) / this.scale;
        const clickY = (e.clientY - rect.top + this.mainInst.scrollYvalue) / this.scale;

        let columnIndex = this.valueInst.getCurColumnIndex(clickX);
        let rowIndex = this.valueInst.getCurRowIndex(clickY);

        let iscolPointDraggable = this.valueInst.isColPointDraggable(clickX);
        let isrowPointDraggable = this.valueInst.isRowPointDraggable(clickY);

        if (!iscolPointDraggable) {
            this.startingIndexTop = [
                this.valueInst.getCurColumnIndex(clickX),
                this.valueInst.getCurRowIndex(clickY),
            ];
        }

        if (!isrowPointDraggable) {
            this.startingIndexLeft = [
                this.valueInst.getCurColumnIndex(clickX),
                this.valueInst.getCurRowIndex(clickY),
            ];
        }

        let columnLeft = 0;
        let rowTop = 0;
        for (let i = 0; i < columnIndex; i++) {
            columnLeft += this.valueInst.getCurCellWidth(i);
        }
        for (let i = this.mainInst.scrollYvalue; i < rowIndex; i++) {
            rowTop += this.valueInst.getCurCellHeight(i);
        }

        if (
            header == this.mainInst.topHeaderCanvas &&
            rowIndex == 0 &&
            columnIndex !== -1 &&
            !iscolPointDraggable
        ) {
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.isTopAreaSelected = true;
            this.mainInst.topheaderSelected = true;
            this.mainInst.alreadyCopy = 0;
            this.mainInst.currSelectedCol = this.startingIndexTop[0];

            this.mainInst.isColSelected = true;
            this.mainInst.isRowSelected = false;
            this.mainInst.currSelectedRow = "all";
            const startX = Math.min(this.startingIndexTop[0], columnIndex);
            const startY = Math.min(this.startingIndexTop[1], rowIndex);
            const endX = Math.max(this.startingIndexTop[0], columnIndex);
            const endY = Math.max(this.startingIndexTop[1], rowIndex);
            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();
        } else if (
            header == this.mainInst.leftHeaderCanvas &&
            columnIndex == 0 &&
            rowIndex !== -1 &&
            !isrowPointDraggable
        ) {
            this.mainInst.clearLeftHeader();
            this.mainInst.clearTopHeader();
            this.mainInst.isLeftAreaSelected = true;
            this.mainInst.leftheaderSelected = true;
            this.mainInst.alreadyCopy = 0;
            this.mainInst.currSelectedRow = this.startingIndexLeft[1];
            this.mainInst.isRowSelected = true;
            this.mainInst.isColSelected = false;
            this.mainInst.currSelectedCol = "all";
            const startX = Math.min(this.startingIndexLeft[0], columnIndex);
            const startY = Math.min(this.startingIndexLeft[1], rowIndex);
            const endX = Math.max(this.startingIndexLeft[0], columnIndex);
            const endY = Math.max(this.startingIndexLeft[1], rowIndex);
            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();

            // this.highlightHeaders();
            this.mainInst.renderLeftHeader();
            this.mainInst.renderTopHeader();
        }
        if (rowIndex == 0 && columnIndex !== -1 && iscolPointDraggable) {
            this.mainInst.isDraggingTop = true;
            this.mainInst.resizeColIndex = columnIndex;
            this.mainInst.resizeColTop = clickX;
            this.mainInst.resizeColWidth =
                this.valueInst.getCurCellWidth(columnIndex);
        }

        if (columnIndex == 0 && rowIndex !== -1 && isrowPointDraggable) {
            this.mainInst.isDraggingLeft = true;
            this.mainInst.resizeRowIndex = rowIndex;
            this.mainInst.resizeRowTop = clickY;
            this.mainInst.resizeRowHeight =
                this.valueInst.getCurCellHeight(rowIndex);
        }

        this.mainInst.rowIndex2 = this.valueInst.getCurRowIndex(clickY - 5);
        this.mainInst.columnIndex2 = this.valueInst.getCurColumnIndex(
            clickX - 10
        );
        let width = this.valueInst.getCurCellWidth(this.mainInst.columnIndex2);
        let height = this.valueInst.getCurCellHeight(this.mainInst.rowIndex2);

        if (header == this.mainInst.topHeaderCanvas && iscolPointDraggable) {
            this.mainInst.mainCtx.beginPath();
            this.mainInst.mainCtx.save();
            this.mainInst.mainCtx.lineWidth = 2;
            this.mainInst.mainCtx.strokeStyle = this.mainInst.strokeColor;
            this.mainInst.columnLeftOfDrag = columnLeft;
            this.mainInst.mainCtx.strokeRect(
                columnLeft - 0.5,
                -2,
                width + 1,
                this.mainInst.mainCtx.canvas.height
            );
            this.mainInst.mainCtx.restore();
        }

        if (header == this.mainInst.leftHeaderCanvas && isrowPointDraggable) {
            this.mainInst.rowTopOfDrag = rowTop;
            this.mainInst.mainCtx.beginPath();
            this.mainInst.mainCtx.save();
            this.mainInst.mainCtx.lineWidth = 2;
            this.mainInst.mainCtx.strokeStyle = this.mainInst.strokeColor;
            this.mainInst.mainCtx.strokeRect(
                -2,
                rowTop - 0.5,
                this.mainInst.mainCtx.canvas.width,
                height + 1
            );
            this.mainInst.mainCtx.restore();
        }
    }

    /**
     * 
     * @param {PointerEvent} e 
     * @param {HTMLCanvasElement} header 
     */
    resizeGridPointerMove(e, header) {
        let rect = header.getBoundingClientRect();
        const clickX = (e.clientX - rect.left + this.mainInst.scrollXvalue) / this.scale;
        const clickY = (e.clientY - rect.top + this.mainInst.scrollYvalue) / this.scale;

        let columnIndex = this.valueInst.getCurColumnIndex(clickX);
        let rowIndex = this.valueInst.getCurRowIndex(clickY);

        let iscolPointDraggable = this.valueInst.isColPointDraggable(clickX);
        let isrowPointDraggable = this.valueInst.isRowPointDraggable(clickY);

        if (
            iscolPointDraggable
        ) {
            this.mainInst.topHeaderCanvas.style.cursor = "ew-resize";
        } else {
            this.mainInst.topHeaderCanvas.style.cursor = "pointer";
        }

        if (
            isrowPointDraggable
        ) {
            this.mainInst.leftHeaderCanvas.style.cursor = "ns-resize";
        } else {
            this.mainInst.leftHeaderCanvas.style.cursor = "pointer";
        }

        if (this.mainInst.isDraggingTop) {
            this.mainInst.columnIndex2 = this.valueInst.getCurColumnIndex(
                clickX - 10
            );
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.topHeaderCanvas.style.cursor = "ew-resize";
            this.mainInst.mainCanvas.style.cursor = "ew-resize";
            this.mainInst.resizeLineVertical.style.cursor = "ew-resize";
            const deltaX = clickX - this.mainInst.resizeColTop;
            this.newWidth = Math.max(20, this.mainInst.resizeColWidth + deltaX);
            this.valueInst.cellWidths.set(
                this.mainInst.resizeColIndex,
                this.newWidth
            );

            if (
                Array.isArray(this.mainInst.currSelectedCol) &&
                this.mainInst.topheaderSelected
            ) {
                this.colFlag = true;
            }

            if (!this.mainInst.isColSelected) {
                cancelAnimationFrame(this.mainInst.animationFrameId);
                this.mainInst.startMarchingAntsAnimation();
            }

            this.mainInst.resizeLineVertical.style.display = "block";
            this.mainInst.resizeLineVertical.style.height = `${this.mainInst.mainCtx.canvas.height}px`;

            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();
        } else if (this.mainInst.isTopAreaSelected) {
            this.mainInst.topHeaderCanvas.style.cursor = "pointer";
            const startX = Math.min(this.startingIndexTop[0], columnIndex);
            const startY = Math.min(this.startingIndexTop[1], rowIndex);
            const endX = Math.max(this.startingIndexTop[0], columnIndex);
            const endY = Math.max(this.startingIndexTop[1], rowIndex);
            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();
        }

        if (this.mainInst.isDraggingLeft) {
            this.mainInst.rowIndex2 = this.valueInst.getCurRowIndex(clickY - 5);

            this.mainInst.clearLeftHeader();
            this.mainInst.clearTopHeader();
            this.mainInst.leftHeaderCanvas.style.cursor = "ns-resize";
            this.mainInst.resizeLineHorizontal.style.cursor = "ns-resize";

            const deltaY = clickY - this.mainInst.resizeRowTop;
            this.newHeight = Math.max(
                10,
                this.mainInst.resizeRowHeight + deltaY
            );

            this.valueInst.cellHeight.set(
                this.mainInst.resizeRowIndex,
                this.newHeight
            );
            if (
                Array.isArray(this.mainInst.currSelectedRow) &&
                this.mainInst.leftheaderSelected
            ) {
                this.rowFlag = true;
            }

            if (!this.mainInst.isRowSelected) {
                cancelAnimationFrame(this.mainInst.animationFrameId);
                this.mainInst.startMarchingAntsAnimation();
            }

            this.mainInst.resizeLineHorizontal.style.display = "block";
            this.mainInst.resizeLineHorizontal.style.width = `${this.mainInst.mainCtx.canvas.width}px`;
            this.mainInst.renderLeftHeader();
            this.mainInst.renderTopHeader();
        } else if (this.mainInst.isLeftAreaSelected) {
            this.mainInst.leftHeaderCanvas.style.cursor = "pointer";
            const startX = Math.min(this.startingIndexLeft[0], columnIndex);
            const startY = Math.min(this.startingIndexLeft[1], rowIndex);
            const endX = Math.max(this.startingIndexLeft[0], columnIndex);
            const endY = Math.max(this.startingIndexLeft[1], rowIndex);
            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();
        }
    }

    /**
     * 
     */
    resizeGridPointerUp() {
        this.mainInst.mainCanvas.style.cursor = "cell";
        this.mainInst.resizeLineHorizontal.style.display = "none";
        this.mainInst.resizeLineVertical.style.display = "none";
        if (
            this.mainInst.topheaderSelected &&
            this.colFlag &&
            this.mainInst.columnIndex2 >= this.mainInst.currSelectedCol[0] &&
            this.mainInst.columnIndex2 <= this.mainInst.currSelectedCol[1]
        ) {
            this.colFlag = false;
            for (
                let i = this.mainInst.currSelectedCol[0];
                i <= this.mainInst.currSelectedCol[1];
                i++
            ) {
                this.valueInst.cellWidths.set(i, this.newWidth);
            }
        }

        if (
            this.rowFlag &&
            this.mainInst.rowIndex2 >= this.mainInst.currSelectedRow[0] &&
            this.mainInst.rowIndex2 <= this.mainInst.currSelectedRow[1]
        ) {
            for (
                let i = this.mainInst.currSelectedRow[0];
                i <= this.mainInst.currSelectedRow[1];
                i++
            ) {
                this.valueInst.cellHeight.set(i, this.newHeight);
            }
            this.rowFlag = false;
        }

        this.mainInst.isTopAreaSelected = false;
        this.mainInst.isLeftAreaSelected = false;

        if (this.mainInst.isDraggingTop) {
            this.mainInst.mainCtx.clearRect(
                0,
                0,
                this.mainInst.mainCanvas.width,
                this.mainInst.mainCanvas.height
            );
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();

            this.mainInst.isDraggingTop = false;
            this.mainInst.resizeColIndex = -1;
        }
        if (this.mainInst.isDraggingLeft) {
            this.mainInst.mainCtx.clearRect(
                0,
                0,
                this.mainInst.mainCanvas.width,
                this.mainInst.mainCanvas.height
            );
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearLeftHeader();
            this.mainInst.clearTopHeader();
            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();
            this.mainInst.isDraggingLeft = false;
            this.mainInst.resizeRowIndex = -1;
        }
    }
}

export { ResizeGrid };
