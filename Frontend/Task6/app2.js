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

    this.drawGrid = new drawGrid(
      this.ctx,
      this.ctxTopHeader,
      this.ctxLeftHeader,
      this.cellWidths,
      this.cellHeight,
      this
    );
    this.resizeGrid = new resizeGrid(this);
    this.getValues = new getValues(this);
    this.cellInput = new cellInput(this);

    // this.clearCanvas();
    // this.drawBackground();
    this.drawGrid.drawgrid(this.numRows, this.numCols);
    this.scroll();
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

  drawBackground() {
    this.ctx.fillStyle = "#ffffff";
    this.ctxTopHeader.fillStyle = "#F5F5F5";
    this.ctxLeftHeader.fillStyle = "#F5F5F5";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxTopHeader.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxLeftHeader.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clearCanvas() {
    this.ctx.transform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxTopHeader.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxLeftHeader.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class resizeGrid {
  constructor(canvasIns) {
    this.canvasIns = canvasIns;
    this.isDraggingTop = false;
    this.draggingTop = -1;
    this.startX = 0;
    this.startWidth = 0;

    this.isDraggingLeft = false;
    this.draggingLeft = -1;
    this.startY = 0;
    this.startHeight = 0;

    this.getValueInstance = new getValues(canvasIns);
    this.Resize();
  }

  Resize() {
    this.canvasIns.topHeader.addEventListener("mousedown", (e) =>
      this.mouseDown(e, "rowheader")
    );
    this.canvasIns.topHeader.addEventListener("mousemove", (e) =>
      this.mouseMove(e, "rowheader")
    );
    this.canvasIns.topHeader.addEventListener("mouseup", () => this.mouseUp());
    this.canvasIns.topHeader.addEventListener("mouseleave", (e) =>
      this.mouseUp()
    );

    this.canvasIns.leftHeader.addEventListener("mousedown", (e) =>
      this.mouseDown(e, "colheader")
    );
    this.canvasIns.leftHeader.addEventListener("mousemove", (e) =>
      this.mouseMove(e, "colheader")
    );
    this.canvasIns.leftHeader.addEventListener("mouseup", () => this.mouseUp());
    this.canvasIns.leftHeader.addEventListener("mouseleave", () =>
      this.mouseUp()
    );
  }

  mouseDown(e, header) {
    let rect = null;
    if (header == "rowheader") {
      rect = this.canvasIns.topHeader.getBoundingClientRect();
    } else {
      rect = this.canvasIns.leftHeader.getBoundingClientRect();
    }
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let columnIndex = this.getValueInstance.getColumnIndex(mouseX);
    let rowIndex = this.getValueInstance.getRowIndex(mouseY);

    let columnLeft = 0;
    let rowTop = 0;

    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getValueInstance.getCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getValueInstance.getCellHeight(i);
    }

    if (
      columnIndex == 0 &&
      rowIndex !== -1 &&
      this.getValueInstance.getCellHeight(rowIndex) + rowTop - mouseY < 10
    ) {
      this.isDraggingLeft = true;
      this.draggingLeft = rowIndex;
      this.startY = mouseY;
      this.startHeight = this.getValueInstance.getCellHeight(rowIndex);
    }

    if (
      rowIndex == 0 &&
      columnIndex !== -1 &&
      this.getValueInstance.getCellWidth(columnIndex) + columnLeft - mouseX < 10
    ) {
      this.isDraggingTop = true;
      this.draggingTop = columnIndex;
      this.startX = mouseX;
      this.startWidth = this.getValueInstance.getCellWidth(columnIndex);
    }
  }

  mouseMove(e, header) {
    let rect = null;
    if (header == "rowheader") {
      rect = this.canvasIns.topHeader.getBoundingClientRect();
    } else {
      rect = this.canvasIns.leftHeader.getBoundingClientRect();
    }
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let columnIndex = this.getValueInstance.getColumnIndex(mouseX);
    let rowIndex = this.getValueInstance.getRowIndex(mouseY);

    let columnLeft = 0;
    let rowTop = 0;

    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getValueInstance.getCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getValueInstance.getCellHeight(i);
    }

    if (
      rowIndex == 0 &&
      columnIndex !== -1 &&
      this.getValueInstance.getCellWidth(columnIndex) + columnLeft - mouseX < 10
    ) {
      this.canvasIns.topHeader.style.cursor = "col-resize";
    } else {
      this.canvasIns.topHeader.style.cursor = "default";
    }

    if (
      columnIndex == 0 &&
      rowIndex !== -1 &&
      this.getValueInstance.getCellHeight(rowIndex) + rowTop - mouseY < 5
    ) {
      this.canvasIns.leftHeader.style.cursor = "row-resize";
    } else {
      this.canvasIns.leftHeader.style.cursor = "default";
    }

    if (this.isDraggingTop) {
      this.canvasIns.topHeader.style.cursor = "col-resize";
      const deltaX = mouseX - this.startX;
      const newWidth = Math.max(20, this.startWidth + deltaX);
      this.canvasIns.cellWidths.set(this.draggingTop, newWidth);
      this.canvasIns.clearCanvas();
      this.canvasIns.drawBackground();
      this.canvasIns.drawGrid.drawgrid(
        this.canvasIns.numRows,
        this.canvasIns.numCols
      );
    }

    if (this.isDraggingLeft) {
      this.canvasIns.leftHeader.style.cursor = "row-resize";
      const deltaY = mouseY - this.startY;
      const newHeight = Math.max(0, this.startHeight + deltaY);
      this.canvasIns.cellHeight.set(this.draggingLeft, newHeight);
      this.canvasIns.clearCanvas();
      this.canvasIns.drawBackground();
      this.canvasIns.drawGrid.drawgrid(
        this.canvasIns.numRows,
        this.canvasIns.numCols
      );
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
}

class getValues {
  constructor(canvasIns) {
    this.canvasIns = canvasIns;
  }

  getColumnIndex(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.canvasIns.numCols; i++) {
      if (x >= cellPosition && x <= cellPosition + this.getCellWidth(i)) {
        return i;
      }
      cellPosition += this.getCellWidth(i);
    }
    return -1;
  }

  getRowIndex(x) {
    let cellPosition = 0;
    for (let i = 0; i <= this.canvasIns.numRows; i++) {
      if (x >= cellPosition && x <= cellPosition + this.getCellHeight(i)) {
        return i;
      }
      cellPosition += this.getCellHeight(i);
    }
    return -1;
  }

  getCellWidth(i) {
    return this.canvasIns.cellWidths.get(i)
      ? this.canvasIns.cellWidths.get(i)
      : 100;
  }

  getCellHeight(i) {
    return this.canvasIns.cellHeight.get(i)
      ? this.canvasIns.cellHeight.get(i)
      : 21;
  }
}

class drawGrid {
  constructor(ctx, ctxHeader, ctxColHeader, cellWidths, cellHeight, canvasIns) {
    this.ctx = ctx;
    this.ctxTopHeader = ctxHeader;
    this.ctxLeftHeader = ctxColHeader;
    this.cellWidths = cellWidths;
    this.cellHeight = cellHeight;
    this.selection = false;
    this.startingIndex = null;
    this.canvasIns = canvasIns;
    this.copy = false;

    this.getValueInstance = new getValues(canvasIns);
    const inputBox = document.getElementById("canvasinput");
    this.ctx.canvas.addEventListener("mousedown", (e) => {
      if (this.copy) {
        this.selectionDimensions = null;
        this.copy = false;
      }
      this.canvasIns.clearCanvas();
      this.drawgrid(this.canvasIns.numRows, this.canvasIns.numCols);
      inputBox.style.display = "none";
      const rect = this.ctx.canvas.getBoundingClientRect();
      this.selection = true;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      this.startingIndex = [
        this.getValueInstance.getColumnIndex(clickX),
        this.getValueInstance.getRowIndex(clickY),
      ];
    });

    this.ctx.canvas.addEventListener("mousemove", (e) => {
      if (this.selection) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const colIndex = this.getValueInstance.getColumnIndex(clickX);
        const rowIndex = this.getValueInstance.getRowIndex(clickY);

        // Determine dimensions of selection
        const startX = Math.min(this.startingIndex[0], colIndex);
        const startY = Math.min(this.startingIndex[1], rowIndex);
        const endX = Math.max(this.startingIndex[0], colIndex);
        const endY = Math.max(this.startingIndex[1], rowIndex);

        this.selectionDimensions = [startX, startY, endX, endY];
        this.drawHighlight();
      }
      this.drawgrid(
        this.getValueInstance.numRows,
        this.getValueInstance.numCols
      );
    });

    this.ctx.canvas.addEventListener("mouseup", (e) => {
      inputBox.style.display = "none";
      this.selection = false;
    });

    document.addEventListener("click", () => {
      if (this.copy) {
        this.selectionDimensions = null;
        this.copy = false;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "c" && event.ctrlKey) {
        const [startX, startY, endX, endY] = this.selectionDimensions;
        this.copy = true;
        let width1 = 0;
        let height1 = 0;
        let width2 = 0;
        let height2 = 0;

        for (let i = 0; i < startX; i++) {
          width1 += this.getValueInstance.getCellWidth(i);
        }
        for (let i = 0; i < startY; i++) {
          height1 += this.getValueInstance.getCellHeight(i);
        }
        for (let i = startX; i <= endX; i++) {
          width2 += this.getValueInstance.getCellWidth(i);
        }
        for (let i = startY; i <= endY; i++) {
          height2 += this.getValueInstance.getCellHeight(i);
        }

        this.canvasIns.ctx.lineWidth = 2;
        this.canvasIns.ctx.strokeStyle = "red";
        this.canvasIns.ctx.strokeRect(width1, height1, width2, height2);

        this.startMarchingAntsAnimation(width1, height1, width2, height2);
      }
    });

    this.o_speed = 50;
    this.offset = 3;
    this.line = 5;
    this.gap = 5;
  }

  startMarchingAntsAnimation(x, y, width, height) {
    this.canvasIns.clearCanvas();
    this.canvasIns.drawBackground();
    this.canvasIns.ctx.save();
    this.canvasIns.ctx.beginPath();

    this.canvasIns.ctx.setLineDash([5, 3]);
    this.canvasIns.ctx.lineDashOffset = 9;
    this.canvasIns.ctx.rect(x, y, width, height);
    this.canvasIns.ctx.strokeStyle = "red";
    this.canvasIns.ctx.stroke();
    this.canvasIns.ctx.restore();
    this.drawgrid(this.canvasIns.numRows, this.canvasIns.numCols);
  }

  drawHighlight() {
    this.canvasIns.clearCanvas();
    this.canvasIns.drawBackground();

    this.drawgrid(this.canvasIns.numRows, this.canvasIns.numCols);

    const [startX, startY, endX, endY] = this.selectionDimensions;
    this.canvasIns.ctx.fillStyle = "rgba(0, 0, 255, 0.1)";

    let width1 = 0;
    let height1 = 0;
    let width2 = 0;
    let height2 = 0;
    for (let i = 0; i < startX; i++) {
      width1 += this.getValueInstance.getCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      height1 += this.getValueInstance.getCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width2 += this.getValueInstance.getCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height2 += this.getValueInstance.getCellHeight(i);
    }
    this.canvasIns.ctx.fillRect(width1, height1, width2, height2);

    this.canvasIns.ctx.lineWidth = 2;
    this.canvasIns.ctx.strokeStyle = "#0b57d0";
    this.canvasIns.ctx.strokeRect(width1, height1, width2, height2);
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

  renderTopHeader(numCols) {
    let cellPosition = 0;
    this.ctxTopHeader.fillStyle = "#F5F5F5";
    for (let x = 0; x <= numCols; x++) {
      cellPosition += this.cellWidths.get(x) ? this.cellWidths.get(x) : 100;
      this.ctxTopHeader.beginPath();
      this.ctxTopHeader.moveTo(cellPosition, 0);
      this.ctxTopHeader.lineTo(cellPosition, this.ctxTopHeader.canvas.height);
      this.ctxTopHeader.strokeStyle = "#d5cece";
      this.ctxTopHeader.stroke();
    }
    this.ctxTopHeader.font = "16px Arial";
    this.ctxTopHeader.fillStyle = "#000000";
    this.ctxTopHeader.textAlign = "center";

    cellPosition = 0;
    for (let i = 0; i < numCols; i++) {
      let text = this.convertToTitle(i + 1);
      cellPosition += this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
      let xPosition = cellPosition - (this.cellWidths.get(i) || 100) / 2;
      let yPosition = 15;
      this.ctxTopHeader.fillText(text, xPosition, yPosition + 1);
    }
  }

  renderLeftHeader(numRows) {
    let cellPosition = 0;
    this.ctxLeftHeader.fillStyle = "#F5F5F5";
    for (let y = 0; y <= numRows; y++) {
      cellPosition += this.cellHeight.get(y) ? this.cellHeight.get(y) : 21;
      this.ctxLeftHeader.beginPath();
      this.ctxLeftHeader.moveTo(0, cellPosition);
      this.ctxLeftHeader.lineTo(this.ctxLeftHeader.canvas.width, cellPosition);
      this.ctxLeftHeader.strokeStyle = "#d5cece";
      this.ctxLeftHeader.stroke();
    }

    cellPosition = 0;
    this.ctxLeftHeader.font = "14px Arial";
    this.ctxLeftHeader.fillStyle = "#000000";
    for (let i = 0; i <= numRows; i++) {
      cellPosition += this.cellHeight.get(i) || 21;
      let text = (i + 1).toString();
      let textWidth = this.ctxLeftHeader.measureText(text).width;

      let xPosition = this.ctxLeftHeader.canvas.width - textWidth - 10;
      let yPosition = cellPosition - (this.cellHeight.get(i) || 21) / 2;
      this.ctxLeftHeader.fillText(text, xPosition, yPosition + 4);
    }
  }
}

class cellInput {
  constructor(canvasIns) {
    this.canvasIns = canvasIns;
    this.getValueInstance = new getValues(canvasIns);
    const inputBox = document.getElementById("canvasinput");
    let rowTop = 0;
    let columnLeft = 0;

    this.canvasIns.canvas.addEventListener("click", (e) => {
      rowTop = 0;
      columnLeft = 0;
      let rect = this.canvasIns.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      this.columnIndex = this.getValueInstance.getColumnIndex(mouseX);
      this.rowIndex = this.getValueInstance.getRowIndex(mouseY);
      let cellWidth = this.getValueInstance.getCellWidth(this.columnIndex);
      let cellHeight = this.getValueInstance.getCellHeight(this.rowIndex);

      for (let i = 0; i < this.rowIndex; i++) {
        rowTop += this.getValueInstance.getCellHeight(i);
      }
      for (let i = 0; i < this.columnIndex; i++) {
        columnLeft += this.getValueInstance.getCellWidth(i);
      }

      inputBox.style.display = "block";
      inputBox.style.top = `${rowTop}px`;
      0;
      inputBox.style.left = `${columnLeft}px`;
      inputBox.style.height = `${cellHeight}px`;
      inputBox.style.width = `${cellWidth}px`;
    });

    let focus = 0;
    document.addEventListener("keydown", (e) => {
      let cellHeight = 0;
      let cellWidth = 0;

      if (
        (e.key == "Enter" && focus == 1) ||
        (e.key == "ArrowDown" && focus == 0)
      ) {
        e.preventDefault();
        inputBox.blur();
        focus = 0;
        rowTop += this.getValueInstance.getCellHeight(this.rowIndex);
        this.rowIndex = this.rowIndex + 1;
      } else if (e.key == "ArrowUp" && focus == 0 && this.rowIndex >= 1) {
        e.preventDefault();
        rowTop -= this.getValueInstance.getCellHeight(this.rowIndex - 1);
        this.rowIndex = this.rowIndex - 1;
      } else if (e.key == "Tab" || (e.key == "ArrowRight" && focus == 0)) {
        e.preventDefault();
        inputBox.blur();
        columnLeft += this.getValueInstance.getCellWidth(this.columnIndex);
        this.columnIndex = this.columnIndex + 1;
      } else if (e.key == "ArrowLeft" && focus == 0 && this.columnIndex >= 1) {
        e.preventDefault();
        columnLeft -= this.getValueInstance.getCellWidth(this.columnIndex - 1);
        this.columnIndex = this.columnIndex - 1;
      } else if (
        (e.key == "Enter" && focus == 0) ||
        (e.key >= "a" && e.key <= "z") ||
        (e.key >= "0" && e.key <= "9")
      ) {
        inputBox.focus();
        focus = 1;
      }

      cellWidth = this.getValueInstance.getCellWidth(this.columnIndex);
      cellHeight = this.getValueInstance.getCellHeight(this.rowIndex);
      inputBox.style.top = `${rowTop}px`;
      inputBox.style.left = `${columnLeft}px`;
      inputBox.style.height = `${cellHeight}px`;
      inputBox.style.width = `${cellWidth}px`;
    });
  }
}

new newCanvas("Sheet-1");
