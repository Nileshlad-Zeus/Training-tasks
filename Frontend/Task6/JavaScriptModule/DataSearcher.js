class DataSearcher {
    constructor(mainInst, highlightInst, apiRequestsInst) {
        this.mainInst = mainInst;
        this.highlightInst = highlightInst;
        this.apiRequestsInst = apiRequestsInst
        this.initializefindandReplace();
    }

    initializefindandReplace() {
        this.startPosition = {
            rowNo: -1,
            columnNo: -1,
            searchRow: 0,
            searchCol: 0,
        };
        const findtextInput = document.querySelector("#findtextInput");
        const findtextInput2 = document.querySelector("#findtextInput2");
        const findNextBtn = document.getElementById("findNextBtn");

        findNextBtn.addEventListener("click", () => {
            let findvalue = findtextInput2.value;
            this.findNext(findvalue);
        });

        const replacetextInput = document.querySelector("#replacetextInput");
        const replaceAllFun = document.querySelector("#replaceAllFun");
        replaceAllFun.addEventListener("click", () => {
            let findText = findtextInput.value;

            let replaceText = replacetextInput.value;
            this.findAndReplace(findText, replaceText);
        });
    }

    searchData(dataArray, searchValue, startPosition) {
        for (let i = startPosition.searchRow; i < dataArray.length; i++) {
            const rowNo = parseInt(Object.keys(dataArray[i])[0]);
            const columns = dataArray[i][rowNo];

            for (let colNo in columns) {
                if (parseInt(colNo) > startPosition.columnNo) {
                    if (columns[colNo].data === searchValue) {
                        return {
                            rowNo: rowNo,
                            columnNo: parseInt(colNo),
                            searchRow: i,
                        };
                    }
                }
            }
            startPosition.columnNo = -1;
        }
        startPosition.rowNo = 0;
        return null;
    }

    findNext(findvalue) {
        const scroller = document.getElementById("scroller");
        let findAndReplaceStatus2 = document.getElementById(
            "findAndReplaceStatus2"
        );
        if (findvalue == "") {
            findAndReplaceStatus2.style.display = "block";
            findAndReplaceStatus2.innerText =
                "Your search should include at least one character";
            return;
        }
        let result = this.searchData(
            this.mainInst.sheetData,
            findvalue,
            this.startPosition
        );
        if (result) {
            this.startPosition = result;
            let x = result.rowNo;
            let y = result.columnNo;

            this.mainInst.selectedDimensionsMain = [y, x - 1, y, x - 1];
            this.mainInst.scrollTopvalue = Math.max(0, (x - 10) * 21);

            scroller.scrollTop = this.mainInst.scrollTopvalue;
            this.mainInst.clearMainCanvas();
            this.mainInst.clearLeftHeader();
            this.mainInst.clearTopHeader();
            this.highlightInst.highlightSelectedArea();
            this.mainInst.renderLeftHeader();
            this.mainInst.renderTopHeader();
            this.mainInst.drawGrid();
        } else {
            findAndReplaceStatus2.style.display = "block";
            findAndReplaceStatus2.innerText = "No more occurrences found.";
            this.startPosition = { rowNo: 0, columnNo: -1 };
        }
    }

    findAndReplace = async (findText, replaceText) => {
        let findAndReplaceStatus = document.getElementById(
            "findAndReplaceStatus"
        );

        findAndReplaceStatus.style.display = "block";
        findAndReplaceStatus.innerText = "Updating...";
        const response = await fetch(
            `http://localhost:5022/api/Employee/findandreplace`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    findText: findText,
                    replaceText: replaceText,
                }),
            }
        );
        const data = await response.json();

        if (data.status) {
            this.mainInst.sheetData = [];
            await this.mainInst.fetchUserData(0);
            findAndReplaceStatus.innerText = `Matches Replaced (${data.noOfRowsAffected})`;
        }

        this.mainInst.clearMainCanvas();
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
    };
}

export { DataSearcher };
