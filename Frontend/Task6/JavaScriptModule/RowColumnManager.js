class RowColumnManager {
    constructor(mainInst, mainCanvas, valueInst, highlightInst) {
        this.mainInst = mainInst;
        this.mainCanvas = mainCanvas;
        this.valueInst = valueInst;
        this.highlightInst = highlightInst;
        this.scale = 1;
        this.eventListner();
    }

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

    deleteAndUpdateRows(data, startRow, endRow) {
        let deleteRowNos = [];
        for (let row = startRow; row <= endRow; row++) {
            deleteRowNos.push(row.toString());
        }
        console.log(typeof deleteRowNos);

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

    async deleteRows() {
        const [startCol, startRow, endCol, endRow] =
            this.mainInst.selectedDimensionsMain;

        this.mainInst.sheetData = this.deleteAndUpdateRows(
            this.mainInst.sheetData,
            startRow + 1,
            endRow + 1
        );
        this.contextmenu.style.display = "none";

        this.mainInst.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();

        const response = await fetch(
            `http://localhost:5022/api/Employee/deleterow?startRow=${
                startRow + 1
            }&endRow=${endRow + 1}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();

        if (data.status) {
            this.mainInst.inputBox.value = null;
            length = this.mainInst.sheetData.length;

            this.mainInst.sheetData = [];
            for (let i = 0; i < length / 500; i++) {
                await this.mainInst.fetchUserData(i);
            }
        }
        this.mainInst.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
    }

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

    async addRows() {
        const [startCol, startRow, endCol, endRow] =
            this.mainInst.selectedDimensionsMain;

        this.mainInst.sheetData = this.addAndAdjustRows(
            this.mainInst.sheetData,
            startRow + 1,
            endRow + 1
        );
        this.contextmenu.style.display = "none";

        this.mainInst.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();

        const response = await fetch(
            `http://localhost:5022/api/Employee/addrowabove?startRow=${
                startRow + 1
            }&endRow=${endRow + 1}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();

        if (data.status) {
            this.mainInst.inputBox.value = null;
            length = this.mainInst.sheetData.length;

            this.mainInst.sheetData = [];
            for (let i = 0; i < length / 500; i++) {
                await this.mainInst.fetchUserData(i);
            }
        }
        this.mainInst.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
    }
}

export { RowColumnManager };
