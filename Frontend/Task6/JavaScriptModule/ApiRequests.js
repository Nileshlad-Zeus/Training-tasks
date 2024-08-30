class ApiRequests {
    constructor(
        mainInst,
        mainCtx,
        highlightInst,
        valueInst,
        rowColumnManagerInst
    ) {
        this.mainInst = mainInst;
        this.mainCtx = mainCtx;
        this.highlightInst = highlightInst;
        this.valueInst = valueInst;
        this.rowColumnManagerInst = rowColumnManagerInst;
        this.intervalid = setInterval(() => this.fetchProgress(), 100);
        this.progressbarEle = document.getElementById("progressbarEle");
    }

    async fetchProgress() {
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
                console.log("done");
                this.progressbarEle.style.display = "none";
                clearInterval(this.intervalid);
                this.fetchUserData(0);
            }
        } catch (error) {
            clearInterval(this.intervalid);
        }
    }

    async fetchUserData(offset = 0) {
        console.log("Fetch");

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
        this.mainInst.sheetData.push(...sheetData);
        this.mainInst.renderData();
    }
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

    async updateData() {
        if (this.mainInst.isValueupdate == false) return;
        let value = this.mainInst.inputBox.value;

        let rowData = this.mainInst.sheetData.find(
            (item) => item[this.mainInst.activeRow]
        );

        if (rowData == undefined) {
            const formattedItem = {};
            const newRowNo = this.mainInst.activeRow.toString();
            formattedItem[this.mainInst.x1CellIndex] = {
                data: value,
                properties: "*****",
            };
            this.mainInst.sheetData.push({ [newRowNo]: formattedItem });
            await this.rowColumnManagerInst.InsertRow();
        }
        rowData = this.mainInst.sheetData.find(
            (item) => item[this.mainInst.activeRow]
        );
        rowData[this.mainInst.activeRow][this.mainInst.x1CellIndex].data =
            value;

        this.mainInst.clearMainCanvas();
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();

        const response = await fetch(
            `http://localhost:5022/api/Employee/updatevalue?column=${this.mainInst.activeColumn}&row=${this.mainInst.activeRow}&text=${value}`,
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
            let length = this.mainInst.sheetData.length;
            this.mainInst.sheetData = [];
            for (let i = 0; i < length / 500; i++) {
                await this.fetchUserData(i);
            }
        }

        this.mainInst.clearMainCanvas();
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
    }

    async deleteData() {
        const [startCol, startRow, endCol, endRow] =
            this.mainInst.selectedDimensionsMain;

        let startCol1 = this.valueInst.convertNumToChar(startCol + 1);
        let endCol1 = this.valueInst.convertNumToChar(endCol + 1);
        let isThereAnyData = false;
        for (let row = startRow; row <= endRow; row++) {
            let rowData = this.mainInst.sheetData.find((item) => item[row + 1]);
            if (rowData) {
                for (let col = startCol; col <= endCol; col++) {
                    if (rowData[row + 1][col].data) {
                        isThereAnyData = true;
                    }
                    rowData[row + 1][col].data = "";
                }
            }
        }

        this.mainInst.clearMainCanvas();
        this.mainInst.drawGrid();

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
                this.mainInst.inputBox.value = null;
                let length = this.mainInst.sheetData.length;
                this.mainInst.sheetData = [];
                for (let i = 0; i < length / 500; i++) {
                    await this.fetchUserData(i);
                }
            }
            this.mainInst.clearMainCanvas();
            this.mainInst.drawGrid();
        }
    }
}
export { ApiRequests };
