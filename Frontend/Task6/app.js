const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const inputBox = document.getElementById("inputBox");
const contextmenu = document.getElementById("contextmenu");
const toolBar = document.getElementById("toolBar");

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
    const field = headers[colIndex];
    sortedField = field;
    sortData(field);
  }
});

const updateData = async (email, key, value) => {
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
  // window.alert(res);
};

const deleteRow = async (email) => {
  const response = await fetch(`http://localhost:5186/deleterow/${email}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await response.text();
  PageChange();
  window.alert(res);
  contextmenu.style.display = "none";
};

canvas.addEventListener(
  "contextmenu",
  (e) => {
    e.preventDefault();
    const dataStore = JSON.parse(localStorage.getItem("dataStore"));
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const colIndex = Math.floor(clickX / cellWidth);
    const rowIndex = Math.floor(clickY / cellHeight) - 1;
    localStorage.setItem("index", JSON.stringify([colIndex, rowIndex]));
    const item = dataStore[rowIndex];
    console.log(item);
    contextmenu.style.display = "block";
    contextmenu.style.top = `${(rowIndex + 1) * cellHeight}px`;
    contextmenu.style.left = `${colIndex * cellWidth + 200}px`;
    return false;
  },
  false
);

const deleterow = document.getElementById("delete-row");
deleterow.addEventListener("click", () => {
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  var index = JSON.parse(localStorage.getItem("index"));
  const item = dataStore[index[1]];
  deleteRow(item.email_id);
});

inputBox.addEventListener("keydown", (e) => {
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  inputBox.value = e.target.value;
  if (e.key === "Enter") {
    var index = JSON.parse(localStorage.getItem("index"));
    const item = dataStore[index[1]];
    if (index[0] >= 1 && index[0] < 14) {
      const field = headers[index[0]];
      updateData(item.email_id, field, e.target.value);
    }
  }
});
canvas.addEventListener("click", (e) => {
  inputBox.style.display = "none";
  contextmenu.style.display = "none";
});

canvas.addEventListener("dblclick", (e) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  renderTable(dataStore);
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const colIndex = Math.floor(clickX / cellWidth);
  const rowIndex = Math.floor(clickY / cellHeight) - 1;
  localStorage.setItem("index", JSON.stringify([colIndex, rowIndex]));

  if (rowIndex >= 0 && colIndex >= 1) {
    const item = dataStore[rowIndex];

    inputBox.style.display = "block";
    inputBox.style.position = "absolute";
    inputBox.style.top = `${(rowIndex + 1) * cellHeight}px`;
    inputBox.style.left = `${colIndex * cellWidth}px`;
    inputBox.focus();
    inputBox.value = dataStore[rowIndex][headers[colIndex]];

    switch (colIndex) {
      case 0:
        localStorage.setItem("storeValue", item.email_id);
        console.log(`${item.email_id}: ${item.email_id}`);
        break;
      case 1:
        inputValue = item.name;
        localStorage.setItem("storeValue", item.name);
        console.log(`${item.email_id}: ${item.name}`);
        break;
      case 2:
        localStorage.setItem("storeValue", item.country);
        console.log(`${item.email_id}: ${item.country}`);
        break;
      case 3:
        localStorage.setItem("storeValue", item.state);
        console.log(`${item.email_id}: ${item.state}`);
        break;
      case 4:
        localStorage.setItem("storeValue", item.city);
        console.log(`${item.email_id}: ${item.city}`);
        break;
      case 5:
        localStorage.setItem("storeValue", item.telephone_number);
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
toolBar.addEventListener("click", (e) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  renderTable(dataStore);
});
const drawHighlight = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw table
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  renderTable(dataStore);

  // Draw highlight rectangle
  const [startX, startY, width, height] = selectionDimensions;
  ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
  ctx.fillRect(
    startX * cellWidth,
    (startY + 1) * cellHeight,
    width * cellWidth,
    height * cellHeight
  );
};

let startingIndex = [];
let selectionDimensions = [];
let selection = false;

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  selection = true;

  const colIndex = Math.floor(clickX / cellWidth);
  const rowIndex = Math.floor(clickY / cellHeight) - 1;

  startingIndex = [colIndex, rowIndex];
});

canvas.addEventListener("mousemove", (e) => {
  if (selection) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const colIndex = Math.floor(clickX / cellWidth);
    const rowIndex = Math.floor(clickY / cellHeight) - 1;

    // Determine dimensions of selection
    const startX = Math.min(startingIndex[0], colIndex);
    const startY = Math.min(startingIndex[1], rowIndex);
    const endX = Math.max(startingIndex[0], colIndex);
    const endY = Math.max(startingIndex[1], rowIndex);

    selectionDimensions = [
      startX,
      startY,
      endX - startX + 1,
      endY - startY + 1,
    ];

    drawHighlight();
  }
});

let sum = 0;
let avg = 0;
let min = 0;
let max = 0;

// const tableRows = document.getElementById("tableRows")
const tableRows = document.querySelector("table");
const mathsCalculations = document.getElementById("mathsCalculations");

function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

canvas.addEventListener("mouseup", (e) => {
  selection = false;
});

const closeCalculator = mathsCalculations.querySelector("i");
closeCalculator.addEventListener("click", () => {
  mathsCalculations.classList.remove("mathsCalculations");
  mathsCalculations.classList.add("displayNone");
  tableRows.innerHTML = "";
});

const calculateValue = document.getElementById("calculateValue");
calculateValue.addEventListener("click", () => {
  contextmenu.style.display = "none";
  mathsCalculations.classList.add("mathsCalculations");
  mathsCalculations.classList.remove("displayNone");
  calculator();
});

const copy = document.getElementById("copy");

function transformMatrix(matrix) {
  if (matrix.length === 0) {
    return [];
  }

  const numRows = matrix.length;
  const numCols = matrix[0].length;

  const transformed = [];

  for (let col = 0; col < numCols; col++) {
    const pair = [];
    for (let row = 0; row < numRows; row++) {
      pair.push(matrix[row][col]);
    }
    transformed.push(pair);
  }
  return transformed;
}

copy.addEventListener("click", () => {
  copyToClipboard();
});

let copytext = [];

const copyToClipboard = () => {
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  const [startX, startY, width, height] = selectionDimensions;
  copytext = [];
  for (let j = startX; j < startX + width; j++) {
    let rowData = [];
    for (let i = startY; i < startY + height; i++) {
      rowData.push(dataStore[i][headers[j]]);
    }
    copytext.push(rowData);
  }
  copytext = transformMatrix(copytext);
  const textToCopy = copytext.join("\n");
  navigator.clipboard.writeText(textToCopy);
  window.alert("Copied to Clipboard");
  contextmenu.style.display = "none";
};

const calculator = () => {
  const dataStore = JSON.parse(localStorage.getItem("dataStore"));
  const [startX, startY, width, height] = selectionDimensions;
  console.log(startX, startY, width, height);

  var z = document.createElement("tr");
  z.innerHTML = `<tr>
          <th>Column Name</th>
          <th>Sum</th>
          <th>Min</th>
          <th>Max</th>
          <th>Avg</th>
        </tr>`;
  tableRows.appendChild(z);

  for (let j = startX; j < startX + width; j++) {
    sum = 0;
    min = dataStore[startY][headers[j]];
    max = 0;
    let isNum = true;

    for (let i = startY; i < startY + height; i++) {
      sum += Number(dataStore[i][headers[j]]);
      min = Math.min(min, dataStore[i][headers[j]]);
      max = Math.max(max, dataStore[i][headers[j]]);
    }
    isNum = isNumber(sum);

    var z = document.createElement("tr");

    z.innerHTML = `
    <td>${headers[j]}</td>
     <td>${isNum ? sum : "NaN"}</td>
     <td>${isNum ? min : "NaN"}</td>
     <td>${isNum ? max : "NaN"}</td>
     <td>${isNum ? (sum / height).toFixed(2) : "NaN"}</td>
    `;
    tableRows.appendChild(z);
  }
  console.log(copytext);
};
