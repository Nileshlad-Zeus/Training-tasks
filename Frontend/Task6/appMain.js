class newCanvas {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.inputBox = document.getElementById("canvasinput");

    this.scale = 1;
    // document.addEventListener("resize", () => {
    //   this.scale = window.devicePixelRatio;
    //   this.createNewCanvas();
    // });
    this.createNewCanvas();
    this.initialVariables();
    this.highlightSelectedAreaEvents();
    this.scrollFunction();
    this.resizeGridEvents();
    this.highlightSelectedArea();
    this.inputBoxPosition();
    this.inputBox.style.display = "none";
    document.addEventListener("keydown", (event) => {
      this.keyBoardEvents(event);
    });
    this.drawGrid();
    this.highlightHeaders();
    this.renderLeftHeader();
    this.renderTopHeader();
    this.changeFontStyle();

    const topleft = document.getElementById("topleft");
    topleft.addEventListener("click", () => {
      this.x1CellIndex = 0;
      this.y1CellIndex = 0;
      this.topheaderSelected = true;
      this.leftheaderSelected = true;

      this.isColSelected = true;
      this.isRowSelected = true;

      this.currSelectedCol = [0, 100];
      this.currSelectedRow = [0, 100];

      this.selectedDimensionsMain = [0, 0, 200, 200];
      this.highlightSelectedArea();
      this.drawGrid();
      this.highlightHeaders();
      this.renderLeftHeader();
      this.renderTopHeader();
    });
  }

  initialVariables() {
    //height and width of cell
    this.defaultCellHeight = 21;
    this.defaultCellWidth = 100;

    //initial number of rows and cols
    this.numRows = 100;
    this.numCols = 26;

    //data structure for storing data
    this.cellHeight = new Map();
    this.cellWidths = new Map();
    this.cellPositionTopArr = new Map();
    this.cellPositionTopArr = new Map();

    //colors
    this.strokeColor = "rgb(16,124,65)";
    this.areaHighlightColor = "rgb(231,241,236)";
    this.headersHighlightColor = "rgb(202,234,216)";
    this.gridStrokeColor = "rgb(128, 128, 128)";
    this.blackColor = "rgb(0, 0, 0)";
    this.whiteColor = "rgb(255, 255, 255)";
    this.headerBgColor = "rgb(245,245,245)";

    //selected rows and cols for highlight them
    this.currSelectedCol = null;
    this.currSelectedRow = null;
    this.isColSelected = false;
    this.isRowSelected = false;

    //resize column
    this.isDraggingTop = false;
    this.resizeColIndex = -1;
    this.resizeColTop = 0;
    this.resizeColWidth = 0;

    //resize row
    this.isDraggingLeft = false;
    this.resizeRowIndex = -1;
    this.resizeRowTop = 0;
    this.resizeRowHeight = 0;

    //current cell Index
    this.x1CellIndex = 0;
    this.x2CellIndex = 0;
    this.y1CellIndex = 0;
    this.y2CellIndex = 0;

    //current Cell positions
    this.cellPositionTop = 0;
    this.cellPositionLeft = 0;

    //coordinated for highlighting headers [x,y,width,height]
    this.headersHighlightCoordinate = null;

    this.topheaderSelected = false;
    this.leftheaderSelected = false;

    //coordinated for highlight selected area [startX,startY,endX,endY]
    this.isAreaSelected = false;
    this.selectedDimensionsMain = [0, 0, 0, 0];
    this.selectedTopHeaderCoordinates = [0, 0, 0, 0];
    this.selectedLeftHeaderCoordinates = [0, 0, 0, 0];

    //starring index of mouse Down Evenets
    this.startingIndex = null;
    this.startingIndexTop = null;
    this.startingIndexLeft = null;

    //Marching Ants Animation variables
    this.marchingAntsCoordinates = null;
    this.lineDashOffset = 0;
    this.isAnimationRunning = false;
    this.animateFullColumn = false;
    this.animateFullRow = false;
    this.alreadyCopy = 0; //0: ctrl+c on animation not running  1:ctrl+c on animation already running

    this.colFlag = false;
    this.rowFlag = false;

    //data store
    //color, font style, bold, font size, font family
    this.sheetData = [
      {
        0: {
          0: {
            data: "Nilesh",
            properties: "*****",
          },
          2: {
            data: "Lad",
            properties: "*****",
          },
        },
      },
      {
        1: {
          0: {
            data: "Jhon",
            properties: "*****",
          },
          1: {
            data: "Cena",
            properties: "*****",
          },
        },
      },
      {
        5: {
          0: {
            data: "Jhon",
            properties: "*****",
          },
          6: {
            data: "Cena",
            properties: "*****",
          },
        },
      },
      {
        3: {
          5: {
            data: "Harsh",
            properties: "*****",
          },
          0: {
            data: "Cena",
            properties: "*****",
          },
        },
      },
    ];
  }

  createNewCanvas() {
    //sheet canvas

    const main = document.getElementById("main");
    const mainCanvas = document.createElement("canvas");
    mainCanvas.setAttribute("id", this.sheetName);
    mainCanvas.setAttribute("class", "canvas");
    mainCanvas.width = Math.floor(2100 * this.scale);
    mainCanvas.height = Math.floor(1200 * this.scale);

    // mainCanvas.width = 2100;
    // mainCanvas.height = 1200;
    main.appendChild(mainCanvas);
    this.mainCanvas = mainCanvas;
    this.mainCtx = this.mainCanvas.getContext("2d");
    this.mainCtx.scale(this.scale, this.scale);

    //topheader canvas
    const topHeader = document.getElementById("topHeader");
    const topHeaderCanvas = document.createElement("canvas");
    topHeaderCanvas.setAttribute("id", `topHeader-${this.sheetName}`);
    topHeaderCanvas.setAttribute("class", "topHeaderCanvas");
    topHeaderCanvas.width = Math.floor(2100 * this.scale);
    topHeaderCanvas.height = Math.floor(24 * this.scale);
    // topHeaderCanvas.width = 2100;
    // topHeaderCanvas.height = 24;
    topHeader.appendChild(topHeaderCanvas);
    this.topHeaderCanvas = topHeaderCanvas;
    this.topHeaderCtx = this.topHeaderCanvas.getContext("2d");
    this.topHeaderCtx.scale(this.scale, this.scale);

    //leftheader canvas
    const leftHeader = document.getElementById("leftHeader");
    const leftHeaderCanvas = document.createElement("canvas");
    leftHeaderCanvas.setAttribute("id", `leftHeader-${this.sheetName}`);
    leftHeaderCanvas.setAttribute("class", "leftHeaderCanvas");
    leftHeaderCanvas.width = Math.floor(40 * this.scale);
    leftHeaderCanvas.height = Math.floor(1200 * this.scale);

    // leftHeaderCanvas.width = 40;
    // leftHeaderCanvas.height = 1200;
    leftHeader.appendChild(leftHeaderCanvas);
    this.leftHeaderCanvas = leftHeaderCanvas;
    this.leftHeaderCtx = this.leftHeaderCanvas.getContext("2d");
    this.leftHeaderCtx.scale(this.scale, this.scale);

    this.mainCanvas.style.cursor = "cell";
  }

  clearCanvas() {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.topHeaderCtx.clearRect(
      0,
      0,
      this.topHeaderCanvas.width,
      this.topHeaderCanvas.height
    );
    this.leftHeaderCtx.clearRect(
      0,
      0,
      this.leftHeaderCanvas.width,
      this.leftHeaderCanvas.height
    );
  }
  clearTopheader() {
    this.topHeaderCtx.clearRect(
      0,
      0,
      this.topHeaderCanvas.width,
      this.topHeaderCanvas.height
    );
  }

  clearLeftHeader() {
    this.leftHeaderCtx.clearRect(
      0,
      0,
      this.leftHeaderCanvas.width,
      this.leftHeaderCanvas.height
    );
  }

  inputBoxPosition() {
    this.inputBox.style.display = "block";
    this.inputBox.style.top = `${this.cellPositionTop - 2}px`;
    0;
    this.inputBox.style.left = `${this.cellPositionLeft - 2}px`;
    this.inputBox.style.height = `${
      this.getCurCellHeight(this.y1CellIndex) + 5
    }px`;
    this.inputBox.style.width = `${
      this.getCurCellWidth(this.x1CellIndex) + 5
    }px`;
  }

  changeFontColor() {
    var value = colorSelector.value;
    const [startX, startY] = this.selectedDimensionsMain;
    const result = this.sheetData.find((item) => item[startY]);
    let currentData = result[startY][startX];
    let properties = currentData?.properties;
    let Pos = this.getPos(properties, "*", 1);
    let oldVal = properties.slice(Pos[0] + 1, Pos[1]);
    let newValue;
    if (oldVal == "") {
      newValue =
        properties.slice(0, Pos[0] + 1) + value + properties.slice(Pos[0] + 1);
    } else {
      newValue = properties.replace(oldVal, value);
    }
    console.log(newValue);
    // this.sheetData[startY][startY][startX]["properties"] = newValue;

    result[startY][startX].properties = newValue;
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.highlightSelectedArea();
    this.drawGrid();
  }
  changeFontStyle() {
    const fontsize = document.getElementById("fontsize");
    const fontfamily = document.getElementById("fontfamily");
    const fontbold = document.getElementById("fontbold");
    const fontitalic = document.getElementById("fontitalic");
    const openColorPalette = document.getElementById("openColorPalette");
    const colorSelector = document.getElementById("colorSelector");

    const fontUnderline = document.querySelector(".fontColor p");

    openColorPalette.addEventListener("click", (e) => {
      colorSelector.click();
    });
    fontUnderline.addEventListener("click", (e) => {
      this.changeFontColor();
    });
    colorSelector.addEventListener("change", (e) => {
      var value = colorSelector.value;
      fontUnderline.style.borderColor = value;
      this.changeFontColor();
    });

    fontsize.addEventListener("change", () => {
      var value = fontsize.value;
      const [startX, startY] = this.selectedDimensionsMain;
      const result = this.sheetData.find((item) => item[startY]);
      let currentData = result[startY][startX];
      let properties = currentData?.properties;
      let Pos = this.getPos(properties, "*", 4);
      let oldVal = properties.slice(Pos[0] + 1, Pos[1]);
      let newValue;
      if (oldVal == "") {
        newValue =
          properties.slice(0, Pos[0] + 1) +
          value +
          properties.slice(Pos[0] + 1);
      } else {
        newValue = properties.replace(oldVal, value);
      }
      // this.sheetData[startY][startY][startX]["properties"] = newValue;

      result[startY][startX].properties = newValue;
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
    });

    fontfamily.addEventListener("change", () => {
      var value = fontfamily.value;
      const [startX, startY] = this.selectedDimensionsMain;
      const result = this.sheetData.find((item) => item[startY]);
      let currentData = result[startY][startX];
      let properties = currentData?.properties;
      let Pos = this.getPos(properties, "*", 5);
      let oldVal = properties.slice(Pos[0] + 1, Pos[1]);
      let newValue;
      if (oldVal == "") {
        newValue =
          properties.slice(0, Pos[0] + 1) +
          value +
          properties.slice(Pos[0] + 1);
      } else {
        newValue = properties.replace(oldVal, value);
      }

      // this.sheetData[startY][startY][startX]["properties"] = newValue;

      result[startY][startX].properties = newValue;
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
    });

    fontbold.addEventListener("click", () => {
      let value = "";
      if (!fontbold.classList.contains("fontstyleactive")) {
        value = "bold";
      }
      fontbold.classList.toggle("fontstyleactive");

      const [startX, startY] = this.selectedDimensionsMain;
      const result = this.sheetData.find((item) => item[startY]);
      let currentData = result[startY][startX];
      let properties = currentData?.properties;
      let Pos = this.getPos(properties, "*", 3);
      let oldVal = properties.slice(Pos[0] + 1, Pos[1]);
      let newValue;
      if (oldVal == "") {
        newValue =
          properties.slice(0, Pos[0] + 1) +
          value +
          properties.slice(Pos[0] + 1);
      } else {
        newValue = properties.replace(oldVal, value);
      }

      // this.sheetData[startY][startY][startX]["properties"] = newValue;
      result[startY][startX].properties = newValue;
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
    });

    fontitalic.addEventListener("click", () => {
      let value = "";
      if (!fontitalic.classList.contains("fontstyleactive")) {
        value = "italic";
      }
      fontitalic.classList.toggle("fontstyleactive");

      const [startX, startY] = this.selectedDimensionsMain;

      const result = this.sheetData.find((item) => item[startY]);
      let currentData = result[startY][startX];

      let properties = currentData?.properties;
      let Pos = this.getPos(properties, "*", 2);
      let oldVal = properties.slice(Pos[0] + 1, Pos[1]);
      let newValue;
      if (oldVal == "") {
        newValue =
          properties.slice(0, Pos[0] + 1) +
          value +
          properties.slice(Pos[0] + 1);
      } else {
        newValue = properties.replace(oldVal, value);
      }

      result[startY][startX].properties = newValue;
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
    });
  }

  //----------------------draw grid----------------------
  drawGrid() {
    this.mainCtx.save();
    // this.mainCtx.fillStyle="#ffffff"
    // this.mainCtx.fillRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.mainCtx.restore();
    this.drawRows();
    this.drawColumns();

    let i;
    let cellPositionY = 0;
    this.sheetData.forEach((data) => {
      let cellPositionX = 0;
      cellPositionY = this.getCurCellHeight(0);
      if (Object.keys(data) == 0) {
        cellPositionY = this.getCurCellHeight(0);
      } else {
        for (let k = 0; k < Object.keys(data); k++) {
          cellPositionY += this.getCurCellHeight(k);
        }
      }
      i = Object.keys(data);
      // let count = Object.keys(data[i])?.length;
      let min = 0,
        max = 0;
      if (data[i]) {
        min = Object.keys(data[i])[0] || 0;
        max = Object.keys(data[i])[0] || 0;
        Object.keys(data[i]).forEach((ele) => {
          min = Math.min(min, ele);
          max = Math.max(max, ele);
        });
      }

      for (let j = 0; j <= max && min != max; j++) {
        let currProperties = data[i][j]?.properties;
        if (currProperties) {
          let colorPos = this.getPos(currProperties, "*", 1);
          let fontColor = currProperties?.slice(colorPos[0] + 1, colorPos[1]);

          let fontStylePos = this.getPos(currProperties, "*", 2);
          let fontStyle = currProperties?.slice(
            fontStylePos[0] + 1,
            fontStylePos[1]
          );

          let fontWeightPos = this.getPos(currProperties, "*", 3);
          let fontWeight = currProperties?.slice(
            fontWeightPos[0] + 1,
            fontWeightPos[1]
          );

          let fontSizePos = this.getPos(currProperties, "*", 4);
          let fontSize =
            currProperties?.slice(fontSizePos[0] + 1, fontSizePos[1]) || "12pt";

          let fontFamPos = this.getPos(currProperties, "*", 5);
          let fontFam =
            currProperties?.slice(fontFamPos[0] + 1, fontFamPos[1]) ||
            "calibri";

          this.mainCtx.save();
          this.mainCtx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFam}`;
          this.mainCtx.fillStyle = fontColor;
          this.mainCtx.fillText(
            data[i][j]?.data,
            cellPositionX + 4,
            cellPositionY - 4
          );
          this.mainCtx.clip();
          this.mainCtx.restore();
        }
        cellPositionX += this.getCurCellWidth(j);
      }
      i++;
    });
  }

  getPos(str = "", subStr, i) {
    return [
      str.split(subStr, i).join(subStr).length,
      str.split(subStr, i + 1).join(subStr).length,
    ];
  }

  drawRows() {
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCurCellHeight(i);
      this.mainCtx.beginPath();
      this.mainCtx.save();
      this.mainCtx.moveTo(0, cellPosition + 0.5);
      this.mainCtx.lineTo(this.mainCtx.canvas.width, cellPosition + 0.5);
      this.mainCtx.lineWidth = 0.2;
      this.mainCtx.strokeStyle = this.gridStrokeColor;
      this.mainCtx.stroke();
      this.mainCtx.restore();
    }
  }

  trimData(data, i) {
    let cellwidth = this.getCurCellWidth(i);
    let textWidth = this.mainCtx.measureText(data).width;
  }

  drawColumns() {
    let cellPosition = 0;
    for (let i = 0; i <= this.numCols; i++) {
      cellPosition += this.getCurCellWidth(i);
      this.mainCtx.beginPath();
      this.mainCtx.moveTo(cellPosition + 0.5, 0);
      this.mainCtx.lineTo(cellPosition + 0.5, this.mainCtx.canvas.height);
      this.mainCtx.lineWidth = 0.2;
      this.mainCtx.strokeStyle = this.gridStrokeColor;
      this.mainCtx.stroke();
    }
  }

  renderTopHeader() {
    let cellPosition = 0;
    this.topHeaderCtx.font = "11pt Arial";
    this.topHeaderCtx.textAlign = "center";
    for (let i = 0; i <= this.numCols; i++) {
      cellPosition += this.getCurCellWidth(i);
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.moveTo(cellPosition + 0.5, 0);
      this.topHeaderCtx.lineTo(
        cellPosition + 0.5,
        this.topHeaderCtx.canvas.height
      );

      if (
        this.topheaderSelected &&
        this.currSelectedCol[0] <= i &&
        i < this.currSelectedCol[1]
      ) {
        this.topHeaderCtx.strokeStyle = this.whiteColor;
        this.topHeaderCtx.lineWidth = 1;
      } else {
        this.topHeaderCtx.lineWidth = 0.2;
        this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
      }
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();

      this.topHeaderCtx.save();
      let text = this.convertNumToChar(i + 1);
      let xPosition = cellPosition - this.getCurCellWidth(i) / 2;
      let yPosition = 15;

      this.topHeaderCtx.fillStyle = this.gridStrokeColor;
      if (Array.isArray(this.currSelectedCol)) {
        if (
          this.topheaderSelected &&
          this.currSelectedCol[0] <= i &&
          i <= this.currSelectedCol[1]
        ) {
          this.topHeaderCtx.font = "bold 16px Arial";
          this.topHeaderCtx.fillStyle = this.whiteColor;
        } else if (
          this.currSelectedCol[0] <= i &&
          i <= this.currSelectedCol[1]
        ) {
          this.topHeaderCtx.fillStyle = this.strokeColor;
        }
      } else if (this.currSelectedCol == i) {
        this.topHeaderCtx.fillStyle = this.whiteColor;
        this.topHeaderCtx.font = "bold 16px Arial";
      } else if (this.currSelectedCol == "all") {
        this.topHeaderCtx.fillStyle = this.strokeColor;
      } else {
        this.topHeaderCtx.fillStyle = this.gridStrokeColor;
      }
      this.topHeaderCtx.fillText(text, xPosition, yPosition + 1);
      this.topHeaderCtx.restore();

      if (
        i == this.columnIndex2 &&
        cellPosition - this.columnLeftOfDrag >= 20
      ) {
        this.resizeLineVertical.style.top = 0;
        this.resizeLineVertical.style.left = `${cellPosition}px`;
      }
    }

    this.topHeaderCtx.save();
    this.topHeaderCtx.beginPath();

    this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.topHeaderCtx.moveTo(0, 24 - 0.5);
    this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24 - 0.5);
    this.topHeaderCtx.stroke();
    this.topHeaderCtx.restore();

    // this.currSelectedCol = null;
  }

  renderLeftHeader() {
    let cellPosition = 0;
    this.leftHeaderCtx.font = "14px Arial";
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCurCellHeight(i);
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(2, cellPosition + 0.5);
      this.leftHeaderCtx.lineTo(
        this.leftHeaderCtx.canvas.width,
        cellPosition + 0.5
      );

      if (
        this.leftheaderSelected &&
        this.currSelectedRow[0] <= i &&
        i < this.currSelectedRow[1]
      ) {
        this.leftHeaderCtx.lineWidth = 1;
        this.leftHeaderCtx.strokeStyle = this.whiteColor;
      } else {
        this.leftHeaderCtx.lineWidth = 0.2;
        this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
      }

      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();

      this.leftHeaderCtx.save();
      let text = (i + 1).toString();
      let textWidth = this.leftHeaderCtx.measureText(text).width;
      let xPosition = this.leftHeaderCtx.canvas.width - textWidth - 10;
      // let xPosition = this.leftHeaderCtx.canvas.width - 10;
      let yPosition = cellPosition - this.getCurCellHeight(i) / 2;

      this.leftHeaderCtx.fillStyle = this.gridStrokeColor;
      if (Array.isArray(this.currSelectedRow)) {
        if (
          this.leftheaderSelected &&
          this.currSelectedRow[0] <= i &&
          i <= this.currSelectedRow[1]
        ) {
          this.leftHeaderCtx.font = "bold 14px Arial";
          this.leftHeaderCtx.fillStyle = this.whiteColor;
        } else if (
          this.currSelectedRow[0] <= i &&
          i <= this.currSelectedRow[1]
        ) {
          this.leftHeaderCtx.fillStyle = this.strokeColor;
        }
      } else if (this.currSelectedRow == i) {
        this.leftHeaderCtx.font = "bold 14px Arial";
        this.leftHeaderCtx.fillStyle = this.whiteColor;
      } else if (this.currSelectedRow == "all") {
        this.leftHeaderCtx.fillStyle = this.strokeColor;
      } else {
        this.leftHeaderCtx.fillStyle = this.blackColor;
      }
      this.leftHeaderCtx.fillText(text, xPosition, yPosition + 4);
      this.leftHeaderCtx.restore();

      if (i == this.rowIndex2 && cellPosition - this.rowTopOfDrag > 10) {
        this.resizeLineHorizontal.style.top = `${cellPosition}px`;
        this.resizeLineHorizontal.style.left = 0;
      }
    }

    this.leftHeaderCtx.save();
    this.leftHeaderCtx.beginPath();
    this.leftHeaderCtx.moveTo(40 - 0.5, 0);
    this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
    this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.leftHeaderCtx.stroke();
    this.leftHeaderCtx.restore();

    // this.currSelectedRow = null;
  }

  //----------------------Scroll Functionality----------------------
  scrollFunction() {
    const main = document.getElementById("main");
    const topHeader = document.getElementById("topHeader");
    const leftHeader = document.getElementById("leftHeader");
    main.addEventListener("scroll", () => {
      topHeader.style.left = `-${main.scrollLeft}px`;
      leftHeader.style.top = `-${main.scrollTop}px`;
    });
  }

  //----------------------keyboard Evenets----------------------
  keyBoardEvents(e) {
    let flag = false;
    this.alreadyCopy = 0;
    let startX, startY, endX, endY;
    if ((e.ctrlKey && e.key === "c") || (e.ctrlKey && e.key === "C")) {
      this.marchingAntsCoordinates = this.selectedDimensionsMain;

      if (this.isColSelected) {
        this.animateFullRow = false;
        this.animateFullColumn = true;
      } else if (this.isRowSelected) {
        this.animateFullRow = true;
        this.animateFullColumn = false;
      } else {
        this.animateFullRow = false;
        this.animateFullColumn = false;
      }
      if (this.isAnimationRunning) {
        this.alreadyCopy = 1;
      }
      cancelAnimationFrame(this.animationFrameId);
      this.isAnimationRunning = true;
      this.startMarchingAntsAnimation();
      this.copyToClipboard();
    } else if (e.shiftKey) {
      this.inputBox.style.display = "none";
      if (e.key === "ArrowDown") {
        this.y2CellIndex = Math.max(0, this.y2CellIndex + 1);
      } else if (e.key === "ArrowRight") {
        this.x2CellIndex = Math.max(0, this.x2CellIndex + 1);
      } else if (e.key === "ArrowUp") {
        this.y2CellIndex = Math.max(0, this.y2CellIndex - 1);
      } else if (e.key === "ArrowLeft") {
        this.x2CellIndex = Math.max(0, this.x2CellIndex - 1);
      } else {
        this.x2CellIndex = this.x1CellIndex;
        this.y2CellIndex = this.y1CellIndex;
        return;
      }
      flag = true;
      startX = Math.min(this.x1CellIndex, this.x2CellIndex);
      endX = Math.max(this.x1CellIndex, this.x2CellIndex);
      startY = Math.min(this.y1CellIndex, this.y2CellIndex);
      endY = Math.max(this.y1CellIndex, this.y2CellIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    } else if (e.key == "Enter" || e.key == "ArrowDown") {
      this.cellPositionTop += this.getCurCellHeight(this.y1CellIndex);
      this.y1CellIndex = this.y1CellIndex + 1;
    } else if (e.key == "ArrowUp" && this.y1CellIndex >= 1) {
      this.cellPositionTop -= this.getCurCellHeight(this.y1CellIndex - 1);
      this.y1CellIndex = this.y1CellIndex - 1;
    } else if (e.key == "Tab" || e.key == "ArrowRight") {
      this.cellPositionLeft += this.getCurCellWidth(this.x1CellIndex);
      this.x1CellIndex = this.x1CellIndex + 1;
    } else if (e.key == "ArrowLeft" && this.x1CellIndex >= 1) {
      this.cellPositionLeft -= this.getCurCellWidth(this.x1CellIndex - 1);
      this.x1CellIndex = this.x1CellIndex - 1;
    } else if (
      (e.key >= "a" && e.key <= "z") ||
      (e.key >= "0" && e.key <= "9") ||
      e.key == "Backspace" ||
      e.key == " "
    ) {
      if (e.key == " ") e.preventDefault();
      flag = true;
      this.isAnimationRunning = false;
      this.inputBoxPosition();
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
      this.inputBox.focus();
    }

    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Tab" ||
      e.key == "ArrowRight" ||
      e.key == "ArrowLeft"
    ) {
      this.inputBox.style.display = "none";
      this.topheaderSelected = false;
      this.leftheaderSelected = false;
      this.isColSelected = false;
      this.isRowSelected = false;
    }

    if (!e.ctrlKey && flag == false) {
      e.preventDefault();
      this.inputBox.blur();
      this.selectedDimensionsMain = [
        this.x1CellIndex,
        this.y1CellIndex,
        this.x1CellIndex,
        this.y1CellIndex,
      ];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.renderTopHeader();
      this.renderLeftHeader();
    }

    if (!e.shiftKey && !e.ctrlKey) {
      // this.inputBoxPosition();
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    }
  }

  //----------------------Marching Ant Animation----------------------
  copyToClipboard = () => {
    console.log("copy");
    const [startX, startY, endX, endY] = this.marchingAntsCoordinates;

    let textTocopy = "";
    for (let j = startY; j <=endY; j++) {
      const result = this.sheetData.find((item) => item[j]);
      let temp = "";
      
      for (let i = startX; i <=endX; i++) {
        let currentData = "";
        if (result[j][i]) {
          currentData = result[j][i];
        }
        temp = temp + "	" + (currentData.data || "");

      }
      textTocopy += temp.slice(1);
      textTocopy += "\n"
    }
    console.log(textTocopy);
    navigator.clipboard.writeText(textTocopy);
    window.alert("Copied to Clipboard");
  };

  startMarchingAntsAnimation() {
    if (this.isAnimationRunning == true) {
      const [startX, startY, endX, endY] = this.marchingAntsCoordinates;
      let x = 0;
      let y = 0;
      let width = 0;
      let height = 0;

      for (let i = 0; i < startX; i++) {
        x += this.getCurCellWidth(i);
      }
      for (let i = 0; i < startY; i++) {
        y += this.getCurCellHeight(i);
      }
      for (let i = startX; i <= endX; i++) {
        width += this.getCurCellWidth(i);
      }
      for (let i = startY; i <= endY; i++) {
        height += this.getCurCellHeight(i);
      }

      if (this.animateFullColumn) {
        y = 0;
        height = this.mainCtx.canvas.height;
      }
      if (this.animateFullRow) {
        x = 0;
        width = this.mainCtx.canvas.width;
      }

      // this.lineDashOffset = this.lineDashOffset - 0.2;
      this.lineDashOffset = this.lineDashOffset - 0.2;

      if (this.lineDashOffset < 0) {
        this.lineDashOffset = 8;
      }

      // this.clearCanvas();
      this.mainCtx.save();
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearLeftHeader();
      this.clearTopheader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();

      this.mainCtx.beginPath();
      this.mainCtx.setLineDash([5, 3]);
      this.mainCtx.lineDashOffset = this.lineDashOffset;
      this.mainCtx.lineWidth = 2;
      this.mainCtx.strokeStyle = this.strokeColor;
      this.mainCtx.rect(x + 1, y + 1, width - 1, height - 1);
      this.mainCtx.stroke();
      this.mainCtx.restore();

      this.animationFrameId = requestAnimationFrame(() =>
        this.startMarchingAntsAnimation()
      );
    }
  }

  //----------------------Highlight Selected Area----------------------
  highlightSelectedArea() {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    const [startX, startY, endX, endY] = this.selectedDimensionsMain;

    const nameBoxInput = document.getElementById("nameBoxInput");
    let currentCell = `${this.convertNumToChar(startX + 1)}${startY + 1}`;
    nameBoxInput.value = currentCell;

    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCurCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCurCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCurCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCurCellHeight(i);
    }

    this.cellPositionLeft = 0;
    this.cellPositionTop = 0;

    if (this.isColSelected || this.isRowSelected) {
      this.x1CellIndex = startX;
      this.y1CellIndex = startY;
    }

    for (let i = 0; i < this.x1CellIndex; i++) {
      this.cellPositionLeft += this.getCurCellWidth(i);
    }
    for (let i = 0; i < this.y1CellIndex; i++) {
      this.cellPositionTop += this.getCurCellHeight(i);
    }
    this.mainCtx.save();

    this.mainCtx.fillStyle = this.areaHighlightColor;
    if (this.isColSelected) {
      this.currSelectedCol = [startX, endX];
      if (this.topheaderSelected && this.leftheaderSelected) {
        this.currSelectedRow = [0, 100];
      } else {
        this.currSelectedRow = "all";
      }
      this.mainCtx.fillRect(x, 0, width, this.mainCtx.canvas.height);
    } else if (this.isRowSelected) {
      this.currSelectedRow = [startY, endY];
      this.currSelectedCol = "all";
      this.mainCtx.fillRect(0, y, this.mainCtx.canvas.width, height);
    } else {
      this.currSelectedCol = [startX, endX];
      this.currSelectedRow = [startY, endY];
      this.mainCtx.fillRect(x, y, width, height);
    }

    if (this.isTopAreaSelected) {
      this.currSelectedCol = [startX, endX];
    }

    if (this.isLeftAreaSelected) {
      this.currSelectedRow = [startY, endY];
    }

    this.mainCtx.fillStyle = this.whiteColor;
    this.mainCtx.fillRect(
      this.cellPositionLeft,
      this.cellPositionTop,
      this.getCurCellWidth(this.x1CellIndex),
      this.getCurCellHeight(this.y1CellIndex)
    );

    this.mainCtx.lineWidth = 2;
    this.mainCtx.strokeStyle = this.strokeColor;
    if (this.isColSelected) {
      this.mainCtx.strokeRect(x - 1, -2, width + 3, this.mainCtx.canvas.height);
    } else if (this.isRowSelected) {
      this.mainCtx.strokeRect(-1, y - 1, this.mainCtx.canvas.width, height + 2);
    } else {
      this.mainCtx.strokeRect(x - 1, y - 1, width + 3, height + 3);
    }

    this.mainCtx.restore();

    this.headersHighlightCoordinate = [startX, startY, endX, endY];
  }

  highlightHeaders() {
    const [startX, startY, endX, endY] = this.headersHighlightCoordinate;
    this.topHeaderCtx.save();
    this.topHeaderCtx.beginPath();
    // this.topHeaderCtx.fillStyle = this.headerBgColor;
    // this.topHeaderCtx.fillRect(0, 0, this.topHeaderCtx.canvas.width, 24);
    this.topHeaderCtx.restore();
    this.leftHeaderCtx.save();
    this.leftHeaderCtx.beginPath();
    // this.leftHeaderCtx.fillStyle = this.headerBgColor;
    // this.leftHeaderCtx.fillRect(0, 0, 44, this.leftHeaderCtx.canvas.height);
    this.leftHeaderCtx.restore();

    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCurCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCurCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCurCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCurCellHeight(i);
    }

    if (this.isColSelected && this.isRowSelected) {
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.strokeColor;
      this.topHeaderCtx.fillRect(0, 0, this.topHeaderCtx.canvas.width, 24);
      this.topHeaderCtx.restore();
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.fillStyle = this.strokeColor;
      this.leftHeaderCtx.fillRect(0, 0, 44, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.restore();
    } else if (this.isColSelected) {
      //Top Header
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.strokeColor;
      this.topHeaderCtx.fillRect(
        x - 2,
        0,
        width + 4,
        this.topHeaderCtx.canvas.height
      );
      this.topHeaderCtx.restore();

      //left Header
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(40, 0);
      this.leftHeaderCtx.lineTo(40, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.fillStyle = this.headersHighlightColor;
      this.leftHeaderCtx.fillRect(0, 0, 44, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.lineWidth = 5;
      this.leftHeaderCtx.strokeStyle = this.strokeColor;
      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();
    } else if (this.isRowSelected) {
      //Left Header
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.fillStyle = this.strokeColor;
      this.leftHeaderCtx.fillRect(
        0,
        y - 2,
        this.leftHeaderCtx.canvas.width,
        height + 4
      );
      this.leftHeaderCtx.restore();

      //Top Header
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.moveTo(0, 24);
      this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24);
      this.topHeaderCtx.fillStyle = this.headersHighlightColor;
      this.topHeaderCtx.fillRect(0, 0, this.topHeaderCtx.canvas.width, 26);
      this.topHeaderCtx.lineWidth = 5;
      this.topHeaderCtx.strokeStyle = this.strokeColor;
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();
    } else {
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.headersHighlightColor;
      this.topHeaderCtx.fillRect(x, 0, width, 24);
      this.topHeaderCtx.moveTo(x - 2, 24);
      this.topHeaderCtx.lineTo(x + width + 2.5, 24);
      this.topHeaderCtx.lineWidth = 5;
      this.topHeaderCtx.strokeStyle = this.strokeColor;
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();

      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(40, y - 2);
      this.leftHeaderCtx.lineTo(40, y + height + 3);
      this.leftHeaderCtx.fillStyle = this.headersHighlightColor;
      this.leftHeaderCtx.fillRect(0, y, 40, height);
      this.leftHeaderCtx.lineWidth = 5;
      this.leftHeaderCtx.strokeStyle = this.strokeColor;
      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();
    }
  }

  highlightSelectedAreaEvents() {
    this.mainCtx.canvas.addEventListener("dblclick", (e) => {
      this.inputBoxPosition();
      this.inputBox.focus();
      this.isAnimationRunning = false;
      this.highlightSelectedArea();
      this.drawGrid();
      this.renderLeftHeader();
      this.renderTopHeader();
    });

    this.mainCtx.canvas.addEventListener("pointerdown", (e) => {
      this.highlightAreaPointerDown(e);
    });

    window.addEventListener("pointermove", (e) => {
      this.highlightAreaPointerMove(e);
    });

    window.addEventListener("pointerup", (e) => {
      this.highlightAreaPointerUp();
    });

    window.addEventListener("pointerleave", (e) => {
      this.highlightAreaPointerUp();
    });
  }

  highlightAreaPointerDown(e) {
    this.topheaderSelected = false;
    this.leftheaderSelected = false;
    this.inputBox.style.display = "none";
    this.isColSelected = false;
    this.isRowSelected = false;
    this.alreadyCopy = 0;

    const rect = this.mainCtx.canvas.getBoundingClientRect();
    this.isAreaSelected = true;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const colIndex = this.getCurColumnIndex(clickX);
    const rowIndex = this.getCurRowIndex(clickY);
    this.startingIndex = [
      this.getCurColumnIndex(clickX),
      this.getCurRowIndex(clickY),
    ];

    this.cellPositionLeft = 0;
    this.cellPositionTop = 0;
    this.x1CellIndex = this.getCurColumnIndex(clickX);
    this.y1CellIndex = this.getCurRowIndex(clickY);
    this.x2CellIndex = this.getCurColumnIndex(clickX);
    this.y2CellIndex = this.getCurRowIndex(clickY);

    for (let i = 0; i < this.x1CellIndex; i++) {
      this.cellPositionLeft += this.getCurCellWidth(i);
    }
    for (let i = 0; i < this.y1CellIndex; i++) {
      this.cellPositionTop += this.getCurCellHeight(i);
    }

    const startX = Math.min(this.startingIndex[0], colIndex);
    const startY = Math.min(this.startingIndex[1], rowIndex);
    const endX = Math.max(this.startingIndex[0], colIndex);
    const endY = Math.max(this.startingIndex[1], rowIndex);

    this.selectedDimensionsMain = [startX, startY, endX, endY];
    this.highlightSelectedArea();
    this.drawGrid();
    this.clearLeftHeader();
    this.clearTopheader();
    this.highlightHeaders();
    this.renderLeftHeader();
    this.renderTopHeader();
  }

  highlightAreaPointerMove(e) {
    if (this.isAreaSelected) {
      const rect = this.mainCtx.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const colIndex = this.getCurColumnIndex(clickX);
      const rowIndex = this.getCurRowIndex(clickY);

      // Determine dimensions of selection
      const startX = Math.max(0, Math.min(this.startingIndex[0], colIndex));
      const startY = Math.max(0, Math.min(this.startingIndex[1], rowIndex));
      const endX = Math.max(this.startingIndex[0], colIndex);
      const endY = Math.max(this.startingIndex[1], rowIndex);

      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.headersHighlightCoordinate = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.highlightHeaders();
      this.renderLeftHeader();
      this.renderTopHeader();
    }
  }

  highlightAreaPointerUp(e) {
    this.isAreaSelected = false;
  }

  //----------------------Resize Grid Columns and rows----------------------
  resizeGridEvents() {
    this.pointerDownHeader = this.mainCanvas;
    this.topHeaderCanvas.addEventListener("pointerdown", (e) => {
      this.pointerDownHeader = this.topHeaderCanvas;
      this.resizeGridPointerDown(e, this.topHeaderCanvas);
    });
    this.leftHeaderCanvas.addEventListener("pointerdown", (e) => {
      this.pointerDownHeader = this.leftHeaderCanvas;
      this.resizeGridPointerDown(e, this.leftHeaderCanvas);
    });
    window.addEventListener("pointermove", (e) => {
      let text = e.target.id;
      let result = text.replace(/-sheet-[0,100]/, "");
      if (result == "topHeader") {
        this.pointerDownHeader = this.topHeaderCanvas;
      } else if (result == "leftHeader") {
        this.pointerDownHeader = this.leftHeaderCanvas;
      }
      this.resizeGridPointerMove(e, this.pointerDownHeader);
    });
    window.addEventListener("pointerup", () => this.resizeGridPointerUp());
    window.addEventListener("pointerleave", () => this.resizeGridPointerUp());
  }

  resizeGridPointerDown(e, header) {
    this.inputBox.style.display = "none";

    if (this.isAnimationRunning) {
      this.alreadyCopy = 1;
    }

    let rect = header.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let columnIndex = this.getCurColumnIndex(clickX);
    let rowIndex = this.getCurRowIndex(clickY);

    let iscolPointDraggable = this.isColPointDraggable(clickX);
    let isrowPointDraggable = this.isRowPointDraggable(clickY);

    if (!iscolPointDraggable) {
      this.startingIndexTop = [
        this.getCurColumnIndex(clickX),
        this.getCurRowIndex(clickY),
      ];
    }

    if (!isrowPointDraggable) {
      this.startingIndexLeft = [
        this.getCurColumnIndex(clickX),
        this.getCurRowIndex(clickY),
      ];
    }

    let columnLeft = 0;
    let rowTop = 0;
    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getCurCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getCurCellHeight(i);
    }

    if (
      header == this.topHeaderCanvas &&
      rowIndex == 0 &&
      columnIndex !== -1 &&
      !iscolPointDraggable
    ) {
      this.clearTopheader();
      this.clearLeftHeader();
      this.isTopAreaSelected = true;
      this.topheaderSelected = true;
      this.alreadyCopy = 0;
      this.currSelectedCol = this.startingIndexTop[0];

      this.isColSelected = true;
      this.isRowSelected = false;
      this.currSelectedRow = "all";
      const startX = Math.min(this.startingIndexTop[0], columnIndex);
      const startY = Math.min(this.startingIndexTop[1], rowIndex);
      const endX = Math.max(this.startingIndexTop[0], columnIndex);
      const endY = Math.max(this.startingIndexTop[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();

      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    } else if (
      header == this.leftHeaderCanvas &&
      columnIndex == 0 &&
      rowIndex !== -1 &&
      !isrowPointDraggable
    ) {
      this.clearLeftHeader();
      this.clearTopheader();
      this.isLeftAreaSelected = true;
      this.leftheaderSelected = true;
      this.alreadyCopy = 0;
      this.currSelectedRow = this.startingIndexLeft[1];
      this.isRowSelected = true;
      this.isColSelected = false;
      this.currSelectedCol = "all";
      const startX = Math.min(this.startingIndexLeft[0], columnIndex);
      const startY = Math.min(this.startingIndexLeft[1], rowIndex);
      const endX = Math.max(this.startingIndexLeft[0], columnIndex);
      const endY = Math.max(this.startingIndexLeft[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();

      this.highlightHeaders();
      this.renderLeftHeader();
      this.renderTopHeader();
    }
    if (rowIndex == 0 && columnIndex !== -1 && iscolPointDraggable) {
      this.isDraggingTop = true;
      this.resizeColIndex = columnIndex;
      this.resizeColTop = clickX;
      this.resizeColWidth = this.getCurCellWidth(columnIndex);
    }

    if (columnIndex == 0 && rowIndex !== -1 && isrowPointDraggable) {
      this.isDraggingLeft = true;
      this.resizeRowIndex = rowIndex;
      this.resizeRowTop = clickY;
      this.resizeRowHeight = this.getCurCellHeight(rowIndex);
    }

    this.rowIndex2 = this.getCurRowIndex(clickY - 5);
    this.columnIndex2 = this.getCurColumnIndex(clickX - 10);
    let width = this.getCurCellWidth(this.columnIndex2);
    let height = this.getCurCellHeight(this.rowIndex2);

    if (header == this.topHeaderCanvas && iscolPointDraggable) {
      this.mainCtx.beginPath();
      this.mainCtx.save();
      this.mainCtx.lineWidth = 2;
      this.mainCtx.strokeStyle = this.strokeColor;
      this.columnLeftOfDrag = columnLeft;
      this.mainCtx.strokeRect(
        columnLeft,
        -1,
        width,
        this.mainCtx.canvas.height
      );
      this.mainCtx.restore();
    }

    if (header == this.leftHeaderCanvas && isrowPointDraggable) {
      this.rowTopOfDrag = rowTop;
      this.mainCtx.beginPath();
      this.mainCtx.save();
      this.mainCtx.lineWidth = 2;
      this.mainCtx.strokeStyle = this.strokeColor;
      this.mainCtx.strokeRect(-1, rowTop, this.mainCtx.canvas.width, height);
      this.mainCtx.restore();
    }
  }

  resizeGridPointerMove(e, header) {
    this.resizeLineVertical = document.getElementById("resizeLineVertical");
    this.resizeLineHorizontal = document.getElementById("resizeLineHorizontal");

    let rect = header.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let columnIndex = this.getCurColumnIndex(clickX);
    let rowIndex = this.getCurRowIndex(clickY);
    let iscolPointDraggable = this.isColPointDraggable(clickX);
    let isrowPointDraggable = this.isRowPointDraggable(clickY);

    if (
      // rowIndex == 0 && columnIndex !== -1 &&
      iscolPointDraggable
    ) {
      this.topHeaderCanvas.style.cursor = "ew-resize";
    } else {
      this.topHeaderCanvas.style.cursor = "pointer";
    }

    if (
      // columnIndex == 0 && rowIndex !== -1 &&
      isrowPointDraggable
    ) {
      this.leftHeaderCanvas.style.cursor = "ns-resize";
    } else {
      this.leftHeaderCanvas.style.cursor = "pointer";
    }

    if (this.isDraggingTop) {
      this.columnIndex2 = this.getCurColumnIndex(clickX - 10);
      this.clearTopheader();
      this.clearLeftHeader();
      this.highlightHeaders();
      this.topHeaderCanvas.style.cursor = "ew-resize";
      this.mainCanvas.style.cursor = "ew-resize";
      this.resizeLineVertical.style.cursor = "ew-resize";
      const deltaX = clickX - this.resizeColTop;
      this.newWidth = Math.max(20, this.resizeColWidth + deltaX);
      this.cellWidths.set(this.resizeColIndex, this.newWidth);

      if (Array.isArray(this.currSelectedCol) && this.topheaderSelected) {
        this.colFlag = true;
      }

      if (!this.isColSelected) {
        cancelAnimationFrame(this.animationFrameId);
        this.startMarchingAntsAnimation();
      }

      this.resizeLineVertical.style.display = "block";
      this.resizeLineVertical.style.height = `${this.mainCtx.canvas.height}px`;

      this.renderTopHeader();
      this.renderLeftHeader();
    } else if (this.isTopAreaSelected) {
      this.topHeaderCanvas.style.cursor = "pointer";
      const startX = Math.min(this.startingIndexTop[0], columnIndex);
      const startY = Math.min(this.startingIndexTop[1], rowIndex);
      const endX = Math.max(this.startingIndexTop[0], columnIndex);
      const endY = Math.max(this.startingIndexTop[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    }

    if (this.isDraggingLeft) {
      this.rowIndex2 = this.getCurRowIndex(clickY - 5);

      this.clearLeftHeader();
      this.clearTopheader();
      this.highlightHeaders();
      this.leftHeaderCanvas.style.cursor = "ns-resize";
      this.resizeLineHorizontal.style.cursor = "ns-resize";

      const deltaY = clickY - this.resizeRowTop;
      this.newHeight = Math.max(10, this.resizeRowHeight + deltaY);

      this.cellHeight.set(this.resizeRowIndex, this.newHeight);
      if (Array.isArray(this.currSelectedRow) && this.leftheaderSelected) {
        this.rowFlag = true;
      }

      if (!this.isRowSelected) {
        cancelAnimationFrame(this.animationFrameId);
        this.startMarchingAntsAnimation();
      }

      this.resizeLineHorizontal.style.display = "block";
      this.resizeLineHorizontal.style.width = `${this.mainCtx.canvas.width}px`;

      this.renderLeftHeader();
      this.renderTopHeader();
    } else if (this.isLeftAreaSelected) {
      this.leftHeaderCanvas.style.cursor = "pointer";
      const startX = Math.min(this.startingIndexLeft[0], columnIndex);
      const startY = Math.min(this.startingIndexLeft[1], rowIndex);
      const endX = Math.max(this.startingIndexLeft[0], columnIndex);
      const endY = Math.max(this.startingIndexLeft[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    }
  }

  resizeGridPointerUp() {
    this.mainCanvas.style.cursor = "cell";
    this.resizeLineHorizontal.style.display = "none";
    this.resizeLineVertical.style.display = "none";
    if (
      this.topheaderSelected &&
      this.colFlag &&
      this.columnIndex2 >= this.currSelectedCol[0] &&
      this.columnIndex2 <= this.currSelectedCol[1]
    ) {
      this.colFlag = false;
      for (let i = this.currSelectedCol[0]; i <= this.currSelectedCol[1]; i++) {
        this.cellWidths.set(i, this.newWidth);
      }
    }

    if (
      this.rowFlag &&
      this.rowIndex2 >= this.currSelectedRow[0] &&
      this.rowIndex2 <= this.currSelectedRow[1]
    ) {
      for (let i = this.currSelectedRow[0]; i <= this.currSelectedRow[1]; i++) {
        this.cellHeight.set(i, this.newHeight);
      }
      this.rowFlag = false;
    }

    this.isTopAreaSelected = false;
    this.isLeftAreaSelected = false;

    if (this.isDraggingTop) {
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();

      this.isDraggingTop = false;
      this.resizeColIndex = -1;
    }
    if (this.isDraggingLeft) {
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearLeftHeader();
      this.clearTopheader();
      this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
      this.isDraggingLeft = false;
      this.resizeRowIndex = -1;
    }
  }

  //----------------------Get Calculated Values----------------------
  getCurColumnIndex(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numCols; i++) {
      if (
        x >= cellPosition - 10 &&
        x <= cellPosition + this.getCurCellWidth(i) + 10
      ) {
        return i;
      }
      cellPosition += this.getCurCellWidth(i);
    }
    return -1;
  }

  getCurRowIndex(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      if (
        x >= cellPosition - 5 &&
        x <= cellPosition + this.getCurCellHeight(i) + 5
      ) {
        return i;
      }
      cellPosition += this.getCurCellHeight(i);
    }
    return -1;
  }

  isColPointDraggable(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numCols; i++) {
      if (
        x >= cellPosition + 10 &&
        x <= cellPosition + this.getCurCellWidth(i) - 10
      ) {
        return false;
      }
      cellPosition += this.getCurCellWidth(i);
    }
    return true;
  }

  isRowPointDraggable(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      if (
        x >= cellPosition + 5 &&
        x <= cellPosition + this.getCurCellHeight(i) - 5
      ) {
        return false;
      }
      cellPosition += this.getCurCellHeight(i);
    }
    return true;
  }

  getCurCellWidth(i) {
    return this.cellWidths.get(i) || this.defaultCellWidth;
  }

  getCurCellHeight(i) {
    return this.cellHeight.get(i) || this.defaultCellHeight;
  }

  convertNumToChar(columnNumber) {
    let res = "";
    while (columnNumber > 0) {
      let r = columnNumber % 26;
      let q = parseInt(columnNumber / 26);
      if (r === 0) {
        r = 26;
        q--;
      }

      res = String.fromCharCode(64 + r) + res;
      columnNumber = q;
    }
    return res;
  }
}

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

const main = document.querySelectorAll("#main canvas");

let current = "sheet-1";
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
