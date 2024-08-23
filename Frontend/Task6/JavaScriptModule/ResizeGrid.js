/**
 * Manage resizing of grid columns and rows
 */

class ResizeGrid {
    /**
     *
     * @param {Object} mainInst
     * @param {Object} valueInst
     * @param {Object} highlightInst
     * @param {Object} copyPasteInst
     */
    constructor(mainInst, valueInst, highlightInst, copyPasteInst) {
        this.mainInst = mainInst;
        this.valueInst = valueInst;
        this.highlightInst = highlightInst;
        this.scale = window.devicePixelRatio;
        this.copyPasteInst = copyPasteInst;

        /**
         * Flag indicating whether a column resize operation is active or has occurred.
         * @type {boolean}
         */
        this.columnResizeFlag = false;

        /**
         * Flag indicating whether a column resize operation is active or has occurred.
         * @type {boolean}
         */
        this.rowResizeFlag = false;

        /**
         * check whether resizing is happing on the top header
         * @type {boolean}
         */
        this.isDraggingTopHeader = false;

        /**
         * check whether resizing is happing on the left header
         * @type {boolean}
         */
        this.isDraggingLeftHeader = false;

        /**
         * Index of the column being resized.
         * @type {number}
         */
        this.resizeColIndex = -1;

        /**
         * Index of the row being resized.
         * @type {number}
         */
        this.resizeRowIndex = -1;

        /**
         * Initial pixel of the column being resized
         * @type {number}
         */
        this.resizeColX = 0;

        /**
         * Initial pixel of the row being resized
         * @type {number}
         */
        this.resizeRowY = 0;

        /**
         * Initial height of the column being resized
         * @type {number}
         */
        this.resizeColWidth = 0;

        /**
         * Initial width of the column being resized
         * @type {number}
         */
        this.resizeRowHeight = 0;

        /**
         * Starting top header index of pointer down event for selection
         * @type {number[]}
         */
        this.startColumnIndex = null;

        /**
         * Starting left header index of pointer down event for selection
         * @type {number[]}
         */
        this.startRowIndex = null;

        /**
         * Left position of the column being dragged.
         * @type {number}
         */
        this.columnDraggedPos = 0;

        /**
         * Top position of the row being dragged.
         * @type {number}
         */
        this.rowDraggedPos = 0;

        /**
         *
         * @type {number}
         */
        this.rowIndexAtDraggablepoint = -1;

        /**
         *
         * @type {number}
         */
        this.columnIndexAtDraggablepoint = -1;
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
            let targetId = e.target.id;
            let headerType = targetId.replace(/-sheet-[0,100]/, "");
            if (headerType == "topHeader") {
                this.pointerDownHeader = this.mainInst.topHeaderCanvas;
            } else if (headerType == "leftHeader") {
                this.pointerDownHeader = this.mainInst.leftHeaderCanvas;
            }
            this.resizeGridPointerMove(e, this.pointerDownHeader);
        });

        window.addEventListener("pointerup", () => this.resizeGridPointerUp());
        window.addEventListener("pointerleave", () =>
            this.resizeGridPointerUp()
        );
    }

    /**
     * Handles the pointer down event for initiating column or row resizing.
     * @param {PointerEvent} e
     * @param {HTMLCanvasElement} header - The Canvas element where the pointer down
     */
    resizeGridPointerDown(e, header) {
        this.mainInst.inputBox.style.display = "none";

        let rect = header.getBoundingClientRect();
        const clickX =
            (e.clientX - rect.left + this.mainInst.scrollLeftvalue) /
            this.scale;
        const clickY =
            (e.clientY - rect.top + this.mainInst.scrollTopvalue) / this.scale;

        let columnIndex = this.valueInst.getCurColumnIndex(clickX);
        let rowIndex = this.valueInst.getCurRowIndex(clickY);

        let iscolPointDraggable = this.valueInst.isColPointDraggable(clickX);
        let isrowPointDraggable = this.valueInst.isRowPointDraggable(clickY);

        if (!iscolPointDraggable) {
            this.startColumnIndex = [columnIndex, rowIndex];
        }

        if (!isrowPointDraggable) {
            this.startRowIndex = [columnIndex, rowIndex];
        }

        let columnLeft = 0;
        let rowTop = 0;
        for (let col = 0; col < columnIndex; col++) {
            columnLeft += this.valueInst.getCurCellWidth(col);
        }
        for (let row = this.mainInst.scrollTopvalue; row < rowIndex; row++) {
            rowTop += this.valueInst.getCurCellHeight(row);
        }

        this.mainInst.clearTopHeader();
        this.mainInst.clearLeftHeader();
        if (
            header == this.mainInst.topHeaderCanvas &&
            rowIndex == 0 &&
            columnIndex !== -1 &&
            !iscolPointDraggable
        ) {
            this.mainInst.isTopAreaSelected = true;
            this.mainInst.topheaderSelected = true;
            this.mainInst.currSelectedCol = this.startColumnIndex[0];

            this.mainInst.isColSelected = true;
            this.mainInst.isRowSelected = false;
            this.mainInst.currSelectedRow = "all";
            const startX = Math.min(this.startColumnIndex[0], columnIndex);
            const startY = Math.min(this.startColumnIndex[1], rowIndex);
            const endX = Math.max(this.startColumnIndex[0], columnIndex);
            const endY = Math.max(this.startColumnIndex[1], rowIndex);
            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
        } else if (
            header == this.mainInst.leftHeaderCanvas &&
            columnIndex == 0 &&
            rowIndex !== -1 &&
            !isrowPointDraggable
        ) {
            this.mainInst.isLeftAreaSelected = true;
            this.mainInst.leftheaderSelected = true;
            this.mainInst.currSelectedRow = this.startRowIndex[1];
            this.mainInst.isRowSelected = true;
            this.mainInst.isColSelected = false;
            this.mainInst.currSelectedCol = "all";
            const startX = Math.min(this.startRowIndex[0], columnIndex);
            const startY = Math.min(this.startRowIndex[1], rowIndex);
            const endX = Math.max(this.startRowIndex[0], columnIndex);
            const endY = Math.max(this.startRowIndex[1], rowIndex);
            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
        }
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
        this.mainInst.renderTopHeader();
        this.mainInst.renderLeftHeader();

        if (rowIndex == 0 && columnIndex !== -1 && iscolPointDraggable) {
            this.isDraggingTopHeader = true;
            this.resizeColIndex = columnIndex;
            this.resizeColX = clickX;
            this.resizeColWidth = this.valueInst.getCurCellWidth(columnIndex);
        }

        if (columnIndex == 0 && rowIndex !== -1 && isrowPointDraggable) {
            this.isDraggingLeftHeader = true;
            this.resizeRowIndex = rowIndex;
            this.resizeRowY = clickY;
            this.resizeRowHeight = this.valueInst.getCurCellHeight(rowIndex);
        }

        this.rowIndexAtDraggablepoint = this.valueInst.getCurRowIndex(
            clickY - 5
        );
        this.columnIndexAtDraggablepoint = this.valueInst.getCurColumnIndex(
            clickX - 10
        );
        let width = this.valueInst.getCurCellWidth(
            this.columnIndexAtDraggablepoint
        );
        let height = this.valueInst.getCurCellHeight(
            this.rowIndexAtDraggablepoint
        );

        if (header == this.mainInst.topHeaderCanvas && iscolPointDraggable) {
            this.mainInst.mainCtx.beginPath();
            this.mainInst.mainCtx.save();
            this.mainInst.mainCtx.lineWidth = 2;
            this.mainInst.mainCtx.strokeStyle = this.mainInst.strokeColor;
            this.columnDraggedPos = columnLeft;
            this.mainInst.mainCtx.strokeRect(
                columnLeft - 0.5,
                -2,
                width + 1,
                this.mainInst.mainCtx.canvas.height
            );
            this.mainInst.mainCtx.restore();
        }

        if (header == this.mainInst.leftHeaderCanvas && isrowPointDraggable) {
            this.rowDraggedPos = rowTop;
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
     * Handles the pointer Move event for initiating column or row resizing.
     * @param {PointerEvent} e
     * @param {HTMLCanvasElement} header - The Canvas element where the pointer move
     */
    resizeGridPointerMove(e, header) {
        let rect = header.getBoundingClientRect();
        const clickX =
            (e.clientX - rect.left + this.mainInst.scrollLeftvalue) /
            this.scale;
        const clickY =
            (e.clientY - rect.top + this.mainInst.scrollTopvalue) / this.scale;

        let columnIndex = this.valueInst.getCurColumnIndex(clickX);
        let rowIndex = this.valueInst.getCurRowIndex(clickY);

        let iscolPointDraggable = this.valueInst.isColPointDraggable(clickX);
        let isrowPointDraggable = this.valueInst.isRowPointDraggable(clickY);

        if (iscolPointDraggable) {
            this.mainInst.topHeaderCanvas.style.cursor = "ew-resize";
        } else {
            this.mainInst.topHeaderCanvas.style.cursor = "pointer";
        }

        if (isrowPointDraggable) {
            this.mainInst.leftHeaderCanvas.style.cursor = "ns-resize";
        } else {
            this.mainInst.leftHeaderCanvas.style.cursor = "pointer";
        }

        if (this.isDraggingTopHeader) {
            this.columnIndexAtDraggablepoint = this.valueInst.getCurColumnIndex(
                clickX - 10
            );
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.topHeaderCanvas.style.cursor = "ew-resize";
            this.mainInst.mainCanvas.style.cursor = "ew-resize";
            this.mainInst.resizeLineVertical.style.cursor = "ew-resize";
            const deltaX = clickX - this.resizeColX;
            this.newWidth = Math.max(20, this.resizeColWidth + deltaX);
            this.valueInst.cellWidths.set(this.resizeColIndex, this.newWidth);

            if (
                Array.isArray(this.mainInst.currSelectedCol) &&
                this.mainInst.topheaderSelected
            ) {
                this.columnResizeFlag = true;
            }

            if (!this.mainInst.isColSelected) {
                cancelAnimationFrame(this.copyPasteInst.animationFrameId);
                this.copyPasteInst.startMarchingAntsAnimation();
            }

            this.mainInst.resizeLineVertical.style.display = "block";
            this.mainInst.resizeLineVertical.style.height = `${this.mainInst.mainCtx.canvas.height}px`;

            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();
        } else if (this.mainInst.isTopAreaSelected) {
            this.mainInst.topHeaderCanvas.style.cursor = "pointer";
            const startX = Math.min(this.startColumnIndex[0], columnIndex);
            const startY = Math.min(this.startColumnIndex[1], rowIndex);
            const endX = Math.max(this.startColumnIndex[0], columnIndex);
            const endY = Math.max(this.startColumnIndex[1], rowIndex);
            this.mainInst.selectedDimensionsMain = [startX, startY, endX, endY];
            this.highlightInst.highlightSelectedArea();
            this.mainInst.drawGrid();
            this.mainInst.clearTopHeader();
            this.mainInst.clearLeftHeader();
            this.mainInst.renderTopHeader();
            this.mainInst.renderLeftHeader();
        }

        if (this.isDraggingLeftHeader) {
            this.rowIndexAtDraggablepoint = this.valueInst.getCurRowIndex(
                clickY - 5
            );

            this.mainInst.clearLeftHeader();
            this.mainInst.clearTopHeader();
            this.mainInst.leftHeaderCanvas.style.cursor = "ns-resize";
            this.mainInst.resizeLineHorizontal.style.cursor = "ns-resize";

            const deltaY = clickY - this.resizeRowY;
            this.newHeight = Math.max(10, this.resizeRowHeight + deltaY);

            this.valueInst.cellHeight.set(this.resizeRowIndex, this.newHeight);
            if (
                Array.isArray(this.mainInst.currSelectedRow) &&
                this.mainInst.leftheaderSelected
            ) {
                this.rowResizeFlag = true;
            }

            if (!this.mainInst.isRowSelected) {
                cancelAnimationFrame(this.copyPasteInst.animationFrameId);
                this.copyPasteInst.startMarchingAntsAnimation();
            }

            this.mainInst.resizeLineHorizontal.style.display = "block";
            this.mainInst.resizeLineHorizontal.style.width = `${this.mainInst.mainCtx.canvas.width}px`;
            this.mainInst.renderLeftHeader();
            this.mainInst.renderTopHeader();
        } else if (this.mainInst.isLeftAreaSelected) {
            this.mainInst.leftHeaderCanvas.style.cursor = "pointer";
            const startX = Math.min(this.startRowIndex[0], columnIndex);
            const startY = Math.min(this.startRowIndex[1], rowIndex);
            const endX = Math.max(this.startRowIndex[0], columnIndex);
            const endY = Math.max(this.startRowIndex[1], rowIndex);
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
     * Handles the pointer up event for initiating column or row resizing.
     */
    resizeGridPointerUp() {
        this.mainInst.mainCanvas.style.cursor = "cell";
        this.mainInst.resizeLineHorizontal.style.display = "none";
        this.mainInst.resizeLineVertical.style.display = "none";
        if (
            this.mainInst.topheaderSelected &&
            this.columnResizeFlag &&
            this.columnIndexAtDraggablepoint >=
                this.mainInst.currSelectedCol[0] &&
            this.columnIndexAtDraggablepoint <= this.mainInst.currSelectedCol[1]
        ) {
            this.columnResizeFlag = false;
            for (
                let i = this.mainInst.currSelectedCol[0];
                i <= this.mainInst.currSelectedCol[1];
                i++
            ) {
                this.valueInst.cellWidths.set(i, this.newWidth);
            }
        }

        if (
            this.rowResizeFlag &&
            this.rowIndexAtDraggablepoint >= this.mainInst.currSelectedRow[0] &&
            this.rowIndexAtDraggablepoint <= this.mainInst.currSelectedRow[1]
        ) {
            for (
                let i = this.mainInst.currSelectedRow[0];
                i <= this.mainInst.currSelectedRow[1];
                i++
            ) {
                this.valueInst.cellHeight.set(i, this.newHeight);
            }
            this.rowResizeFlag = false;
        }

        this.mainInst.isTopAreaSelected = false;
        this.mainInst.isLeftAreaSelected = false;

        if (this.isDraggingTopHeader) {
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

            this.isDraggingTopHeader = false;
            this.resizeColIndex = -1;
        }
        if (this.isDraggingLeftHeader) {
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
            this.isDraggingLeftHeader = false;
            this.resizeRowIndex = -1;
        }
    }
}

export { ResizeGrid };
