class GetValues {
    /**
     *
     * @param {Object} mainIns
     */
    constructor(mainIns) {
        this.mainIns = mainIns;

        /**
         * default cell width
         * @type {number}
         */
        this.defaultCellWidth = 100;

        /**
         * default cell height
         * @type {number}
         */
        this.defaultCellHeight = 21;

        /**
         * A map storing custom widths for cells.
         * @type {Map<number, number>}
         */
        this.cellWidths = new Map();

        /**
         * A map storing custom heights for cells.
         * @type {Map<number, number>}
         */
        this.cellHeight = new Map();
    }

    /**
     * return column Index based on pixels
     * @param {number} x
     * @returns {number}
     */
    getCurColumnIndex(x) {
        let cellPosition = 0;
        for (let col = 0; col <= 10000; col++) {
            if (
                x >= cellPosition - 10 &&
                x <= cellPosition + this.getCurCellWidth(col) + 10
            ) {
                return col;
            }
            cellPosition += this.getCurCellWidth(col);
        }
        return -1;
    }

    /**
     * return row Index based on pixels
     * @param {number} x
     * @returns {number}
     */
    getCurRowIndex(x) {
        let cellPosition = 0;
        for (let row = 0; row <= 10000; row++) {
            if (
                x >= cellPosition - 5 &&
                x <= cellPosition + this.getCurCellHeight(row) + 5
            ) { 
                return row;
            }
            cellPosition += this.getCurCellHeight(row);
        }
        return -1;
    }

    /**
     * Determines if a column point is draggable based on the pixels.
     * @param {number} x
     * @returns {boolean}
     */
    isColPointDraggable(x) {
        let cellPosition = 0;
        for (let col = 0; col <= 10000; col++) {
            if (
                x >= cellPosition + 10 &&
                x <= cellPosition + this.getCurCellWidth(col) - 10
            ) {
                return false;
            }
            cellPosition += this.getCurCellWidth(col);
        }
        return true;
    }

    /**
     * Determines if a row point is draggable based on the pixels.
     * @param {number} x
     * @returns {boolean}
     */
    isRowPointDraggable(x) {
        let cellPosition = 0;
        for (let row = 0; row <= 10000; row++) {
            if (
                x >= cellPosition + 5 &&
                x <= cellPosition + this.getCurCellHeight(row) - 5
            ) {
                return false;
            }
            cellPosition += this.getCurCellHeight(row);
        }
        return true;
    }

    /**
     * Gets the width of a cell at the given index.
     * @param {number} index
     * @returns {number}
     */
    getCurCellWidth(index) {
        return this.cellWidths.get(index) || this.defaultCellWidth;
    }

    /**
     * Gets the Height of a cell at the given index.
     * @param {number} index
     * @returns {number}
     */
    getCurCellHeight(index) {
        return this.cellHeight.get(index) || this.defaultCellHeight;
    }

    /**
     * Converts a column number to its corresponding Excel-style column letter.
     * @param {number} columnNumber
     * @returns {string}
     */
    convertNumToChar(columnNumber) {
        let result = "";
        while (columnNumber > 0) {
            let r = columnNumber % 26;
            let q = parseInt(columnNumber / 26);
            if (r === 0) {
                r = 26;
                q--;
            }

            result = String.fromCharCode(64 + r) + result;
            columnNumber = q;
        }
        return result;
    }
}

export { GetValues };
