import { newCanvas } from "./main.js";

new newCanvas("sheet-1");

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

let createdCanvas = ["sheet-1"];
sheets.addEventListener("click", (e) => {
  if (e.target.closest(".sheetBtn")) {
    selectCurrSheet(e);
  }
});

var canvases = document.querySelectorAll(".canvas");
var topHeaderCanvas = document.querySelectorAll(".topHeaderCanvas");
var leftHeaderCanvas = document.querySelectorAll(".leftHeaderCanvas");

const selectCurrSheet = (e) => {
  var sheetBtn1 = document.querySelectorAll(".sheetBtn1");
  sheetBtn1.forEach((btn) => btn.classList.remove("selected"));
  e.target.classList.add("selected");

  if (!createdCanvas.includes(e.target.id)) {
    createdCanvas.push(e.target.id);
    new newCanvas(e.target.id);
  }

  current = e.target.id;

  canvases.forEach((canvas) => (canvas.style.display = "none"));
  document.getElementById(`${e.target.id}`).style.display = "block";

  topHeaderCanvas.forEach((canvas) => (canvas.style.display = "none"));
  document.getElementById(`topHeader-${e.target.id}`).style.display = "block";

  leftHeaderCanvas.forEach((canvas) => (canvas.style.display = "none"));
  document.getElementById(`leftHeader-${e.target.id}`).style.display = "block";
};

const sheetListModalBtn = document.getElementById("sheetListModalBtn");
const sheetList = JSON.parse(localStorage.getItem("sheetlist"));

sheetListModalBtn.addEventListener("click", () => {
  if (sheetListModal.style.display == "flex") {
    sheetListModal.style.display = "none";
  } else {
    sheetListModal.style.display = "flex";
  }
});

//find and replace function
const replaceIcon = document.querySelector("#replaceIcon");
const editingSectionModal = document.querySelector(".editingSectionModal");
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
