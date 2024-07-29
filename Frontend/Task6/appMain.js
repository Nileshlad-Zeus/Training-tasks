class newCanvas {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.inputBox = document.getElementById("canvasinput");

    this.createNewCanvas();
    this.initialVariables();
    this.highlightSelectedAreaEvents();
    this.scrollFunction();
    this.resizeGridEvents();
    this.highlightSelectedArea();
    this.inputBoxPosition();
    let scroll = 21;
    document.addEventListener("keydown", (event) => {
      this.keyBoardEvents(event);
      // if (this.cellPositionTop > 600) {
      //   scroll=scroll + 21;
      //   const main = document.getElementById("main");
      //   const leftHeader = document.getElementById("leftHeader");
      //   main.style.top = `-${scroll}px`;
      //   leftHeader.style.top = `-${scroll}px`;
      // }
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

    //colors
    this.strokeColor = "rgb(16,124,65)";
    this.areaHighlightColor = "rgb(231,241,236)";
    this.headersHighlightColor = "rgb(202,234,216)";
    this.gridStrokeColor = "rgb(128, 128, 128)";
    this.blackColor = "rgb(0, 0, 0)";
    this.whiteColor = "rgb(255, 255, 255)";

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
  }

  createNewCanvas() {
    //sheet canvas
    const main = document.getElementById("main");
    const mainCanvas = document.createElement("canvas");
    mainCanvas.setAttribute("id", this.sheetName);
    mainCanvas.width = 2100;
    mainCanvas.height = 1200;
    main.appendChild(mainCanvas);
    this.mainCanvas = mainCanvas;
    this.mainCtx = this.mainCanvas.getContext("2d");

    //topheader canvas
    const topHeader = document.getElementById("topHeader");
    const topHeaderCanvas = document.createElement("canvas");
    topHeaderCanvas.setAttribute("id", "topHeader-canvas");
    topHeaderCanvas.width = 2100;
    topHeaderCanvas.height = 24;
    topHeader.appendChild(topHeaderCanvas);
    this.topHeaderCanvas = topHeaderCanvas;
    this.topHeaderCtx = this.topHeaderCanvas.getContext("2d");

    //leftheader canvas
    const leftHeader = document.getElementById("leftHeader");
    const leftHeaderCanvas = document.createElement("canvas");
    leftHeaderCanvas.setAttribute("id", "leftHeader-canvas");
    leftHeaderCanvas.width = 40;
    leftHeaderCanvas.height = 1200;
    leftHeader.appendChild(leftHeaderCanvas);
    this.leftHeaderCanvas = leftHeaderCanvas;
    this.leftHeaderCtx = this.leftHeaderCanvas.getContext("2d");

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

  inputBoxPosition() {
    this.inputBox.style.display = "block";
    this.inputBox.style.top = `${this.cellPositionTop - 1}px`;
    0;
    this.inputBox.style.left = `${this.cellPositionLeft - 1}px`;
    this.inputBox.style.height = `${
      this.getCurCellHeight(this.y1CellIndex) + 3
    }px`;
    this.inputBox.style.width = `${
      this.getCurCellWidth(this.x1CellIndex) + 3
    }px`;
  }

  //----------------------draw grid----------------------
  drawGrid() {
    this.drawRows();
    this.drawColumns();
    this.renderTopHeader();
    this.renderLeftHeader();
  }

  drawRows() {
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCurCellHeight(i);
      this.mainCtx.beginPath();
      this.mainCtx.moveTo(0, cellPosition + 0.5);
      this.mainCtx.lineTo(this.mainCtx.canvas.width, cellPosition + 0.5);
      this.mainCtx.lineWidth = 0.2;
      this.mainCtx.strokeStyle = this.gridStrokeColor;
      this.mainCtx.stroke();
    }
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
    this.topHeaderCtx.font = "16px Arial";
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
      this.topHeaderCtx.lineWidth = 0.2;
      this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();

      this.topHeaderCtx.save();
      let text = this.convertNumToChar(i + 1);
      let xPosition = cellPosition - this.getCurCellWidth(i) / 2;
      let yPosition = 15;

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
        this.topHeaderCtx.fillStyle = this.blackColor;
      }
      this.topHeaderCtx.fillText(text, xPosition, yPosition + 1);
      this.topHeaderCtx.restore();
    }

    this.topHeaderCtx.save();
    this.topHeaderCtx.beginPath();
    this.topHeaderCtx.moveTo(0, 24);
    this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24);
    this.topHeaderCtx.stroke();
    this.topHeaderCtx.restore();

    this.currSelectedCol = null;
  }

  renderLeftHeader() {
    let cellPosition = 0;
    this.leftHeaderCtx.font = "14px Arial";
    // this.leftHeaderCtx.fillStyle = this.blackColor;
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCurCellHeight(i);
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(2, cellPosition + 0.5);
      this.leftHeaderCtx.lineTo(
        this.leftHeaderCtx.canvas.width,
        cellPosition + 0.5
      );
      this.leftHeaderCtx.lineWidth = 0.2;
      this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();

      this.leftHeaderCtx.save();
      let text = (i + 1).toString();
      let textWidth = this.leftHeaderCtx.measureText(text).width;
      let xPosition = this.leftHeaderCtx.canvas.width - textWidth - 10;
      let yPosition = cellPosition - this.getCurCellHeight(i) / 2;

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
    }

    this.leftHeaderCtx.save();
    this.leftHeaderCtx.beginPath();
    this.leftHeaderCtx.moveTo(40, 0);
    this.leftHeaderCtx.lineTo(40, this.leftHeaderCtx.canvas.height);
    this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.leftHeaderCtx.stroke();
    this.leftHeaderCtx.restore();

    this.currSelectedRow = null;
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
    } else if (e.key == "Enter" || e.key == "ArrowDown") {
      this.isColSelected = false;
      this.isRowSelected = false;
      this.cellPositionTop += this.getCurCellHeight(this.y1CellIndex);
      this.y1CellIndex = this.y1CellIndex + 1;
    } else if (e.key == "ArrowUp" && this.y1CellIndex >= 1) {
      this.isColSelected = false;
      this.isRowSelected = false;
      this.cellPositionTop -= this.getCurCellHeight(this.y1CellIndex - 1);
      this.y1CellIndex = this.y1CellIndex - 1;
    } else if (e.key == "Tab" || e.key == "ArrowRight") {
      this.isColSelected = false;
      this.isRowSelected = false;
      this.cellPositionLeft += this.getCurCellWidth(this.x1CellIndex);
      this.x1CellIndex = this.x1CellIndex + 1;
    } else if (e.key == "ArrowLeft" && this.x1CellIndex >= 1) {
      this.isColSelected = false;
      this.isRowSelected = false;
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
      this.highlightSelectedArea();
      this.inputBox.focus();
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
    }

    if (!e.shiftKey && !e.ctrlKey) {
      this.inputBoxPosition();
      this.highlightSelectedArea();
    }
  }

  //----------------------Marching Ant Animation----------------------
  startMarchingAntsAnimation() {
    if (this.isAnimationRunning == false) {
      return;
    }

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

    this.lineDashOffset = this.lineDashOffset - 0.2;

    if (this.lineDashOffset < 0) {
      this.lineDashOffset = 8;
    }

    this.clearCanvas();
    this.mainCtx.save();
    this.highlightSelectedArea();
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

  //----------------------Highlight Selected Area----------------------
  highlightSelectedArea() {
    this.clearCanvas();
    const [startX, startY, endX, endY] = this.selectedDimensionsMain;

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

    this.mainCtx.fillStyle = this.areaHighlightColor;
    if (this.isColSelected) {
      this.currSelectedCol = [startX, endX];
      this.currSelectedRow = "all";
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
      this.mainCtx.strokeRect(x - 1, -1, width + 2, this.mainCtx.canvas.height);
    } else if (this.isRowSelected) {
      this.mainCtx.strokeRect(-1, y - 1, this.mainCtx.canvas.width, height + 2);
    } else {
      this.mainCtx.strokeRect(x - 1, y - 1, width + 3, height + 3);
    }

    this.headersHighlightCoordinate = [x, y, width, height];

    this.highlightHeaders();
  }

  highlightHeaders() {
    const [x, y, width, height] = this.headersHighlightCoordinate;
    if (this.isColSelected) {
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
      this.topHeaderCtx.moveTo(x - 2, 24);
      this.topHeaderCtx.lineTo(x + width + 2.5, 24);
      this.topHeaderCtx.fillStyle = this.headersHighlightColor;
      this.topHeaderCtx.fillRect(x, 0, width, 24);
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

    this.drawGrid();
  }

  highlightSelectedAreaEvents() {
    this.mainCtx.canvas.addEventListener("dblclick", (e) => {
      this.inputBoxPosition();
      this.inputBox.focus();
      this.isAnimationRunning = false;
      this.clearCanvas();
      this.drawGrid();
      this.highlightSelectedArea();
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
    this.clearCanvas();
    this.drawGrid();

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
  }

  highlightAreaPointerMove(e) {
    if (this.isAreaSelected) {
      const rect = this.mainCtx.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const colIndex = this.getCurColumnIndex(clickX);
      const rowIndex = this.getCurRowIndex(clickY);

      // Determine dimensions of selection
      const startX = Math.min(this.startingIndex[0], colIndex);
      const startY = Math.min(this.startingIndex[1], rowIndex);
      const endX = Math.max(this.startingIndex[0], colIndex);
      const endY = Math.max(this.startingIndex[1], rowIndex);

      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
    }
  }

  highlightAreaPointerUp(e) {
    this.isAreaSelected = false;
  }

  //----------------------Resize Grid Columns and rows----------------------
  resizeGridEvents() {
    this.topHeaderCanvas.addEventListener("pointerdown", (e) =>
      this.resizeGridPointerDown(e, this.topHeaderCanvas)
    );
    this.leftHeaderCanvas.addEventListener("pointerdown", (e) =>
      this.resizeGridPointerDown(e, this.leftHeaderCanvas)
    );
    window.addEventListener("pointermove", (e) => {
      this.resizeGridPointerMove(
        e,
        e.target.id === "leftHeader-canvas"
          ? this.leftHeaderCanvas
          : this.topHeaderCanvas
      );
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

    if (this.isRowSelected) {
      this.currSelectedRow = rowIndex;
      this.currSelectedCol = "all";
      this.highlightSelectedArea();
    }

    if (this.isColSelected) {
      // this.currSelectedCol = columnIndex;
      this.currSelectedRow = "all";
      this.highlightSelectedArea();
    }

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
    } else if (
      header == this.leftHeaderCanvas &&
      columnIndex == 0 &&
      rowIndex !== -1 &&
      !isrowPointDraggable
    ) {
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
    }

    if (rowIndex == 0 && columnIndex !== -1 && iscolPointDraggable) {
      this.currSelectedRow = this.startingIndexLeft[1];
      this.isDraggingTop = true;
      this.resizeColIndex = columnIndex;
      this.resizeColTop = clickX;
      this.resizeColWidth = this.getCurCellWidth(columnIndex);
    }

    if (columnIndex == 0 && rowIndex !== -1 && isrowPointDraggable) {
      this.currSelectedCol = this.startingIndexTop[0];
      this.isDraggingLeft = true;
      this.resizeRowIndex = rowIndex;
      this.resizeRowTop = clickY;
      this.resizeRowHeight = this.getCurCellHeight(rowIndex);
    }
  }

  resizeGridPointerMove(e, header) {
    let rect = header.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let columnIndex = this.getCurColumnIndex(clickX);
    let rowIndex = this.getCurRowIndex(clickY);
    let iscolPointDraggable = this.isColPointDraggable(clickX);
    let isrowPointDraggable = this.isRowPointDraggable(clickY);
    let columnLeft = 0;
    let rowTop = 0;
    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getCurCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getCurCellHeight(i);
    }

    if (rowIndex == 0 && columnIndex !== -1 && iscolPointDraggable) {
      this.topHeaderCanvas.style.cursor = "col-resize";
    } else {
      this.topHeaderCanvas.style.cursor = "pointer";
    }

    if (columnIndex == 0 && rowIndex !== -1 && isrowPointDraggable) {
      this.leftHeaderCanvas.style.cursor = "row-resize";
    } else {
      this.leftHeaderCanvas.style.cursor = "default";
    }

    if (this.isDraggingTop) {
      this.topHeaderCanvas.style.cursor = "col-resize";
      const deltaX = clickX - this.resizeColTop;
      const newWidth = Math.max(20, this.resizeColWidth + deltaX);
      this.cellWidths.set(this.resizeColIndex, newWidth);

      if (this.isColSelected && this.isTopAreaSelected) {
        this.currSelectedCol = this.startingIndexTop[0];
        this.currSelectedRow = "all";
        const startX = this.startingIndexTop[0];
        const startY = this.startingIndexTop[1];
        this.selectedDimensionsMain = [startX, startY, startX, startY];
        this.highlightSelectedArea();
      } else {
        this.drawGrid();
        this.highlightSelectedArea();
        cancelAnimationFrame(this.animationFrameId);
        this.startMarchingAntsAnimation();
      }
    } else if (this.isTopAreaSelected) {
      this.topHeaderCanvas.style.cursor = "pointer";
      const startX = Math.min(this.startingIndexTop[0], columnIndex);
      const startY = Math.min(this.startingIndexTop[1], rowIndex);
      const endX = Math.max(this.startingIndexTop[0], columnIndex);
      const endY = Math.max(this.startingIndexTop[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
    }

    if (this.isDraggingLeft) {
      this.leftHeaderCanvas.style.cursor = "row-resize";
      const deltaY = clickY - this.resizeRowTop;
      const newHeight = Math.max(0, this.resizeRowHeight + deltaY);
      this.cellHeight.set(this.resizeRowIndex, newHeight);

      if (this.isRowSelected && this.isLeftAreaSelected) {
        this.currSelectedRow = this.startingIndexLeft[1];
        this.currSelectedCol = "all";
        const startX = this.startingIndexLeft[0];
        const startY = this.startingIndexLeft[1];
        this.selectedDimensionsMain = [startX, startY, startX, startY];
        this.highlightSelectedArea();
      } else {
        this.drawGrid();
        this.highlightSelectedArea();
        cancelAnimationFrame(this.animationFrameId);
        this.startMarchingAntsAnimation();
      }
    } else if (this.isLeftAreaSelected) {
      this.leftHeaderCanvas.style.cursor = "pointer";
      const startX = Math.min(this.startingIndexLeft[0], columnIndex);
      const startY = Math.min(this.startingIndexLeft[1], rowIndex);
      const endX = Math.max(this.startingIndexLeft[0], columnIndex);
      const endY = Math.max(this.startingIndexLeft[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
    }
  }

  resizeGridPointerUp() {
    this.isTopAreaSelected = false;
    this.isLeftAreaSelected = false;
    if (this.isDraggingTop) {
      this.isDraggingTop = false;
      this.resizeColIndex = -1;
    }
    if (this.isDraggingLeft) {
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

new newCanvas("Sheet-1");
