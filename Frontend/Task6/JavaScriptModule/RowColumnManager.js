class RowColumnManager {
    /**
     * Creates an instance of the RowColumnManager class.
     * @param {Object} mainInst - The main instance of the application, managing sheet data and rendering.
     * @param {HTMLCanvasElement} mainCanvas - The canvas element used for drawing and rendering.
     * @param {Object} valueInst - Instance responsible for value-related operations (e.g., converting numbers to characters).
     * @param {Object} highlightInst - Instance responsible for highlighting elements on the canvas.
     */
    constructor(mainInst, mainCanvas, valueInst, highlightInst) {
        this.mainInst = mainInst;
        this.mainCanvas = mainCanvas;
        this.valueInst = valueInst;
        this.highlightInst = highlightInst;
        this.scale = 1;
        this.eventListner();
    }

    /**
     * Initializes event listeners for context menu actions.
     */
    eventListner() {
        this.contextmenu = document.getElementById("contextmenu");
        const deleteRow = document.getElementById("delete-row");
        const addRow = document.getElementById("insert-row");

        this.mainCanvas.addEventListener(
            "contextmenu",
            (e) => {
                e.preventDefault();
                console.log(this.mainInst.sheetData);

                let cellPositionLeft = 0;
                let cellPositionTop = 0;
                for (
                    let i = this.mainInst.scrollLeftvalue;
                    i < this.mainInst.x1CellIndex + 1;
                    i++
                ) {
                    cellPositionLeft += this.valueInst.getCurCellWidth(i);
                }
                for (
                    let i = this.mainInst.scrollTopvalue;
                    i < this.mainInst.y1CellIndex;
                    i++
                ) {
                    cellPositionTop += this.valueInst.getCurCellHeight(i);
                }
                contextmenu.style.display = "block";
                contextmenu.style.top = `${cellPositionTop}px`;
                contextmenu.style.left = `${cellPositionLeft}px`;
                return false;
            },
            false
        );

        deleteRow.addEventListener("click", () => {
            this.deleteRows();
        });
        addRow.addEventListener("click", () => {
            this.addRows();
        });
    }

    /**
     * Deletes rows from the data and adjusts the remaining rows.
     * @param {Object[]} data - The array of data to update.
     * @param {number} startRow - The starting row number to delete.
     * @param {number} endRow - The ending row number to delete.
     * @returns {Object[]} - The updated array of data with rows deleted.
     */
    deleteAndUpdateRows(data, startRow, endRow) {
        let deleteRowNos = [];
        for (let row = startRow; row <= endRow; row++) {
            deleteRowNos.push(row.toString());
        }

        const remainingData = data.filter(
            (row) => !deleteRowNos.includes(Object.keys(row)[0])
        );

        const adjustedData = remainingData.map((row, index) => {
            const oldRowNo = Object.keys(row)[0];
            const newRowNo = (index + 1).toString();
            return { [newRowNo]: row[oldRowNo] };
        });
        return adjustedData;
    }

    /**
     * Handles the deletion of rows based on selected dimensions.
     * Updates the view and sends a request to the server.
     * @async
     */
    async deleteRows() {
        const [startCol, startRow, endCol, endRow] =
            this.mainInst.selectedDimensionsMain;

        this.mainInst.sheetData = this.deleteAndUpdateRows(
            this.mainInst.sheetData,
            startRow + 1,
            endRow + 1
        );
        this.contextmenu.style.display = "none";

        this.mainInst.clearMainCanvas();
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();

        const response = await fetch(
            `http://localhost:5022/api/Employee/deleterow`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startRow: startRow + 1,
                    endRow: endRow + 1,
                }),
            }
        );
        const data = await response.json();

        if (data.status) {
            this.mainInst.inputBox.value = null;
            length = this.mainInst.sheetData.length;

            this.mainInst.sheetData = [];
            for (let i = 0; i < length / 500; i++) {
                await this.mainInst.apiRequestsInst.fetchUserData(i);
            }
        }
        this.mainInst.clearMainCanvas();
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
    }

    /**
     * Adds new rows to the data and adjusts existing rows accordingly.
     * @param {Object[]} data - The array of data to update.
     * @param {number} startRow - The starting row number to add new rows.
     * @param {number} endRow - The ending row number to add new rows.
     * @returns {Object[]} - The updated array of data with rows added.
     */
    addAndAdjustRows(data, startRow, endRow) {
        const newRows = [];
        let numberOfRows = endRow - startRow + 1;
        for (let i = 0; i < numberOfRows; i++) {
            const newRowNo = (startRow + i).toString();
            newRows.push({ [newRowNo]: {} });
        }

        const adjustedData = data.map((row) => {
            const oldRowNo = parseInt(Object.keys(row)[0]);

            if (oldRowNo >= startRow) {
                const newRowNo = (oldRowNo + numberOfRows).toString();
                return { [newRowNo]: row[oldRowNo] };
            } else {
                return row;
            }
        });

        const combinedData = [
            ...adjustedData.slice(0, startRow - 1),
            ...newRows,
            ...adjustedData.slice(startRow - 1),
        ];

        return combinedData;
    }

    /**
     * Handles the addition of rows based on selected dimensions.
     * Updates the view and sends a request to the server.
     * @async
     */
    async addRows() {
        const [startCol, startRow, endCol, endRow] =
            this.mainInst.selectedDimensionsMain;
        console.log(this.mainInst.selectedDimensionsMain);

        this.mainInst.sheetData = this.addAndAdjustRows(
            this.mainInst.sheetData,
            startRow + 1,
            endRow + 1
        );
        this.contextmenu.style.display = "none";

        this.mainInst.clearMainCanvas();
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();

        const response = await fetch(
            `http://localhost:5022/api/Employee/addrowabove`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startRow: startRow + 1,
                    endRow: endRow + 1,
                }),
            }
        );
        const data = await response.json();

        if (data.status) {
            this.mainInst.inputBox.value = null;
            length = this.mainInst.sheetData.length;

            this.mainInst.sheetData = [];
            for (let i = 0; i < length / 500; i++) {
                await this.mainInst.apiRequestsInst.fetchUserData(i);
            }
        }
        this.mainInst.clearMainCanvas();
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
    }

    /**
     * Inserts a new row at the specified position.
     * and Sends a request to the server to insert the row.
     * @async
     */
    async InsertRow() {
        const [startCol, startRow, endCol, endRow] =
            this.mainInst.selectedDimensionsMain;
        this.contextmenu.style.display = "none";
        const response = await fetch(
            `http://localhost:5022/api/Employee/InsertRow?startRow=${
                startRow + 1
            }`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();
        console.log(data);

        if (data.status) {
            this.mainInst.inputBox.value = null;
        }
    }
}

export { RowColumnManager };
