class newCanvas {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.numRows = 10;
    this.numCols = 26;
    this.cellHeight = new Map();
    this.cellWidths = new Map();
    this.canvas = this.createNew();
    this.canvas.style.cursor = "default";
    this.ctx = this.canvas.getContext("2d");
    this.drawGrid = new drawGrid(this.ctx, this.cellWidths, this.cellHeight);
    this.resizeGrid = new resizeGrid(this);
    this.cellWidths.set(0, 50);
    this.cellHeight.set(0, 21);

    this.drawBackground();
    this.drawGrid.drawgrid(this.numRows, this.numCols);
  }

  createNew() {
    const main = document.getElementById("main");
    const createCanva = document.createElement("canvas");
    createCanva.classList.add("canvas");
    createCanva.setAttribute("id", this.sheetName);
    createCanva.width = 2100;
    createCanva.height = 1200;

    main.appendChild(createCanva);
    return createCanva;
  }

  drawBackground() {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class resizeGrid {
  constructor(canvasIns) {
    this.canvasIns = canvasIns;
    this.isDraggingCol = false;
    this.draggingColumn = -1;
    this.startX = 0;
    this.startWidth = 0;

    this.isDraggingRow = false;
    this.draggingRow = -1;
    this.startY = 0;
    this.startHeight = 0;
    this.colResize();
    this.rowResize();
  }

  colResize() {
    this.canvasIns.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvasIns.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let columnIndex = this.getColumnIndex(mouseX);
      let rowIndex = this.getRowIndex(mouseY);
      let columnLeft = 0;
      for (let i = 0; i < columnIndex; i++) {
        columnLeft += this.getCellWidth(i);
      }

      if (
        rowIndex == 0 &&
        columnIndex > 0 &&
        columnIndex !== -1 &&
        this.getCellWidth(columnIndex) + columnLeft - mouseX < 10
      ) {
        this.isDraggingCol = true;
        this.draggingColumn = columnIndex;
        this.startX = mouseX;
        this.startWidth = this.getCellWidth(columnIndex);
      }
    });

    this.canvasIns.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvasIns.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let columnIndex = this.getColumnIndex(mouseX);
      let rowIndex = this.getRowIndex(mouseY);

      let columnLeft = 0;
      for (let i = 0; i < columnIndex; i++) {
        columnLeft += this.getCellWidth(i);
      }
      if (
        rowIndex == 0 &&
        columnIndex > 0 &&
        columnIndex !== -1 &&
        this.getCellWidth(columnIndex) + columnLeft - mouseX < 10
      ) {
        this.canvasIns.canvas.style.cursor = "col-resize";
      } else {
        this.canvasIns.canvas.style.cursor = "default";
      }

      if (this.isDraggingCol) {
        this.canvasIns.canvas.style.cursor = "col-resize";
        const deltaX = mouseX - this.startX;
        const newWidth = Math.max(20, this.startWidth + deltaX);
        this.canvasIns.cellWidths.set(this.draggingColumn, newWidth);
        this.canvasIns.clearCanvas();
        this.canvasIns.drawBackground();
        this.canvasIns.drawGrid.drawgrid(
          this.canvasIns.numRows,
          this.canvasIns.numCols
        );
      }
    });

    this.canvasIns.canvas.addEventListener("mouseup", (e) => {
      if (this.isDraggingCol) {
        this.isDraggingCol = false;
        this.draggingColumn = -1;
      }
    });
  }

  rowResize() {
    this.canvasIns.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvasIns.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let columnIndex = this.getColumnIndex(mouseX);
      let rowIndex = this.getRowIndex(mouseY);
      let rowTop = 0;
      for (let i = 0; i < rowIndex; i++) {
        rowTop += this.getCellHeight(i);
      }

      if (
        columnIndex == 0 &&
        rowIndex > 0 &&
        rowIndex !== -1 &&
        this.getCellHeight(rowIndex) + rowTop - mouseY < 10
        // mouseY - rowTop > 18
      ) {
        this.isDraggingRow = true;
        this.draggingRow = rowIndex;
        this.startY = mouseY;
        this.startHeight = this.getCellHeight(rowIndex);
      }
    });

    this.canvasIns.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvasIns.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let columnIndex = this.getColumnIndex(mouseX);
      let rowIndex = this.getRowIndex(mouseY);

      let rowTop = 0;
      for (let i = 0; i < rowIndex; i++) {
        rowTop += this.getCellHeight(i);
      }
      if (
        columnIndex == 0 &&
        rowIndex > 0 &&
        this.getCellHeight(rowIndex) + rowTop - mouseY < 10
      ) {
        this.canvasIns.canvas.style.cursor = "row-resize";
      } else {
        this.canvasIns.canvas.style.cursor = "default";
      }

      if (this.isDraggingRow) {
        this.canvasIns.canvas.style.cursor = "row-resize";
        const deltaY = mouseY - this.startY;
        const newHeight = Math.max(0, this.startHeight + deltaY);
        this.canvasIns.cellHeight.set(this.draggingRow, newHeight);
        this.canvasIns.clearCanvas();
        this.canvasIns.drawBackground();
        this.canvasIns.drawGrid.drawgrid(
          this.canvasIns.numRows,
          this.canvasIns.numCols
        );
      }
    });

    this.canvasIns.canvas.addEventListener("mouseup", (e) => {
      if (this.isDraggingRow) {
        this.isDraggingRow = false;
        this.draggingRow = -1;
      }
    });
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
  constructor(ctx, cellWidths, cellHeight) {
    this.ctx = ctx;
    this.cellWidths = cellWidths;
    this.cellHeight = cellHeight;
  }

  drawgrid(numRows, numCols) {
    this.drawRows(numRows);
    this.drawColumns(numCols);
    this.renderHeader(numCols);
  }

  drawRows(numRows) {
    let cellPosition = 0;
    for (let y = 0; y <= numRows; y++) {
      cellPosition += this.cellHeight.get(y) ? this.cellHeight.get(y) : 21;
      this.ctx.beginPath();
      this.ctx.moveTo(0, cellPosition);
      this.ctx.lineTo(this.ctx.canvas.width, cellPosition);
      this.ctx.lineWidth = 0.3;
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
      this.ctx.lineWidth = 0.3;
      this.ctx.strokeStyle = "#808080";
      this.ctx.stroke();
    }
  }

  renderHeader(numCols) {
    this.ctx.font = "14px Arial";
    this.ctx.fillStyle = "#000000";
    this.ctx.strokeStyle = "#5A5A5A";
    let cellPosition = 0;
    for (let i = 0; i < numCols; i++) {
      cellPosition += this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
      this.ctx.fillText((i + 10).toString(36).toUpperCase(), cellPosition, 15);
    }
  }
}

new newCanvas("Sheet-1");
