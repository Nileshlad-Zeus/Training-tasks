const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const prevButton = document.querySelector("#prev");
const nextButton = document.querySelector("#next");
const currPageDisplay = document.querySelector("#currentPage");
const inputBox = document.getElementById("inputBox");
const body = document.getElementsByTagName("body")

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

const updateData = async (email, key, value) => {
  console.log(email, key, value);
  const response = await fetch(`http://localhost:5186/updatedata/${email}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: key,
      value: value,
    }),
  });
  const res = await response.text();
  PageChange();
  inputBox.style.display = "none";
  window.alert(res);
};

inputBox.addEventListener("keydown", (e) => {
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));

  if (e.key === "Enter") {
    var index = JSON.parse(localStorage.getItem("index"));
    const item = dataStore[index[1]];

    if (index[0] >= 0 && index[0] < 14) {
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
      const field = headers[index[0]];
      updateData(item.email_id, field, e.target.value);
      e.target.value = null;
    }
    // switch (index[0]) {
    //   case 0:
    //     updateData(item.email_id, "email_id", e.target.value);
    //     break;
    //   case 1:
    //     updateData(item.email_id, "name", e.target.value);
    //     break;
    //   case 2:
    //     updateData(item.email_id, "country", e.target.value);
    //     break;
    //   case 3:
    //     updateData(item.email_id, "state", e.target.value);
    //     break;
    //   case 4:
    //     updateData(item.email_id, "city", e.target.value);
    //     break;
    //   case 5:
    //     updateData(item.email_id, "telephone_number", e.target.value);
    //     break;
    //   case 6:
    //     updateData(item.email_id, "address_line_1", e.target.value);
    //     break;
    //   case 7:
    //     updateData(item.email_id, "address_line_2", e.target.value);
    //     break;
    //   case 8:
    //     updateData(item.email_id, "date_of_birth", e.target.value);
    //     break;
    //   case 9:
    //     updateData(item.email_id, "gross_salary_2019_20", e.target.value);
    //     break;
    //   case 10:
    //     updateData(item.email_id, "gross_salary_2020_21", e.target.value);
    //     break;
    //   case 11:
    //     updateData(item.email_id, "gross_salary_2021_22", e.target.value);
    //     break;
    //   case 12:
    //     updateData(item.email_id, "gross_salary_2022_23", e.target.value);
    //     break;
    //   case 13:
    //     updateData(item.email_id, "gross_salary_2023_24", e.target.value);
    //     break;
    //   default:
    //     break;
    // }
  }
});

const contextmenu = document.getElementById("contextmenu");
canvas.addEventListener(
  "contextmenu",
  (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    console.log("Click");
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const colIndex = Math.floor(clickX / cellWidth);
    const rowIndex = Math.floor(clickY / cellHeight) - 1;
    contextmenu.style.display = "block";
    contextmenu.style.top = `${(rowIndex + 1) * cellHeight}px`;
    contextmenu.style.left = `${colIndex * cellWidth + 200}px`;
    return false;
  },
  false
);

canvas.addEventListener("click", (e) => {
  
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const colIndex = Math.floor(clickX / cellWidth);
  const rowIndex = Math.floor(clickY / cellHeight) - 1;
  localStorage.setItem("index", JSON.stringify([colIndex, rowIndex]));

  if (rowIndex >= 0 && colIndex >= 0) {
    const item = dataStore[rowIndex];

    inputBox.style.display = "block";
    inputBox.style.position = "absolute";
    inputBox.style.top = `${(rowIndex + 1) * cellHeight}px`;
    inputBox.style.left = `${colIndex * cellWidth}px`;
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

body.addEventListener("click",()=>{
  contextmenu.style.display = "none";
  inputBox.style.display = "none";
})