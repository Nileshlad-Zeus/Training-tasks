class newCanvas {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.numRows = 100;
    this.numCols = 26;
    this.cellHeight = new Map();
    this.cellWidths = new Map();

    this.canvas = this.createNew();
    this.topHeader = this.createTopHeader();
    this.leftHeader = this.createLeftHeader();
    this.ctx = this.canvas.getContext("2d");
    this.ctxTopHeader = this.topHeader.getContext("2d");
    this.ctxLeftHeader = this.leftHeader.getContext("2d");
    this.selection = false;

    this.canvas.style.cursor = "cell";

    this.selectedCol = null;
    this.selectedRow = null;
    this.isColSelected = false;
    this.isRowSelected = false;

    this.copy = false;
    this.lineDashOffset = 0;
    this.isAnimationRunning = false;
    this.coordinate = null;

    this.inputBox = document.getElementById("canvasinput");

    this.x1 = 0;
    this.y1 = 0;
    this.x1Index = 0;
    this.y1Index = 0;

    this.currentX;
    this.currentY;

    this.ctx.canvas.addEventListener("dblclick", (e) => {
      this.inputBox.style.display = "block";
      this.inputBox.style.top = `${this.y1}px`;
      0;
      this.inputBox.style.left = `${this.x1}px`;
      this.inputBox.style.height = `${this.getCellHeight(this.y1Index)}px`;
      this.inputBox.style.width = `${this.getCellWidth(this.x1Index)}px`;
      this.inputBox.focus();
    });

    document.addEventListener("keydown", (event) => {
      this.KeyEvents(event);
    });

    this.isDraggingTop = false;
    this.draggingTop = -1;
    this.startX = 0;
    this.startWidth = 0;

    this.isDraggingLeft = false;
    this.draggingLeft = -1;
    this.startY = 0;
    this.startHeight = 0;
    this.drawgrid(this.numRows, this.numCols);
    this.highLightEvent();
    this.scroll();
    this.Resize();

    this.selectionDimensions = [0, 0, 0, 0];
    this.selectionDimensionsTop = [0, 0, 0, 0];
    this.selectionDimensionsLeft = [0, 0, 0, 0];

    this.startingIndex = null;
    this.startingIndexTop = null;
    this.startingIndexLeft = null;

    this.drawHighlight();
    this.inputBox.style.display = "block";
    this.inputBox.style.display = "block";
    this.inputBox.style.top = `${this.y1}px`;
    0;
    this.inputBox.style.left = `${this.x1}px`;
    this.inputBox.style.height = `${this.getCellHeight(this.y1Index)}px`;
    this.inputBox.style.width = `${this.getCellWidth(this.x1Index)}px`;
  }

  createNew() {
    const main = document.getElementById("main");
    const createCanva = document.createElement("canvas");
    createCanva.setAttribute("id", this.sheetName);
    createCanva.width = 2100;
    createCanva.height = 1200;
    main.appendChild(createCanva);
    return createCanva;
  }

  createTopHeader() {
    const topHeader = document.getElementById("topHeader");
    const createCanva = document.createElement("canvas");
    createCanva.setAttribute("id", "topHeader-canvas");
    createCanva.width = 2100;
    createCanva.height = 24;
    topHeader.appendChild(createCanva);
    return createCanva;
  }

  createLeftHeader() {
    const leftHeader = document.getElementById("leftHeader");
    const createCanva = document.createElement("canvas");
    createCanva.setAttribute("id", "leftHeader-canvas");
    createCanva.width = 40;
    createCanva.height = 1200;
    leftHeader.appendChild(createCanva);
    return createCanva;
  }

  scroll() {
    const main = document.getElementById("main");
    const topHeader = document.getElementById("topHeader");
    const leftHeader = document.getElementById("leftHeader");
    main.addEventListener("scroll", () => {
      topHeader.style.left = `-${main.scrollLeft}px`;
      leftHeader.style.top = `-${main.scrollTop}px`;
    });
  }

  clearCanvas() {
    this.ctx.transform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxTopHeader.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxLeftHeader.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  //draw grid
  KeyEvents(e) {
    let flag = false;
    let lowX, lowY, highX, highY;
    if (e.ctrlKey && e.key === "c") {
      this.isAnimationRunning = true;
      this.startMarchingAntsAnimation();
    } else if (e.shiftKey) {
      if (e.key === "ArrowDown") {
        this.y2Index = Math.max(0, this.y2Index + 1);
      } else if (e.key === "ArrowRight") {
        this.x2Index = Math.max(0, this.x2Index + 1);
      } else if (e.key === "ArrowUp") {
        this.y2Index = Math.max(0, this.y2Index - 1);
      } else if (e.key === "ArrowLeft") {
        this.x2Index = Math.max(0, this.x2Index - 1);
      } else {
        this.x2Index = this.x1Index;
        this.y2Index = this.y1Index;
        return;
      }
      flag = true;
      lowX = Math.min(this.x1Index, this.x2Index);
      highX = Math.max(this.x1Index, this.x2Index);
      lowY = Math.min(this.y1Index, this.y2Index);
      highY = Math.max(this.y1Index, this.y2Index);
      this.selectionDimensions = [lowX, lowY, highX, highY];
      this.drawHighlight();
      this.drawHighlight();
    } else if (e.key == "Enter" || e.key == "ArrowDown") {
      this.y1 += this.getCellHeight(this.y1Index);
      this.y1Index = this.y1Index + 1;
    } else if (e.key == "ArrowUp" && this.y1Index >= 1) {
      this.y1 -= this.getCellHeight(this.y1Index - 1);
      this.y1Index = this.y1Index - 1;
    } else if (e.key == "Tab" || e.key == "ArrowRight") {
      this.x1 += this.getCellWidth(this.x1Index);
      this.x1Index = this.x1Index + 1;
    } else if (e.key == "ArrowLeft" && this.x1Index >= 1) {
      this.x1 -= this.getCellWidth(this.x1Index - 1);
      this.x1Index = this.x1Index - 1;
    } else if (
      (e.key >= "a" && e.key <= "z") ||
      (e.key >= "0" && e.key <= "9") ||
      e.key == "Backspace"
    ) {
      flag = true;
      this.isAnimationRunning = false;
      this.inputBox.focus();
    }

    if (!e.ctrlKey && flag == false) {
      e.preventDefault();
      this.inputBox.blur();
      this.selectionDimensions = [
        this.x1Index,
        this.y1Index,
        this.x1Index,
        this.y1Index,
      ];
      this.drawHighlight();
    }
    if (!e.ctrlKey) {
      this.inputBox.style.display = "block";
      this.inputBox.style.top = `${this.y1}px`;
      this.inputBox.style.left = `${this.x1}px`;
      this.inputBox.style.height = `${this.getCellHeight(this.y1Index)}px`;
      this.inputBox.style.width = `${this.getCellWidth(this.x1Index)}px`;
    }
  }

  startMarchingAntsAnimation() {
    const [x, y, width, height, selectedCol, selectedRow] = this.coordinate;
    this.selectedCol = selectedCol;
    this.selectedRow = selectedRow;
    if (this.isAnimationRunning == false) {
      return;
    }
    this.lineDashOffset = this.lineDashOffset - 0.5;
    if (this.lineDashOffset < 0) {
      this.lineDashOffset = 10;
    }

    this.clearCanvas();
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 3]);
    this.ctx.lineDashOffset = this.lineDashOffset;
    this.ctx.fillStyle = "rgb(231,241,236)";
    this.ctx.fillRect(x, y, width, height);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(
      this.x1,
      this.y1,
      this.getCellWidth(this.x1Index),
      this.getCellHeight(this.y1Index)
    );

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "green";

    this.ctx.rect(x, y, width, height);

    this.ctx.stroke();
    this.ctx.restore();
    requestAnimationFrame(() => this.startMarchingAntsAnimation());
    this.highlightHeaders();
  }

  highLightEvent() {
    this.ctx.canvas.addEventListener("pointerdown", (e) => {
      this.isAnimationRunning = false;
      this.inputBox.style.display = "none";
      this.clearCanvas();
      this.drawgrid(this.numRows, this.numCols);

      const rect = this.ctx.canvas.getBoundingClientRect();
      this.selection = true;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const colIndex = this.getColumnIndex(clickX);
      const rowIndex = this.getRowIndex(clickY);
      this.startingIndex = [
        this.getColumnIndex(clickX),
        this.getRowIndex(clickY),
      ];

      this.x1 = 0;
      this.y1 = 0;
      this.x1Index = this.getColumnIndex(clickX);
      this.y1Index = this.getRowIndex(clickY);
      this.x2Index = this.getColumnIndex(clickX);
      this.y2Index = this.getRowIndex(clickY);

      for (let i = 0; i < this.x1Index; i++) {
        this.x1 += this.getCellWidth(i);
      }
      for (let i = 0; i < this.y1Index; i++) {
        this.y1 += this.getCellHeight(i);
      }

      const startX = Math.min(this.startingIndex[0], colIndex);
      const startY = Math.min(this.startingIndex[1], rowIndex);
      const endX = Math.max(this.startingIndex[0], colIndex);
      const endY = Math.max(this.startingIndex[1], rowIndex);

      this.selectionDimensions = [startX, startY, endX, endY];
      this.drawHighlight();
    });

    this.ctx.canvas.addEventListener("pointermove", (e) => {
      if (this.selection) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const colIndex = this.getColumnIndex(clickX);
        const rowIndex = this.getRowIndex(clickY);

        // Determine dimensions of selection
        const startX = Math.min(this.startingIndex[0], colIndex);
        const startY = Math.min(this.startingIndex[1], rowIndex);
        const endX = Math.max(this.startingIndex[0], colIndex);
        const endY = Math.max(this.startingIndex[1], rowIndex);

        this.selectionDimensions = [startX, startY, endX, endY];
        this.drawHighlight();
      }
    });

    this.ctx.canvas.addEventListener("pointerup", (e) => {
      this.selection = false;
    });

    this.ctx.canvas.addEventListener("pointerleave", (e) => {
      this.selection = false;
    });
  }

  drawHighlight() {
    this.clearCanvas();
    this.isColSelected = false;
    this.isRowSelected = false;
    const [startX, startY, endX, endY] = this.selectionDimensions;
    this.selectedCol = [startX, endX];
    this.selectedRow = [startY, endY];

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

    this.ctx.fillStyle = "rgb(231,241,236)";
    this.ctx.fillRect(x, y, width, height);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(
      this.x1,
      this.y1,
      this.getCellWidth(this.x1Index),
      this.getCellHeight(this.y1Index)
    );

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "rgb(16,124,65)";
    this.ctx.strokeRect(x, y, width, height);
    this.coordinate = [x, y, width, height, this.selectedCol, this.selectedRow];
    this.highlightHeaders();
  }

  highlightHeaders() {
    const [x, y, width, height] = this.coordinate;
    this.ctxTopHeader.save();
    this.ctxTopHeader.beginPath();
    this.ctxTopHeader.moveTo(x, 24);
    this.ctxTopHeader.lineTo(x + width, 24);
    this.ctxTopHeader.fillStyle = "rgb(202,234,216)";
    this.ctxTopHeader.fillRect(x, 0, width, 24);
    this.ctxTopHeader.lineWidth = 5;
    this.ctxTopHeader.strokeStyle = "rgb(16,124,65)";
    this.ctxTopHeader.stroke();
    this.ctxTopHeader.restore();

    this.ctxLeftHeader.save();
    this.ctxLeftHeader.beginPath();
    this.ctxLeftHeader.moveTo(40, y);
    this.ctxLeftHeader.lineTo(40, y + height);
    this.ctxLeftHeader.fillStyle = "rgb(202,234,216)";
    this.ctxLeftHeader.fillRect(0, y, 40, height);
    this.ctxLeftHeader.lineWidth = 5;
    this.ctxLeftHeader.strokeStyle = "rgb(16,124,65)";
    this.ctxLeftHeader.stroke();
    this.ctxLeftHeader.restore();

    this.drawgrid(this.numRows, this.numCols);
  }

  drawgrid(numRows, numCols) {
    this.drawRows(numRows);
    this.drawColumns(numCols);
    this.renderTopHeader(numCols);
    this.renderLeftHeader(numRows);
  }

  drawRows(numRows) {
    let cellPosition = 0;
    for (let y = 0; y <= numRows; y++) {
      cellPosition += this.cellHeight.get(y) ? this.cellHeight.get(y) : 21;
      this.ctx.beginPath();
      this.ctx.moveTo(0, cellPosition);
      this.ctx.lineTo(this.ctx.canvas.width, cellPosition);
      this.ctx.lineWidth = 0.2;
      this.ctx.strokeStyle = "#808080";
      this.ctx.stroke();
    }
  }

  drawColumns(numCols) {
    let cellPosition = 0;
    for (let x = 0; x <= numCols; x++) {
      cellPosition += this.cellWidths.get(x) ? this.cellWidths.get(x) : 100;
      this.ctx.beginPath();
      this.ctx.moveTo(cellPosition, 0);
      this.ctx.lineTo(cellPosition, this.ctx.canvas.height);
      this.ctx.lineWidth = 0.2;
      this.ctx.strokeStyle = "#808080";
      this.ctx.stroke();
    }
  }

  renderTopHeader(numCols) {
    let cellPosition = 0;
    for (let x = 0; x <= numCols; x++) {
      cellPosition += this.cellWidths.get(x) ? this.cellWidths.get(x) : 100;
      this.ctxTopHeader.save();
      this.ctxTopHeader.beginPath();
      this.ctxTopHeader.moveTo(cellPosition, 0);
      this.ctxTopHeader.lineTo(cellPosition, this.ctxTopHeader.canvas.height);
      this.ctxTopHeader.lineWidth = 0.2;
      this.ctxTopHeader.strokeStyle = "#808080";
      this.ctxTopHeader.stroke();
      this.ctxTopHeader.restore();
    }

    this.ctxTopHeader.save();
    this.ctxTopHeader.beginPath();
    this.ctxTopHeader.moveTo(0, 24);
    this.ctxTopHeader.lineWidth = 2;
    this.ctxTopHeader.strokeStyle = "#d5cece";
    this.ctxTopHeader.lineTo(this.ctxTopHeader.canvas.width, 24);
    this.ctxTopHeader.stroke();
    this.ctxTopHeader.restore();

    this.ctxTopHeader.font = "16px Arial";
    this.ctxTopHeader.fillStyle = "black";
    this.ctxTopHeader.textAlign = "center";

    cellPosition = 0;
    for (let i = 0; i < numCols; i++) {
      this.ctxTopHeader.save();
      let text = this.convertToTitle(i + 1);
      cellPosition += this.getCellWidth(i);
      let xPosition = cellPosition - this.getCellWidth(i) / 2;
      let yPosition = 15;

      if (Array.isArray(this.selectedCol)) {
        if (this.selectedCol[0] <= i && i <= this.selectedCol[1]) {
          this.ctxTopHeader.fillStyle = "rgb(16,124,65)";
        }
      } else if (this.selectedCol == i) {
        this.ctxTopHeader.fillStyle = "white";
        this.ctxTopHeader.font = "bold 16px Arial";
      } else if (this.selectedCol == "all") {
        this.ctxTopHeader.fillStyle = "rgb(16,124,65)";
      } else {
        this.ctxTopHeader.fillStyle = "black";
      }
      this.ctxTopHeader.fillText(text, xPosition, yPosition + 1);
      this.ctxTopHeader.restore();
    }
    this.selectedCol = null;
  }

  renderLeftHeader(numRows) {
    let cellPosition = 0;
    for (let y = 0; y <= numRows; y++) {
      cellPosition += this.cellHeight.get(y) ? this.cellHeight.get(y) : 21;
      this.ctxLeftHeader.save();
      this.ctxLeftHeader.beginPath();
      this.ctxLeftHeader.moveTo(0, cellPosition);
      this.ctxLeftHeader.lineTo(this.ctxLeftHeader.canvas.width, cellPosition);
      this.ctxLeftHeader.lineWidth = 0.2;
      this.ctxLeftHeader.strokeStyle = "#808080";
      this.ctxLeftHeader.stroke();
      this.ctxLeftHeader.restore();
    }

    this.ctxLeftHeader.save();
    this.ctxLeftHeader.beginPath();
    this.ctxLeftHeader.moveTo(40, 0);
    this.ctxLeftHeader.lineTo(40, this.ctxLeftHeader.canvas.height);
    this.ctxLeftHeader.strokeStyle = "#d5cece";
    this.ctxLeftHeader.stroke();
    this.ctxLeftHeader.restore();

    cellPosition = 0;
    this.ctxLeftHeader.font = "14px Arial";
    this.ctxLeftHeader.fillStyle = "#000000";

    for (let i = 0; i <= numRows; i++) {
      this.ctxLeftHeader.save();
      cellPosition += this.getCellHeight(i);
      let text = (i + 1).toString();
      let textWidth = this.ctxLeftHeader.measureText(text).width;
      let xPosition = this.ctxLeftHeader.canvas.width - textWidth - 10;
      let yPosition = cellPosition - this.getCellHeight(i) / 2;

      if (Array.isArray(this.selectedRow)) {
        if (this.selectedRow[0] <= i && i <= this.selectedRow[1]) {
          this.ctxLeftHeader.fillStyle = "rgb(16,124,65)";
        }
      } else if (this.selectedRow == i) {
        this.ctxLeftHeader.font = "bold 14px Arial";
        this.ctxLeftHeader.fillStyle = "white";
      } else if (this.selectedRow == "all") {
        this.ctxLeftHeader.fillStyle = "rgb(16,124,65)";
      } else {
        this.ctxLeftHeader.fillStyle = "#000000";
      }
      this.ctxLeftHeader.fillText(text, xPosition, yPosition + 4);
      this.ctxLeftHeader.restore();
    }
    this.selectedRow = null;
  }

  //resize grid
  Resize() {
    this.topHeader.addEventListener("pointerdown", (e) =>
      this.mouseDown(e, "topheader")
    );
    this.topHeader.addEventListener("pointermove", (e) =>
      this.mouseMove(e, "topheader")
    );
    this.topHeader.addEventListener("pointerup", () => this.mouseUp());
    this.topHeader.addEventListener("pointerleave", (e) => this.mouseUp());

    this.leftHeader.addEventListener("pointerdown", (e) =>
      this.mouseDown(e, "leftheader")
    );
    this.leftHeader.addEventListener("pointermove", (e) =>
      this.mouseMove(e, "leftheader")
    );
    this.leftHeader.addEventListener("pointerup", () => this.mouseUp());
    this.leftHeader.addEventListener("pointerleave", () => this.mouseUp());
  }

  columnHighlight() {
    this.clearCanvas();
    const [startX, startY, endX, endY] = this.selectionDimensionsTop;
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

    // this.ctx.save();
    // this.ctx.beginPath();
    this.ctx.fillStyle = "rgb(231,241,236)";
    this.ctx.fillRect(x, 0, width, this.ctx.canvas.height);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "rgb(16,124,65)";
    this.ctx.strokeRect(x, 0, width, this.ctx.canvas.height);
    // this.ctx.restore();

    //Top Header
    this.ctxTopHeader.save();
    this.ctxTopHeader.beginPath();
    this.ctxTopHeader.fillStyle = "rgb(16,124,65)";
    this.ctxTopHeader.fillRect(x, 0, width, this.ctxTopHeader.canvas.height);
    this.ctxTopHeader.restore();

    //left Header
    this.ctxLeftHeader.save();
    this.ctxLeftHeader.beginPath();
    this.ctxLeftHeader.moveTo(40, 0);
    this.ctxLeftHeader.lineTo(40, this.ctxLeftHeader.canvas.height);
    this.ctxLeftHeader.fillStyle = "rgb(202,234,216)";
    this.ctxLeftHeader.fillRect(0, 0, 44, this.ctxLeftHeader.canvas.height);
    this.ctxLeftHeader.lineWidth = 5;
    this.ctxLeftHeader.strokeStyle = "rgb(16,124,65)";
    this.ctxLeftHeader.stroke();
    this.ctxLeftHeader.restore();
    this.drawgrid(this.numRows, this.numCols);
  }
  rowHighlight() {
    this.clearCanvas();
    const [startX, startY, endX, endY] = this.selectionDimensionsLeft;
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
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgb(231,241,236)";
    this.ctx.fillRect(0, y, this.ctx.canvas.width, height);
    this.ctx.lineWidth = 2;
    this.ctx.rect(0, y, this.ctx.canvas.width, height);
    this.ctx.strokeStyle = "rgb(16,124,65)";
    this.ctx.stroke();
    this.ctx.restore();

    //Left Header
    this.ctxLeftHeader.save();
    this.ctxLeftHeader.beginPath();
    this.ctxLeftHeader.fillStyle = "rgb(16,124,65)";
    this.ctxLeftHeader.fillRect(0, y, this.ctxLeftHeader.canvas.width, height);
    this.ctxLeftHeader.restore();

    //Top Header
    this.ctxTopHeader.save();
    this.ctxTopHeader.beginPath();

    this.ctxTopHeader.moveTo(0, 24);
    this.ctxTopHeader.lineTo(this.ctxTopHeader.canvas.width, 24);
    this.ctxTopHeader.fillStyle = "rgb(202,234,216)";
    this.ctxTopHeader.fillRect(0, 0, this.ctxTopHeader.canvas.width, 26);
    this.ctxTopHeader.lineWidth = 5;
    this.ctxTopHeader.strokeStyle = "rgb(16,124,65)";
    this.ctxTopHeader.stroke();
    this.ctxTopHeader.restore();
    this.drawgrid(this.numRows, this.numCols);
  }

  mouseDown(e, header) {
    this.inputBox.style.display = "none";
    this.clearCanvas();
    this.drawgrid(this.numRows, this.numCols);

    let rect = null;
    if (header == "topheader") {
      rect = this.topHeader.getBoundingClientRect();
    } else {
      rect = this.leftHeader.getBoundingClientRect();
    }
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let columnIndex = this.getColumnIndex(clickX);
    let rowIndex = this.getRowIndex(clickY);

    let columnBool = this.getColumnBool(clickX);

    if (columnBool) {
      this.startingIndexTop = [
        this.getColumnIndex(clickX),
        this.getRowIndex(clickY),
      ];
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
    this.selectedCol = columnIndex;
    this.columnHighlight();
    if (
      header == "topheader" &&
      rowIndex == 0 &&
      columnIndex !== -1 &&
      this.getCellWidth(columnIndex) + columnLeft - clickX > 10
    ) {
      this.selectedCol = columnIndex;
      this.isColSelected = true;
      this.selectedRow = "all";
      console.log(columnIndex);
      const startX = Math.min(this.startingIndexTop[0], columnIndex);
      const startY = Math.min(this.startingIndexTop[1], rowIndex);
      const endX = Math.max(this.startingIndexTop[0], columnIndex);
      const endY = Math.max(this.startingIndexTop[1], rowIndex);
      this.selectionDimensionsTop = [startX, startY, endX, endY];
      console.log(this.selectionDimensionsTop);
      this.columnHighlight();
    } else if (
      columnIndex == 0 &&
      rowIndex !== -1 &&
      //   this.getCellHeight(rowIndex) + rowTop - clickY > 10 &&
      columnBool
    ) {
      this.selectedCol = "all";
      this.selectedRow = rowIndex;
      this.isRowSelected = true;
      const startX = Math.min(this.startingIndexLeft[0], columnIndex);
      const startY = Math.min(this.startingIndexLeft[1], rowIndex);
      const endX = Math.max(this.startingIndexLeft[0], columnIndex);
      const endY = Math.max(this.startingIndexLeft[1], rowIndex);
      this.selectionDimensionsLeft = [startX, startY, endX, endY];
      this.rowHighlight();
    }

    if (
      columnIndex == 0 &&
      rowIndex !== -1 &&
      this.getCellHeight(rowIndex) + rowTop - clickY < 10
    ) {
      this.isDraggingLeft = true;
      this.draggingLeft = rowIndex;
      this.startY = clickY;
      this.startHeight = this.getCellHeight(rowIndex);
    }
    if (
      rowIndex == 0 &&
      columnIndex !== -1 &&
      this.getCellWidth(columnIndex) + columnLeft - clickX < 10
    ) {
      this.isDraggingTop = true;
      this.draggingTop = columnIndex;
      this.startX = clickX;
      this.startWidth = this.getCellWidth(columnIndex);
    }
  }

  mouseMove(e, header) {
    let rect = null;
    if (header == "topheader") {
      rect = this.topHeader.getBoundingClientRect();
    } else {
      rect = this.leftHeader.getBoundingClientRect();
    }
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let columnIndex = this.getColumnIndex(clickX);
    let rowIndex = this.getRowIndex(clickY);
    let columnLeft = 0;
    let rowTop = 0;
    console.log(columnIndex);
    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getCellHeight(i);
    }

    if (
      rowIndex == 0 &&
      columnIndex !== -1 &&
      this.getCellWidth(columnIndex) + columnLeft - clickX < 10
    ) {
      this.topHeader.style.cursor = "col-resize";
    } else {
      this.topHeader.style.cursor = "default";
    }

    if (
      columnIndex == 0 &&
      rowIndex !== -1 &&
      this.getCellHeight(rowIndex) + rowTop - clickY < 5
    ) {
      this.leftHeader.style.cursor = "row-resize";
    } else {
      this.leftHeader.style.cursor = "default";
    }

    
    if (this.isDraggingTop) {
      this.clearCanvas();
      this.topHeader.style.cursor = "col-resize";
      const deltaX = clickX - this.startX;
      const newWidth = Math.max(20, this.startWidth + deltaX);
      this.cellWidths.set(this.draggingTop, newWidth);

      if (this.isColSelected) {
        const startX = Math.min(this.startingIndexTop[0], columnIndex + 1);
        const startY = Math.min(this.startingIndexTop[1], rowIndex);
        const endX = Math.max(this.startingIndexTop[0], columnIndex);
        const endY = Math.max(this.startingIndexTop[1], rowIndex);
        this.selectionDimensionsTop = [startX, startY, endX, endY];
        console.log(this.selectionDimensionsTop);
        this.columnHighlight();
      } else {
        // this.clearCanvas();
        this.drawgrid(this.numRows, this.numCols);
        this.drawHighlight();
        this.startMarchingAntsAnimation();
      }
    }

    if (this.isDraggingLeft) {
      this.clearCanvas();
      this.leftHeader.style.cursor = "row-resize";
      const deltaY = clickY - this.startY;
      const newHeight = Math.max(0, this.startHeight + deltaY);
      this.cellHeight.set(this.draggingLeft, newHeight);
      if (this.isRowSelected) {
        const startX = Math.min(this.startingIndexLeft[0], columnIndex);
        const startY = Math.min(this.startingIndexLeft[1], rowIndex);
        const endX = Math.max(this.startingIndexLeft[0], columnIndex);
        const endY = Math.max(this.startingIndexLeft[1], rowIndex);
        this.selectionDimensionsLeft = [startX, startY, endX, endY];
        this.rowHighlight();
      } else {
        // this.clearCanvas();
        this.drawgrid(this.numRows, this.numCols);
        this.drawHighlight();
        this.startMarchingAntsAnimation();
      }
    }
  }

  mouseUp() {
    if (this.isDraggingTop) {
      this.isDraggingTop = false;
      this.draggingTop = -1;
    }
    if (this.isDraggingLeft) {
      this.isDraggingLeft = false;
      this.draggingLeft = -1;
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

  getCellWidth(i) {
    return this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
  }

  getCellHeight(i) {
    return this.cellHeight.get(i) ? this.cellHeight.get(i) : 21;
  }
}

new newCanvas("Sheet-1");
