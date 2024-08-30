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
    }

    fetchUserData = async (sheedId) => {
        new newCanvas(sheedId);
        this.canvases = document.querySelectorAll(".canvas");
        this.topHeaderCanvas = document.querySelectorAll(".topHeaderCanvas");
        this.leftHeaderCanvas = document.querySelectorAll(".leftHeaderCanvas");
    };

    uploadFile = () => {
        const selectFile = document.getElementById("selectFile");
        const selectFileInput = document.getElementById("selectFileInput");
        selectFile.addEventListener("click", () => {
            selectFileInput.click();
        });
        selectFileInput.addEventListener("change", async (e) => {
            e.preventDefault();
            console.log(selectFileInput.files[0]);
            var data = new FormData();
            data.append("file", selectFileInput.files[0]);
            const response = await fetch(
                `http://localhost:5022/api/Employee/UploadFile`,
                {
                    method: "POST",
                    body: data,
                }
            );
            const res = await response.json();
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
        const replaceIcon = document.querySelector(".findAndReplaceIcon");
        const findIcon = document.querySelector(".findIcon");
        const editingSectionModal = document.querySelector(
            ".findandselectSectionModal"
        );
        const closeEditingModal = document.querySelector("#closeEditingModal");
        replaceIcon.addEventListener("click", () => {
            if (editingSectionModal.style.display == "none") {
                editingSectionModal.style.display = "flex";
                findSection.style.display = "none";
                replaceSection.style.display = "block";
                toogleReplace.classList.add("active");
                toogleFind.classList.remove("active");
            } else {
                editingSectionModal.style.display = "none";
            }
        });

        findIcon.addEventListener("click", () => {
            if (editingSectionModal.style.display == "none") {
                editingSectionModal.style.display = "flex";
                findSection.style.display = "block";
                replaceSection.style.display = "none";
                toogleFind.classList.add("active");
                toogleReplace.classList.remove("active");
            } else {
                editingSectionModal.style.display = "none";
            }
        });

        const findtextInput = document.querySelector("#findtextInput");
        const replacetextInput = document.querySelector("#replacetextInput");
        const findAndReplaceStatus = document.getElementById(
            "findAndReplaceStatus"
        );

        closeEditingModal.addEventListener("click", () => {
            findAndReplaceStatus.style.display = "none";
            editingSectionModal.style.display = "none";
            findtextInput.value = null;
            replacetextInput.value = null;
        });

        const findSection = document.querySelector(".findSection");
        const toogleFind = document.querySelector("#toogleFind");
        const replaceSection = document.querySelector(".replaceSection");
        const toogleReplace = document.querySelector("#toogleReplace");

        toogleFind.addEventListener("click", () => {
            findSection.style.display = "block";
            replaceSection.style.display = "none";
            toogleFind.classList.toggle("active");
            toogleReplace.classList.toggle("active");
        });

        toogleReplace.addEventListener("click", () => {
            findSection.style.display = "none";
            replaceSection.style.display = "block";
            toogleReplace.classList.toggle("active");
            toogleFind.classList.toggle("active");
        });
    }
}

new sheetManager();
