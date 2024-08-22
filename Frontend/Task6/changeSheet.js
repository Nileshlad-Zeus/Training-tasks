import { newCanvas } from "./main.js";

class sheetManager {
    constructor() {
        this.fetchUserData("sheet-1");
        let arrayOfSheets = ["Sheet1"];
        const addNewSheet = document.getElementById("addNewSheet");
        const sheets = document.getElementById("sheets");
        const sheetListModal = document.getElementById("sheetListModal");

        addNewSheet.addEventListener("click", () => {
            sheetListModal.style.display = "none";
            let numberOfSheet = arrayOfSheets.length + 1;
            arrayOfSheets.push(`Sheet${numberOfSheet}`);
            localStorage.setItem("sheetlist", JSON.stringify(arrayOfSheets));

            var btn = document.createElement("span");
            btn.classList.add("sheetBtn");
            btn.innerHTML = `<div id=sheet-${numberOfSheet} class="sheetBtn1">Sheet${numberOfSheet}</div>`;
            sheets.appendChild(btn);

            var li = document.createElement("span");
            li.classList.add("sheetLi");
            li.innerText = `Sheet${numberOfSheet}`;
            sheetListModal.appendChild(li);
        });

        this.createdCanvas = ["sheet-1"];
        sheets.addEventListener("click", (e) => {
            if (e.target.closest(".sheetBtn")) {
                this.selectCurrSheet(e);
            }
        });

        const sheetListModalBtn = document.getElementById("sheetListModalBtn");

        sheetListModalBtn.addEventListener("click", () => {
            if (sheetListModal.style.display == "flex") {
                sheetListModal.style.display = "none";
            } else {
                sheetListModal.style.display = "flex";
            }
        });
        this.uploadFile();
        this.findandReplace();

        // const scroller = document.getElementById("scroller");
        // scroller.addEventListener("scroll", (e) => {
        //     let offset = Math.floor(Math.max(0, e.target.scrollTop) / 8400) + 1;

        //     if (Math.max(0, e.target.scrollTop) >= 8400 * offset - 1000) {
        //         console.log(8400 * offset);
        //         this.fetchUserData("sheet-1", offset, true);
        //     }
        // });
    }

    fetchUserData = async (sheedId, offset = 0, isScroll = false) => {
        new newCanvas(sheedId);
        // const response = await fetch(
        //     `http://localhost:5022/api/Employee?offset=${offset}`,
        //     {
        //         method: "GET",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //     }
        // );
        // const data = await response.json();
        // console.log(data);
        
        // let sheetData = this.convertJsonData(data);
        // if (!isScroll) {
            
        // }
        this.canvases = document.querySelectorAll(".canvas");
        this.topHeaderCanvas = document.querySelectorAll(".topHeaderCanvas");
        this.leftHeaderCanvas = document.querySelectorAll(".leftHeaderCanvas");
    };

    // convertJsonData = (data) => {
    //     const result = [];
    //     if (data.length > 0) {
    //         const keys = Object.keys(data[0]);

    //         data.forEach((item, index) => {
    //             const formattedItem = {};
    //             keys.forEach((key, idx) => {
    //                 formattedItem[idx] = {
    //                     data: item[key],
    //                     properties: "*****",
    //                 };
    //             });
    //             result.push({ [item["RowNo"]]: formattedItem });
    //         });
    //     }
    //     return result;
    // };

    uploadFile = () => {
        const selectFile = document.getElementById("selectFile");
        const selectFileInput = document.getElementById("selectFileInput");
        selectFile.addEventListener("click", (e) => {
            selectFileInput.click();
        });
        selectFileInput.addEventListener("change", async () => {
            console.log(selectFileInput.files[0]);
            var data = new FormData();
            data.append("file", selectFileInput.files[0]);
            const response = await fetch(
                `http://localhost:5022/api/Employee/UploadFile`,
                {
                    method: "POST",
                    // headers: {
                    //     "Content-Type": "application/json",
                    // },
                    body: data,
                }
            );
            const res = await response.json();
            console.log(res);
        });
    };

    selectCurrSheet = (e) => {
        var sheetBtn1 = document.querySelectorAll(".sheetBtn1");
        sheetBtn1.forEach((btn) => btn.classList.remove("selected"));
        e.target.classList.add("selected");

        if (!this.createdCanvas.includes(e.target.id)) {
            this.createdCanvas.push(e.target.id);
            this.fetchUserData(e.target.id);
        }

        this.canvases.forEach((canvas) => (canvas.style.display = "none"));
        document.getElementById(`${e.target.id}`).style.display = "block";

        this.topHeaderCanvas.forEach(
            (canvas) => (canvas.style.display = "none")
        );
        document.getElementById(`topHeader-${e.target.id}`).style.display =
            "block";

        this.leftHeaderCanvas.forEach(
            (canvas) => (canvas.style.display = "none")
        );
        document.getElementById(`leftHeader-${e.target.id}`).style.display =
            "block";
    };

    findandReplace() {
        //find and replace
        const replaceIcon = document.querySelector("#replaceIcon");
        const editingSectionModal = document.querySelector(
            ".editingSectionModal"
        );
        const closeEditingModal = document.querySelector("#closeEditingModal");
        replaceIcon.addEventListener("click", () => {
            if (editingSectionModal.style.display == "none") {
                editingSectionModal.style.display = "flex";
            } else {
                editingSectionModal.style.display = "none";
            }
        });
        closeEditingModal.addEventListener("click", () => {
            editingSectionModal.style.display = "none";
        });
    }
}

new sheetManager();
