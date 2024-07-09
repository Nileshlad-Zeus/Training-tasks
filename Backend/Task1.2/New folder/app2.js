const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const prevButton = document.querySelector("#prev");
const nextButton = document.querySelector("#next");
const currPageDisplay = document.querySelector("#currentPage");
const inputBox = document.getElementById("inputBox");

let currentPage = currPageDisplay.innerText;

prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    PageChange();
  }
});

nextButton.addEventListener("click", () => {
  currentPage++;
  PageChange();
});

const cellWidth = 220;
const cellHeight = 40;
localStorage.setItem("isSorted", JSON.stringify([false, null]));

const search = document.getElementById("search");
search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    console.log(e.target.value);
  }
});

const fetchUserData = async (page) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const response = await fetch(`http://localhost:5186/getalldata/${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  renderTable(data);
};

const sortData = async (field) => {
  let isSorted = JSON.parse(localStorage.getItem("isSorted"));
  if (isSorted[1] !== field) {
    currentPage = 1;
    currPageDisplay.innerText = 1;
  }
  localStorage.setItem("isSorted", JSON.stringify([true, field]));
  console.log(currentPage);
  const response = await fetch(
    `http://localhost:5186/sortdata/${field}/${currentPage}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();
  renderTable(data);
};

const renderTable = (data) => {
  localStorage.setItem("dataStore", JSON.stringify(data));
  const numRows = data.length;
  const numCols = 14;

  canvas.width = cellWidth * numCols;
  canvas.height = cellHeight * numRows;

  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";

  // Draw grid lines
  for (let x = 0; x <= numCols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellWidth, 0);
    ctx.lineTo(x * cellWidth, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= numRows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellHeight);
    ctx.lineTo(canvas.width, y * cellHeight);
    ctx.stroke();
  }

  // Render headers
  const headers = [
    "Email Id",
    "Name",
    "Country",
    "State",
    "City",
    "Telephone",
    "Address Line 1",
    "Address Line 2",
    "Date of Birth",
    "2019-20",
    "2020-21",
    "2021-22",
    "2022-23",
    "2023-24",
  ];
  headers.forEach((header, index) => {
    ctx.fillText(header, ((2 * index + 1) * cellWidth) / 2, cellHeight / 2);
  });

  // Render data rows
  ctx.font = "14px Arial";
  data.forEach((item, index) => {
    const y = (index + 1) * cellHeight + 20;
    Object.keys(item).forEach((key, colIndex) => {
      ctx.fillText(item[key], ((2 * colIndex + 1) * cellWidth) / 2, y);
    });
  });
};

const PageChange = () => {
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  nextButton.disabled = dataStore.length < 100;
  prevButton.disabled = currentPage === 1;
  currPageDisplay.innerText = currentPage;

  let isSorted = JSON.parse(localStorage.getItem("isSorted"));
  if (isSorted[0]) {
    sortData(isSorted[1]);
  } else {
    fetchUserData(currentPage);
  }
};
PageChange();

const updateData = () =>{
    
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const colIndex = Math.floor(clickX / cellWidth);
  const rowIndex = Math.floor(clickY / cellHeight) - 1;

  if (colIndex >= 0 && colIndex < 14 && rowIndex == -1) {
    const headers = [
      "email_id",
      "name",
      "country",
      "state",
      "city",
      "telephone_number",
      "address_line_1",
      "address_line_2",
      "date_of_birth",
      "gross_salary_2019_20",
      "gross_salary_2020_21",
      "gross_salary_2021_22",
      "gross_salary_2022_23",
      "gross_salary_2023_24",
    ];

    const field = headers[colIndex];
    sortedField = field;
    sortData(field);
  }
});

canvas.addEventListener("click", (e) => {
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Calculate row and column indices
  const colIndex = Math.floor(clickX / cellWidth);
  const rowIndex = Math.floor(clickY / cellHeight) - 1; // Subtract 1 to adjust for header row

  if (rowIndex >= 0 && colIndex >= 0) {
    // Retrieve the data item corresponding to the clicked cell
    const item = dataStore[rowIndex];

    // Determine which field was clicked based on column index
    inputBox.style.display="block";
    inputBox.style.position="absolute";
    inputBox.style.top= `${(rowIndex+1) * cellHeight}px`;
    inputBox.style.left= `${(colIndex) * cellWidth}px`;
    switch (colIndex) {
      case 0:
        console.log(`${item.email_id}: ${item.email_id}`);
        break;
      case 1:
        console.log(`${item.email_id}: ${item.name}`);
        break;
      case 2:
        console.log(`${item.email_id}: ${item.country}`);
        break;
      case 3:
        console.log(`${item.email_id}: ${item.state}`);
        break;
      case 4:
        console.log(`${item.email_id}: ${item.city}`);
        break;
      case 5:
        console.log(`${item.email_id}: ${item.telephone_number}`);
        break;
      case 6:
        console.log(`${item.email_id}: ${item.address_line_1}`);
        break;
      case 7:
        console.log(`${item.email_id}: ${item.address_line_2}`);
        break;
      case 8:
        console.log(`${item.email_id}: ${item.date_of_birth}`);
        break;
      case 9:
        console.log(`${item.email_id}: ${item.gross_salary_2019_20}`);
        break;
      case 10:
        console.log(`${item.email_id}: ${item.gross_salary_2020_21}`);
        break;
      case 11:
        console.log(`${item.email_id}: ${item.gross_salary_2021_22}`);
        break;
      case 12:
        console.log(`${item.email_id}: ${item.gross_salary_2022_23}`);
        break;
      case 13:
        console.log(`${item.email_id}: ${item.gross_salary_2023_24}`);
        break;
      default:
        break;
    }
  }
});
