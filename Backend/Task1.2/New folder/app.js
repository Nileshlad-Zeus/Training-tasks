const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const prev = document.querySelector("#prev");
const next = document.querySelector("#next");
const currPage = document.querySelector("#currentPage");
let pageNo = currPage.innerText;
prev.addEventListener("click", () => {
  if (pageNo == 1) {
    prev.disabled = true;
  } else {
    pageNo--;
    fetchUserData(pageNo);
  }
});

next.addEventListener("click", () => {
  pageNo++;
  fetchUserData(pageNo);
});

const fetchUserData = async (pageNo) => {
  console.log(pageNo);
  const response = await fetch(`http://localhost:5186/getalldata/${pageNo}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  renderTable(json);
  if (json.length < 100) {
    next.disabled = true;
    return;
  } else {
    next.disabled = false;
    prev.disabled = false;
  }
  currPage.innerHTML = pageNo;
};

fetchUserData(pageNo);

const renderTable = (data) => {
  const numRows = data.length;
  const numCols = 14;
  const cellWidth = 220;
  const cellHeight = 40;

  canvas.width = cellWidth * numCols;
  canvas.height = cellHeight * numRows;

  // Draw vertical grid lines
  for (let x = 0; x <= numCols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellWidth, 0);
    ctx.lineTo(x * cellWidth, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = 0; y <= numRows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellHeight);
    ctx.lineTo(canvas.width, y * cellHeight);
    ctx.stroke();
  }

  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Email Id", cellWidth / 2, cellHeight / 2);
  ctx.fillText("Name", (3 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("Country", (5 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("State", (7 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("City", (9 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("Telephone", (11 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("Address Line 1", (13 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("Address Line 2", (15 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("Date of Birth", (17 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("2019-20", (19 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("2020-21", (21 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("2021-22", (23 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("2022-23", (25 * cellWidth) / 2, cellHeight / 2);
  ctx.fillText("2023-24", (27 * cellWidth) / 2, cellHeight / 2);

  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  data.forEach((item, index) => {
    const x = cellWidth;
    const y = (index + 2) * cellHeight - 20; // Start from the third row (first data row)

    // ctx.save();
    // ctx.beginPath();
    // ctx.rect(10, 10, cellWidth, cellHeight);
    // ctx.stroke();
    // ctx.clip();

    // Render the data fields

    ctx.fillText(item.email_id, 20, y);
    ctx.fillText(item.name, x + 20, y);
    ctx.fillText(item.country, 2 * x + 20, y);
    ctx.fillText(item.state, 3 * x + 20, y);
    ctx.fillText(item.city, 4 * x + 20, y);
    ctx.fillText(item.telephone_number, 5 * x + 20, y);
    ctx.fillText(item.address_line_1, 6 * x + 20, y);
    ctx.fillText(item.address_line_2, 7 * x + 20, y);
    ctx.fillText(item.date_of_birth, 8 * x + 20, y);

    // Align the salary data to the right
    ctx.fillText(item.gross_salary_2019_20, 9 * x + 20, y);
    ctx.fillText(item.gross_salary_2020_21, 10 * cellWidth + 20, y);
    ctx.fillText(item.gross_salary_2021_22, 11 * cellWidth + 20, y);
    ctx.fillText(item.gross_salary_2022_23, 12 * cellWidth + 20, y);
    ctx.fillText(item.gross_salary_2023_24, 13 * cellWidth + 20, y);

    ctx.restore();
  });
};

// http://localhost:5186/getalldata/0

// modal

const modal = document.querySelector(".modal");
const fileUploadModal = document.querySelector("#fileUploadModal");
const file = document.querySelector("input[type='file']");
const closeModal = document.querySelector(".modal i");
const uplaodFile = document.querySelector("#uplaodFile");
const fileSubmitBtn = document.querySelector("#fileSubmitBtn");

const modalHeading = modal.querySelector("h3");

uplaodFile.addEventListener("click", () => {
  fileUploadModal.classList.add("fileUploadModal");
  fileUploadModal.classList.remove("closeFileUploadModal");
});
modal.addEventListener("click", () => {
  file.click();
});

file.addEventListener("change",(e)=>{
  if(file.files.length){
    const files = e.target.files;
    const fileName = files[0].name;
    modalHeading.innerText = fileName
  }
})
fileSubmitBtn.addEventListener("click",(e)=>{
  e.stopPropagation();
})

closeModal.addEventListener("click", (e) => {
  e.stopPropagation();
  fileUploadModal.classList.add("closeFileUploadModal");
  fileUploadModal.classList.remove("fileUploadModal");
});
