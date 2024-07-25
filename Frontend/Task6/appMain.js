class newCanvas {
  constructor(sheetName) {
    this.sheetName = sheetName;

    this.cellHeight = new Map();
    this.cellWidths = new Map();

    this.createNewCanvas();
    this.initialVariables();

    this.selection = false;

    this.copy = false;

    //copy animation

    this.inputBox = document.getElementById("canvasinput");

    this.cellPositionLeft = 0;
    this.cellPositionTop = 0;

    this.currentX;
    this.currentY;

    this.mainCtx.canvas.addEventListener("dblclick", (e) => {
      this.inputBox.style.display = "block";
      this.inputBox.style.top = `${this.cellPositionTop - 1}px`;
      this.inputBox.style.left = `${this.cellPositionLeft - 1}px`;
      this.inputBox.style.height = `${
        this.getCellHeight(this.y1CellIndex) + 3
      }px`;
      this.inputBox.style.width = `${
        this.getCellWidth(this.x1CellIndex) + 3
      }px`;
      this.inputBox.focus();
    });

    document.addEventListener("keydown", (event) => {
      this.keyBoardEvents(event);
    });

    this.highlightSelectedAreaEvents();
    this.scrollFunction();
    this.Resize();

    this.startingIndex = null;
    this.startingIndexTop = null;
    this.startingIndexLeft = null;

    this.highlightSelectedArea();
    this.inputBox.style.display = "block";
    this.inputBox.style.display = "block";
    this.inputBox.style.top = `${this.cellPositionTop - 1}px`;
    0;
    this.inputBox.style.left = `${this.cellPositionLeft - 1}px`;
    this.inputBox.style.height = `${
      this.getCellHeight(this.y1CellIndex) + 3
    }px`;
    this.inputBox.style.width = `${this.getCellWidth(this.x1CellIndex) + 3}px`;
  }

  initialVariables() {
    //height and width of cell
    this.defaultCellHeight = 21;
    this.defaultCellWidth = 100;

    //initial number of rows and cols
    this.numRows = 100;
    this.numCols = 26;

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

    //coordinated for highlight selected area [startX,startY,endX,endY]
    this.selectedDimensionsMain = [0, 0, 0, 0];
    this.selectedTopHeaderCoordinates = [0, 0, 0, 0];
    this.selectedLeftHeaderCoordinates = [0, 0, 0, 0];

    //Marching Ants Animation variables
    this.marchingAntsCoordinates = null;
    this.lineDashOffset = 0;
    this.isAnimationRunning = false;
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
      cellPosition += this.getCellHeight(i);
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
      cellPosition += this.getCellWidth(i);
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
      cellPosition += this.getCellWidth(i);
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
      let text = this.convertToTitle(i + 1);
      let xPosition = cellPosition - this.getCellWidth(i) / 2;
      let yPosition = 15;

      if (Array.isArray(this.currSelectedCol)) {
        if (this.currSelectedCol[0] <= i && i <= this.currSelectedCol[1]) {
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
    this.leftHeaderCtx.fillStyle = this.blackColor;
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCellHeight(i);
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
      let yPosition = cellPosition - this.getCellHeight(i) / 2;

      if (Array.isArray(this.currSelectedRow)) {
        if (this.currSelectedRow[0] <= i && i <= this.currSelectedRow[1]) {
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
    if (e.ctrlKey && e.key === "c") {
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
      this.cellPositionTop += this.getCellHeight(this.y1CellIndex);
      this.y1CellIndex = this.y1CellIndex + 1;
    } else if (e.key == "ArrowUp" && this.y1CellIndex >= 1) {
      this.cellPositionTop -= this.getCellHeight(this.y1CellIndex - 1);
      this.y1CellIndex = this.y1CellIndex - 1;
    } else if (e.key == "Tab" || e.key == "ArrowRight") {
      this.cellPositionLeft += this.getCellWidth(this.x1CellIndex);
      this.x1CellIndex = this.x1CellIndex + 1;
    } else if (e.key == "ArrowLeft" && this.x1CellIndex >= 1) {
      this.cellPositionLeft -= this.getCellWidth(this.x1CellIndex - 1);
      this.x1CellIndex = this.x1CellIndex - 1;
    } else if (
      (e.key >= "a" && e.key <= "z") ||
      (e.key >= "0" && e.key <= "9") ||
      e.key == "Backspace" ||
      e.key == " "
    ) {
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
      this.inputBox.style.display = "block";
      this.inputBox.style.top = `${this.cellPositionTop - 1}px`;
      this.inputBox.style.left = `${this.cellPositionLeft - 1}px`;
      this.inputBox.style.height = `${
        this.getCellHeight(this.y1CellIndex) + 3
      }px`;
      this.inputBox.style.width = `${
        this.getCellWidth(this.x1CellIndex) + 3
      }px`;
      this.highlightSelectedArea();
    }
  }

  //----------------------Highlight Selected Area----------------------
  highlightSelectedArea() {
    this.clearCanvas();
    this.isColSelected = false;
    this.isRowSelected = false;
    const [startX, startY, endX, endY] = this.selectedDimensionsMain;
    this.currSelectedCol = [startX, endX];
    this.currSelectedRow = [startY, endY];

    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCellHeight(i);
    }

    this.cellPositionLeft = 0;
    this.cellPositionTop = 0;
    for (let i = 0; i < this.x1CellIndex; i++) {
      this.cellPositionLeft += this.getCellWidth(i);
    }
    for (let i = 0; i < this.y1CellIndex; i++) {
      this.cellPositionTop += this.getCellHeight(i);
    }

    this.mainCtx.fillStyle = this.areaHighlightColor;
    this.mainCtx.fillRect(x, y, width, height);

    this.mainCtx.fillStyle = this.whiteColor;
    this.mainCtx.fillRect(
      this.cellPositionLeft,
      this.cellPositionTop,
      this.getCellWidth(this.x1CellIndex),
      this.getCellHeight(this.y1CellIndex)
    );
    this.mainCtx.lineWidth = 2;
    this.mainCtx.strokeStyle = this.strokeColor;
    this.mainCtx.strokeRect(x - 1, y - 1, width + 3, height + 3);
    this.headersHighlightCoordinate = [x, y, width, height];

    if (
      !this.isAnimationRunning ||
      (this.isAnimationRunning && this.alreadyCopy == 1)
    ) {
      this.marchingAntsCoordinates = [x, y, width, height];
    }

    this.highlightHeaders();
  }

  highlightHeaders() {
    const [x, y, width, height] = this.headersHighlightCoordinate;
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

    this.drawGrid();
  }

  highlightSelectedColumn() {
    this.clearCanvas();
    const [startX, startY, endX, endY] = this.selectedTopHeaderCoordinates;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCellHeight(i);
    }

    this.mainCtx.save();
    this.mainCtx.beginPath();
    this.mainCtx.fillStyle = this.areaHighlightColor;
    this.mainCtx.fillRect(x, 0, width, this.mainCtx.canvas.height);
    this.mainCtx.lineWidth = 2;
    this.mainCtx.strokeStyle = this.strokeColor;
    this.mainCtx.strokeRect(x - 1, -1, width + 2, this.mainCtx.canvas.height);
    this.mainCtx.restore();

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
    this.drawGrid();
  }

  highlightSelectedRow() {
    this.clearCanvas();
    const [startX, startY, endX, endY] = this.selectedLeftHeaderCoordinates;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCellHeight(i);
    }

    this.mainCtx.save();
    this.mainCtx.beginPath();
    this.mainCtx.fillStyle = this.areaHighlightColor;
    this.mainCtx.fillRect(0, y, this.mainCtx.canvas.width, height);
    this.mainCtx.lineWidth = 2;
    this.mainCtx.strokeStyle = this.strokeColor;
    this.mainCtx.strokeRect(-1, y - 1, this.mainCtx.canvas.width, height + 2);
    // this.mainCtx.stroke();
    this.mainCtx.restore();

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
    this.drawGrid();
  }
  
  highlightSelectedAreaEvents() {
    this.mainCtx.canvas.addEventListener("dblclick", (e) => {
      this.isAnimationRunning = false;
      this.clearCanvas();
      this.drawGrid();
      this.highlightSelectedArea();
    });

    this.mainCtx.canvas.addEventListener("pointerdown", (e) => {
      this.inputBox.style.display = "none";
      this.alreadyCopy = 0;
      this.clearCanvas();
      this.drawGrid();

      const rect = this.mainCtx.canvas.getBoundingClientRect();
      this.selection = true;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const colIndex = this.getColumnIndex(clickX);
      const rowIndex = this.getRowIndex(clickY);
      this.startingIndex = [
        this.getColumnIndex(clickX),
        this.getRowIndex(clickY),
      ];

      this.cellPositionLeft = 0;
      this.cellPositionTop = 0;
      this.x1CellIndex = this.getColumnIndex(clickX);
      this.y1CellIndex = this.getRowIndex(clickY);
      this.x2CellIndex = this.getColumnIndex(clickX);
      this.y2CellIndex = this.getRowIndex(clickY);

      for (let i = 0; i < this.x1CellIndex; i++) {
        this.cellPositionLeft += this.getCellWidth(i);
      }
      for (let i = 0; i < this.y1CellIndex; i++) {
        this.cellPositionTop += this.getCellHeight(i);
      }

      const startX = Math.min(this.startingIndex[0], colIndex);
      const startY = Math.min(this.startingIndex[1], rowIndex);
      const endX = Math.max(this.startingIndex[0], colIndex);
      const endY = Math.max(this.startingIndex[1], rowIndex);

      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
    });

    this.mainCtx.canvas.addEventListener("pointermove", (e) => {
      if (this.selection) {
        const rect = this.mainCtx.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const colIndex = this.getColumnIndex(clickX);
        const rowIndex = this.getRowIndex(clickY);

        // Determine dimensions of selection
        const startX = Math.min(this.startingIndex[0], colIndex);
        const startY = Math.min(this.startingIndex[1], rowIndex);
        const endX = Math.max(this.startingIndex[0], colIndex);
        const endY = Math.max(this.startingIndex[1], rowIndex);

        this.selectedDimensionsMain = [startX, startY, endX, endY];
        this.highlightSelectedArea();
      }
    });

    this.mainCtx.canvas.addEventListener("pointerup", (e) => {
      this.selection = false;
    });

    this.mainCtx.canvas.addEventListener("pointerleave", (e) => {
      this.selection = false;
    });
  }

  //----------------------Marching Ant Animation----------------------
  startMarchingAntsAnimation() {
    const [x, y, width, height] = this.marchingAntsCoordinates;
    if (this.isAnimationRunning == false) {
      return;
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


  //25/07/2024
 

  //resize grid
  Resize() {
    this.topHeaderCanvas.addEventListener("pointerdown", (e) =>
      this.mouseDown(e, "topheader")
    );
    // window.addEventListener("pointermove", (e) =>
    //   this.mouseMove(e, "topheader")
    // );
    // window.addEventListener("pointerup", () => this.mouseUp());
    // window.addEventListener("pointerleave", (e) => this.mouseUp());

    this.leftHeaderCanvas.addEventListener("pointerdown", (e) =>
      this.mouseDown(e, "leftheader")
    );
    window.addEventListener("pointermove", (e) => {
      if (e.target.id === "leftHeader-canvas") {
        this.mouseMove(e, "leftheader");
      } else if (e.target.id == "topHeader-canvas") {
        this.mouseMove(e, "topheader");
      }
    });
    window.addEventListener("pointerup", () => this.mouseUp());
    window.addEventListener("pointerleave", () => this.mouseUp());
  }

  mouseDown(e, header) {
    this.inputBox.style.display = "none";
    this.clearCanvas();

    this.isAnimationRunning = false;
    this.drawGrid();
    let rect = null;
    if (header == "topheader") {
      rect = this.topHeaderCanvas.getBoundingClientRect();
      if (!this.isColSelected) {
        this.highlightSelectedArea();
      } else {
        this.currSelectedCol = this.startingIndexTop[0];
        this.isColSelected = true;
        this.currSelectedRow = "all";
        this.highlightSelectedColumn();
      }
    } else {
      rect = this.leftHeaderCanvas.getBoundingClientRect();
      if (!this.isRowSelected) {
        this.highlightSelectedArea();
      } else {
        this.currSelectedRow = this.startingIndexLeft[1];
        this.isRowSelected = true;
        this.currSelectedCol = "all";
        this.highlightSelectedRow();
      }
    }

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let columnIndex = this.getColumnIndex(clickX);
    let rowIndex = this.getRowIndex(clickY);

    let columnBool = this.getColumnBool(clickX);
    let rowBool = this.getRowBool(clickY);

    if (columnBool) {
      this.startingIndexTop = [
        this.getColumnIndex(clickX),
        this.getRowIndex(clickY),
      ];
    }

    if (rowBool) {
      this.startingIndexLeft = [
        this.getColumnIndex(clickX),
        this.getRowIndex(clickY),
      ];
    }

    let columnLeft = 0;
    let rowTop = 0;
    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getCellHeight(i);
    }

    if (
      header == "topheader" &&
      rowIndex == 0 &&
      columnIndex !== -1 &&
      // this.getCellWidth(columnIndex) + columnLeft - clickX > 10 &&
      columnBool
    ) {
      this.currSelectedCol = this.startingIndexTop[0];
      this.isColSelected = true;
      this.currSelectedRow = "all";
      const startX = Math.min(this.startingIndexTop[0], columnIndex);
      const startY = Math.min(this.startingIndexTop[1], rowIndex);
      const endX = Math.max(this.startingIndexTop[0], columnIndex);
      const endY = Math.max(this.startingIndexTop[1], rowIndex);
      this.selectedTopHeaderCoordinates = [startX, startY, endX, endY];
      this.highlightSelectedColumn();
    } else if (
      header == "leftheader" &&
      columnIndex == 0 &&
      rowIndex !== -1 &&
      // this.getCellHeight(rowIndex) + rowTop - clickY > 10 &&
      rowBool
    ) {
      this.currSelectedRow = this.startingIndexLeft[1];
      this.currSelectedCol = "all";
      this.isRowSelected = true;
      const startX = Math.min(this.startingIndexLeft[0], columnIndex);
      const startY = Math.min(this.startingIndexLeft[1], rowIndex);
      const endX = Math.max(this.startingIndexLeft[0], columnIndex);
      const endY = Math.max(this.startingIndexLeft[1], rowIndex);
      this.selectedLeftHeaderCoordinates = [startX, startY, endX, endY];
      this.highlightSelectedRow();
    }

    if (
      rowIndex == 0 &&
      columnIndex !== -1 &&
      // this.getCellWidth(columnIndex) + columnLeft - clickX < 10 &&
      !columnBool
    ) {
      this.currSelectedRow = this.startingIndexLeft[1];
      this.isDraggingTop = true;
      this.resizeColIndex = columnIndex;
      this.resizeColTop = clickX;
      this.resizeColWidth = this.getCellWidth(columnIndex);
    }

    if (
      columnIndex == 0 &&
      rowIndex !== -1 &&
      // this.getCellHeight(rowIndex) + rowTop - clickY < 5 &&
      !rowBool
    ) {
      this.currSelectedCol = this.startingIndexTop[0];
      this.isDraggingLeft = true;
      this.resizeRowIndex = rowIndex;
      this.resizeRowTop = clickY;
      this.resizeRowHeight = this.getCellHeight(rowIndex);
    }
  }

  mouseMove(e, header) {
    let rect = null;
    if (header == "topheader") {
      rect = this.topHeaderCanvas.getBoundingClientRect();
    } else {
      rect = this.leftHeaderCanvas.getBoundingClientRect();
    }
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let columnIndex = this.getColumnIndex(clickX);
    let rowIndex = this.getRowIndex(clickY);
    let columnBool = this.getColumnBool(clickX);
    let rowBool = this.getRowBool(clickY);
    let columnLeft = 0;
    let rowTop = 0;
    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getCellHeight(i);
    }

    if (
      rowIndex == 0 &&
      columnIndex !== -1 &&
      // this.getCellWidth(columnIndex) + columnLeft - clickX < 10 &&
      !columnBool
    ) {
      this.topHeaderCanvas.style.cursor = "col-resize";
    } else {
      this.topHeaderCanvas.style.cursor = "pointer";
    }

    if (
      columnIndex == 0 &&
      rowIndex !== -1 &&
      // this.getCellHeight(rowIndex) + rowTop - clickY < 5 &&
      !rowBool
    ) {
      this.leftHeaderCanvas.style.cursor = "row-resize";
    } else {
      this.leftHeaderCanvas.style.cursor = "default";
    }

    if (this.isDraggingTop) {
      // this.clearCanvas();
      this.topHeaderCanvas.style.cursor = "col-resize";
      const deltaX = clickX - this.resizeColTop;
      const newWidth = Math.max(20, this.resizeColWidth + deltaX);
      this.cellWidths.set(this.resizeColIndex, newWidth);

      if (this.isColSelected) {
        this.currSelectedCol = this.startingIndexTop[0];
        this.isColSelected = true;
        this.currSelectedRow = "all";
        // const startX = Math.min(this.startingIndexTop[0], columnIndex);
        // const startY = Math.min(this.startingIndexTop[1], rowIndex);
        const startX = this.startingIndexTop[0];
        const startY = this.startingIndexTop[1];
        // const endX = Math.max(this.startingIndexTop[0], columnIndex );
        // const endY = Math.max(this.startingIndexTop[1], rowIndex);
        this.selectedTopHeaderCoordinates = [startX, startY, startX, startY];
        this.highlightSelectedColumn();
      } else {
        // this.clearCanvas();
        this.drawGrid();
        this.highlightSelectedArea();
        this.startMarchingAntsAnimation();
      }
    }

    if (this.isDraggingLeft) {
      // this.clearCanvas();
      this.leftHeaderCanvas.style.cursor = "row-resize";
      const deltaY = clickY - this.resizeRowTop;
      console.log(this.startY);
      const newHeight = Math.max(0, this.resizeRowHeight + deltaY);
      this.cellHeight.set(this.resizeRowIndex, newHeight);

      if (this.isRowSelected) {
        this.currSelectedRow = this.startingIndexLeft[1];
        this.isRowSelected = true;
        this.currSelectedCol = "all";
        // const startX = Math.min(this.startingIndexLeft[0], columnIndex);
        // const startY = Math.min(this.startingIndexLeft[1], rowIndex);
        const startX = this.startingIndexLeft[0];
        const startY = this.startingIndexLeft[1];
        // const endX = Math.max(this.startingIndexLeft[0], columnIndex);
        // const endY = Math.max(this.startingIndexLeft[1], rowIndex);
        this.selectedLeftHeaderCoordinates = [startX, startY, startX, startY];
        this.highlightSelectedRow();
      } else {
        // this.clearCanvas();
        this.drawGrid();
        this.highlightSelectedArea();
        this.startMarchingAntsAnimation();
      }
    }
  }

  mouseUp() {
    if (this.isDraggingTop) {
      this.isDraggingTop = false;
      this.resizeColIndex = -1;
    }
    if (this.isDraggingLeft) {
      this.isDraggingLeft = false;
      this.resizeRowIndex = -1;
    }
  }

  convertToTitle(columnNumber) {
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

  //get values
  getColumnIndex(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numCols; i++) {
      if (
        x >= cellPosition - 10 &&
        x <= cellPosition + this.getCellWidth(i) + 10
      ) {
        return i;
      }
      cellPosition += this.getCellWidth(i);
    }
    return -1;
  }

  getColumnBool(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numCols; i++) {
      if (
        x >= cellPosition + 10 &&
        x <= cellPosition + this.getCellWidth(i) - 10
      ) {
        return true;
      }
      cellPosition += this.getCellWidth(i);
    }
    return false;
  }

  getRowIndex(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      if (
        x >= cellPosition - 5 &&
        x <= cellPosition + this.getCellHeight(i) + 5
      ) {
        return i;
      }
      cellPosition += this.getCellHeight(i);
    }
    return -1;
  }

  getRowBool(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      if (
        x >= cellPosition + 5 &&
        x <= cellPosition + this.getCellHeight(i) - 5
      ) {
        return true;
      }
      cellPosition += this.getCellHeight(i);
    }
    return false;
  }

  getCellWidth(i) {
    return this.cellWidths.get(i) || this.defaultCellWidth;
  }

  getCellHeight(i) {
    return this.cellHeight.get(i) || this.defaultCellHeight;
  }
}

new newCanvas("Sheet-1");
//start
//1036
