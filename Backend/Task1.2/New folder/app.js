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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const response = await fetch(`http://localhost:5186/getalldata/${pageNo}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  renderTable(json);
  next.disabled = data.length < 100;
  prev.disabled = currPage.innerHTML === 1
  currPage.innerHTML = pageNo;
};

const sortData = async (field) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log(field);
  const response = await fetch(`http://localhost:5186/sortdata/${field}/100`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  renderTable(json);
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

  const sortFun = (e) => {
    const x = cellWidth;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    switch (true) {
      case clickX >= 20 &&
        clickX <= 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("email_id");
        break;
      case clickX >= x + 20 &&
        clickX <= x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("name");
        break;
      case clickX >= 2 * x + 20 &&
        clickX <= 2 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("country");
        break;
      case clickX >= 3 * x + 20 &&
        clickX <= 3 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("state");
        break;
      case clickX >= 4 * x + 20 &&
        clickX <= 4 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("city");
        break;
      case clickX >= 5 * x + 20 &&
        clickX <= 5 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("telephone_number");
        break;
      case clickX >= 6 * x + 20 &&
        clickX <= 6 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("address_line_1");
        break;
      case clickX >= 7 * x + 20 &&
        clickX <= 7 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("address_line_2");
        break;
      case clickX >= 8 * x + 20 &&
        clickX <= 8 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("date_of_birth");
        break;
      case clickX >= 9 * x + 20 &&
        clickX <= 9 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("gross_salary_2019_20");
        break;
      case clickX >= 10 * x + 20 &&
        clickX <= 10 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("gross_salary_2020_21");
        break;
      case clickX >= 11 * x + 20 &&
        clickX <= 11 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("gross_salary_2021_22");
        break;
      case clickX >= 12 * x + 20 &&
        clickX <= 12 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("gross_salary_2022_23");
        break;
      case clickX >= 13 * x + 20 &&
        clickX <= 13 * x + 20 + cellWidth &&
        clickY >= 0 &&
        clickY <= 40:
        sortData("gross_salary_2023_24");
        break;
      default:
        break;
    }
  };

  canvas.addEventListener("click", sortFun);
  ctx.font = "14px Arial";
  ctx.textAlign = "left";

  data.forEach((item, index) => {
    const x = cellWidth;
    const y = (index + 1) * cellHeight + 20; // Start from the third row (first data row)

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
    ctx.fillText(item.gross_salary_2019_20, 9 * x + 20, y);
    ctx.fillText(item.gross_salary_2020_21, 10 * cellWidth + 20, y);
    ctx.fillText(item.gross_salary_2021_22, 11 * cellWidth + 20, y);
    ctx.fillText(item.gross_salary_2022_23, 12 * cellWidth + 20, y);
    ctx.fillText(item.gross_salary_2023_24, 13 * cellWidth + 20, y);

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      switch (true) {
        case clickX >= 20 &&
          clickX <= 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.email_id}`);
          break;
        case clickX >= x + 20 &&
          clickX <= x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.name}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 2 * x + 20 &&
          clickX <= 2 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.country}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 3 * x + 20 &&
          clickX <= 3 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.state}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 4 * x + 20 &&
          clickX <= 4 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.city}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 5 * x + 20 &&
          clickX <= 5 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.telephone_number}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 6 * x + 20 &&
          clickX <= 6 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(` ${item.address_line_1}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 7 * x + 20 &&
          clickX <= 7 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.address_line_2}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 8 * x + 20 &&
          clickX <= 8 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.date_of_birth}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 9 * x + 20 &&
          clickX <= 9 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.gross_salary_2019_20}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 10 * x + 20 &&
          clickX <= 10 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.gross_salary_2020_21}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 11 * x + 20 &&
          clickX <= 11 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.gross_salary_2021_22}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 12 * x + 20 &&
          clickX <= 12 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.gross_salary_2022_23}`);
          console.log(`${item.email_id}`);
          break;
        case clickX >= 13 * x + 20 &&
          clickX <= 13 * x + 20 + cellWidth &&
          clickY >= y - 14 &&
          clickY <= y + 14:
          console.log(`${item.gross_salary_2023_24}`);
          console.log(`${item.email_id}`);
          break;
        default:
          break;
      }
    });

    ctx.restore();
  });
};

