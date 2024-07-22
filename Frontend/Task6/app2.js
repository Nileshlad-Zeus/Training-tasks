class newCanvas {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.numRows = 100;
    this.numCols = 26;
    this.cellHeight = new Map();
    this.cellWidths = new Map();

    this.canvas = this.createNew();
    this.canvas.style.cursor = "cell";
    this.topHeader = this.createTopHeader();
    this.leftHeader = this.createLeftHeader();
    this.ctx = this.canvas.getContext("2d");
    this.ctxTopHeader = this.topHeader.getContext("2d");
    this.ctxLeftHeader = this.leftHeader.getContext("2d");
    this.selection = false;
    this.drawGrid = new drawGrid(
      this.ctx,
      this.ctxTopHeader,
      this.ctxLeftHeader,
      this.cellWidths,
      this.cellHeight,
      this
    );
    this.resizeGrid = new resizeGrid(
      this,
      this.ctxTopHeader,
      this.ctxLeftHeader
    );
    this.getValues = new getValues(this);

    this.selectedCol = null;
    this.selectedRow = null;

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

  // drawBackground() {
  //   this.ctx.fillStyle = "#ffffff";
  //   this.ctxTopHeader.fillStyle = "#F5F5F5";
  //   this.ctxLeftHeader.fillStyle = "#F5F5F5";
  //   this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  //   this.ctxTopHeader.fillRect(0, 0, this.canvas.width, this.canvas.height);
  //   this.ctxLeftHeader.fillRect(0, 0, this.canvas.width, this.canvas.height);
  // }

  clearCanvas() {
    this.ctx.transform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxTopHeader.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctxLeftHeader.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class resizeGrid {
  constructor(canvasIns, ctxTopHeader, ctxLeftHeader) {
    this.canvasIns = canvasIns;
    this.ctxTopHeader = ctxTopHeader;
    this.ctxLeftHeader = ctxLeftHeader;
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
      this.mouseDown(e, "topheader")
    );
    this.canvasIns.topHeader.addEventListener("mousemove", (e) =>
      this.mouseMove(e, "topheader")
    );
    this.canvasIns.topHeader.addEventListener("mouseup", () => this.mouseUp());
    this.canvasIns.topHeader.addEventListener("mouseleave", (e) =>
      this.mouseUp()
    );

    this.canvasIns.leftHeader.addEventListener("mousedown", (e) =>
      this.mouseDown(e, "leftheader")
    );
    this.canvasIns.leftHeader.addEventListener("mousemove", (e) =>
      this.mouseMove(e, "leftheader")
    );
    this.canvasIns.leftHeader.addEventListener("mouseup", () => this.mouseUp());
    this.canvasIns.leftHeader.addEventListener("mouseleave", () =>
      this.mouseUp()
    );
  }

  mouseDown(e, header) {
    this.canvasIns.clearCanvas();
    let rect = null;
    if (header == "topheader") {
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

    if (header == "topheader") {
      this.canvasIns.selectedCol = columnIndex;
      this.canvasIns.selectedRow = "all";
      this.canvasIns.ctx.save();
      this.canvasIns.ctx.beginPath();
      this.canvasIns.ctx.fillStyle = "rgb(231,241,236)";
      this.canvasIns.ctx.fillRect(
        columnLeft,
        0,
        this.getValueInstance.getCellWidth(columnIndex),
        this.canvasIns.ctx.canvas.height
      );
      this.canvasIns.ctx.lineWidth = 2;
      this.canvasIns.ctx.rect(
        columnLeft,
        -1,
        this.getValueInstance.getCellWidth(columnIndex),
        this.canvasIns.ctx.canvas.height + 1
      );
      this.canvasIns.ctx.strokeStyle = "rgb(16,124,65)";
      this.canvasIns.ctx.stroke();
      this.canvasIns.ctx.restore();

      //Top Header
      this.ctxTopHeader.save();
      this.ctxTopHeader.beginPath();
      this.ctxTopHeader.fillStyle = "rgb(16,124,65)";
      this.ctxTopHeader.fillRect(
        columnLeft,
        0,
        this.getValueInstance.getCellWidth(columnIndex),
        this.ctxTopHeader.canvas.height
      );
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
    } else {
      this.canvasIns.selectedCol = "all";
      this.canvasIns.selectedRow = rowIndex;
      this.canvasIns.ctx.save();
      this.canvasIns.ctx.beginPath();
      this.canvasIns.ctx.fillStyle = "rgb(231,241,236)";
      this.canvasIns.ctx.fillRect(
        0,
        rowTop,
        this.canvasIns.ctx.canvas.width,
        this.getValueInstance.getCellHeight(rowIndex)
      );
      this.canvasIns.ctx.lineWidth = 2;
      this.canvasIns.ctx.rect(
        -1,
        rowTop,
        this.canvasIns.ctx.canvas.width + 1,
        this.getValueInstance.getCellHeight(rowIndex)
      );
      this.canvasIns.ctx.strokeStyle = "rgb(16,124,65)";
      this.canvasIns.ctx.stroke();
      this.canvasIns.ctx.restore();

      //Left Header
      this.ctxLeftHeader.save();
      this.ctxLeftHeader.beginPath();
      this.ctxLeftHeader.fillStyle = "rgb(16,124,65)";
      this.ctxLeftHeader.fillRect(
        0,
        rowTop,
        this.ctxLeftHeader.canvas.width,
        this.getValueInstance.getCellHeight(rowIndex)
      );
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

    this.canvasIns.drawGrid.drawgrid(
      this.canvasIns.numRows,
      this.canvasIns.numCols
    );
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

  mouseMove(e, header) {
    let rect = null;
    if (header == "topheader") {
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
    this.startingIndex = null;
    this.canvasIns = canvasIns;
    this.copy = false;

    this.lineDashOffset = 0;

    this.isAnimationRunning = false;

    this.coordinate = null;
    this.selectionDimensions = null;

    this.getValueInstance = new getValues(canvasIns);
    this.inputBox = document.getElementById("canvasinput");

    this.x1 = 0;
    this.y1 = 0;
    this.ctx.canvas.addEventListener("mousedown", (e) => {
      this.isAnimationRunning = false;
      this.inputBox.style.display = "none";
      this.canvasIns.clearCanvas();
      this.drawgrid(this.canvasIns.numRows, this.canvasIns.numCols);

      const rect = this.ctx.canvas.getBoundingClientRect();
      this.canvasIns.selection = true;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const colIndex = this.getValueInstance.getColumnIndex(clickX);
      const rowIndex = this.getValueInstance.getRowIndex(clickY);
      this.startingIndex = [
        this.getValueInstance.getColumnIndex(clickX),
        this.getValueInstance.getRowIndex(clickY),
      ];

      this.x1 = 0;
      this.y1 = 0;
      this.x1Index = this.getValueInstance.getColumnIndex(clickX);
      this.y1Index = this.getValueInstance.getRowIndex(clickY);
      this.x2Index = this.x1Index;
      this.y2Index = this.y1Index;
      for (let i = 0; i < this.x1Index; i++) {
        this.x1 += this.getValueInstance.getCellWidth(i);
      }
      for (let i = 0; i < this.y1Index; i++) {
        this.y1 += this.getValueInstance.getCellHeight(i);
      }

      // Determine dimensions of selection
      const startX = Math.min(this.startingIndex[0], colIndex);
      const startY = Math.min(this.startingIndex[1], rowIndex);
      const endX = Math.max(this.startingIndex[0], colIndex);
      const endY = Math.max(this.startingIndex[1], rowIndex);

      this.selectionDimensions = [startX, startY, endX, endY];
      this.drawHighlight();
    });

    this.ctx.canvas.addEventListener("mousemove", (e) => {
      if (this.canvasIns.selection) {
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
      this.canvasIns.selection = false;
    });

    this.ctx.canvas.addEventListener("mouseleave", (e) => {
      this.canvasIns.selection = false;
    });

    this.ctx.canvas.addEventListener("dblclick", (e) => {
      this.inputBox.style.display = "block";
      this.inputBox.style.top = `${this.y1}px`;
      0;
      this.inputBox.style.left = `${this.x1}px`;
      this.inputBox.style.height = `${this.getValueInstance.getCellHeight(
        this.y1Index
      )}px`;
      this.inputBox.style.width = `${this.getValueInstance.getCellWidth(
        this.x1Index
      )}px`;
      this.inputBox.focus();
    });

    document.addEventListener("keydown", (event) => {
      this.inputBoxFun(event);
    });
  }

  inputBoxFun(e) {
    if (e.ctrlKey && e.key === "c") {
      const [x, y, width, height] = this.coordinate;
      this.isAnimationRunning = true;
      this.startMarchingAntsAnimation(x, y, width, height);
    } else if (e.shiftKey && e.key === "ArrowDown") {
      this.y2Index = this.y2Index + 1;
      if (this.y1Index >= this.y2Index) {
        this.selectionDimensions = [
          this.x1Index,
          this.y2Index,
          this.x2Index,
          this.y1Index,
        ];
      } else {
        this.selectionDimensions = [
          this.x1Index,
          this.y1Index,
          this.x2Index,
          this.y2Index,
        ];
      }
      this.drawHighlight();
    } else if (e.shiftKey && e.key === "ArrowUp") {
      this.y2Index = this.y2Index - 1;
      if (this.y1Index >= this.y2Index) {
        this.selectionDimensions = [
          this.x1Index,
          this.y2Index,
          this.x2Index,
          this.y1Index,
        ];
      } else {
        this.selectionDimensions = [
          this.x1Index,
          this.y1Index,
          this.x2Index,
          this.y2Index,
        ];
      }
      this.drawHighlight();
    } else if (e.shiftKey && e.key === "ArrowRight") {
      this.x2Index = this.x2Index + 1;
      if (this.x1Index >= this.x2Index) {
        this.selectionDimensions = [
          this.x2Index,
          this.y1Index,
          this.x1Index,
          this.y2Index,
        ];
      } else {
        this.selectionDimensions = [
          this.x1Index,
          this.y1Index,
          this.x2Index,
          this.y2Index,
        ];
      }
      this.drawHighlight();
    } else if (e.shiftKey && e.key === "ArrowLeft") {
      this.x2Index = this.x2Index - 1;
      if (this.x1Index >= this.x2Index) {
        this.selectionDimensions = [
          this.x2Index,
          this.y1Index,
          this.x1Index,
          this.y2Index,
        ];
      } else {
        this.selectionDimensions = [
          this.x1Index,
          this.y1Index,
          this.x2Index,
          this.y2Index,
        ];
      }
      this.drawHighlight();
    } else if (e.key == "Enter" || e.key == "ArrowDown") {
      e.preventDefault();
      this.inputBox.blur();
      this.y1 += this.getValueInstance.getCellHeight(this.y1Index);
      this.y1Index = this.y1Index + 1;
      this.selectionDimensions = [
        this.x1Index,
        this.y1Index,
        this.x1Index,
        this.y1Index,
      ];
      this.drawHighlight();
    } else if (e.key == "ArrowUp" && this.y1Index >= 1) {
      e.preventDefault();
      this.inputBox.blur();
      this.y1 -= this.getValueInstance.getCellHeight(this.y1Index - 1);
      this.y1Index = this.y1Index - 1;
      this.selectionDimensions = [
        this.x1Index,
        this.y1Index,
        this.x1Index,
        this.y1Index,
      ];
      this.drawHighlight();
    } else if (e.key == "Tab" || e.key == "ArrowRight") {
      e.preventDefault();
      this.inputBox.blur();
      this.x1 += this.getValueInstance.getCellWidth(this.x1Index);
      this.x1Index = this.x1Index + 1;
      this.selectionDimensions = [
        this.x1Index,
        this.y1Index,
        this.x1Index,
        this.y1Index,
      ];
      this.drawHighlight();
    } else if (e.key == "ArrowLeft" && this.x1Index >= 1) {
      e.preventDefault();
      this.inputBox.blur();
      this.x1 -= this.getValueInstance.getCellWidth(this.x1Index - 1);
      this.x1Index = this.x1Index - 1;
      this.selectionDimensions = [
        this.x1Index,
        this.y1Index,
        this.x1Index,
        this.y1Index,
      ];
      this.drawHighlight();
    } else if (
      (e.key >= "a" && e.key <= "z") ||
      (e.key >= "0" && e.key <= "9")
    ) {
      this.inputBox.focus();
      this.drawHighlight();
    } else {
      this.y2Index = this.y1Index;
      this.x2Index = this.x1Index;
    }

    this.inputBox.style.display = "block";
    this.inputBox.style.top = `${this.y1}px`;
    0;
    this.inputBox.style.left = `${this.x1}px`;
    this.inputBox.style.height = `${this.getValueInstance.getCellHeight(
      this.y1Index
    )}px`;
    this.inputBox.style.width = `${this.getValueInstance.getCellWidth(
      this.x1Index
    )}px`;
  }

  startMarchingAntsAnimation(x, y, width, height) {
    if (this.isAnimationRunning == false) {
      return;
    }

    this.lineDashOffset = this.lineDashOffset - 0.5;
    if (this.lineDashOffset < 0) {
      this.lineDashOffset = 10;
    }

    this.canvasIns.clearCanvas();
    this.canvasIns.ctx.save();
    this.canvasIns.ctx.beginPath();
    this.canvasIns.ctx.setLineDash([5, 3]);
    this.canvasIns.ctx.lineDashOffset = this.lineDashOffset;
    this.canvasIns.ctx.fillStyle = "rgb(231,241,236)";
    this.canvasIns.ctx.fillRect(x, y, width, height);

    this.canvasIns.ctx.fillStyle = "#ffffff";
    this.canvasIns.ctx.fillRect(
      this.x1,
      this.y1,
      this.getValueInstance.getCellWidth(this.x1),
      this.getValueInstance.getCellHeight(this.y1)
    );

    this.canvasIns.ctx.lineWidth = 2;
    this.canvasIns.ctx.strokeStyle = "green";
    this.canvasIns.ctx.rect(x, y, width, height);

    this.canvasIns.ctx.stroke();
    this.canvasIns.ctx.restore();
    requestAnimationFrame(() =>
      this.startMarchingAntsAnimation(x, y, width, height)
    );
    this.highlightHeaders(x, y, width, height);
  }

  drawHighlight() {
    this.canvasIns.clearCanvas();
    const [startX, startY, endX, endY] = this.selectionDimensions;

    this.canvasIns.selectedCol = [startX, endX];
    this.canvasIns.selectedRow = [startY, endY];

    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getValueInstance.getCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getValueInstance.getCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getValueInstance.getCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getValueInstance.getCellHeight(i);
    }

    this.canvasIns.ctx.fillStyle = "rgb(231,241,236)";
    this.canvasIns.ctx.fillRect(x, y, width, height);

    this.canvasIns.ctx.fillStyle = "#ffffff";
    this.canvasIns.ctx.fillRect(
      this.x1,
      this.y1,
      this.getValueInstance.getCellWidth(this.x1),
      this.getValueInstance.getCellHeight(this.y1)
    );

    this.canvasIns.ctx.lineWidth = 2;
    this.canvasIns.ctx.strokeStyle = "rgb(16,124,65)";
    this.canvasIns.ctx.strokeRect(x, y, width, height);
    this.highlightHeaders(x, y, width, height);
  }

  highlightHeaders(x, y, width, height) {
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
    this.coordinate = [x, y, width, height];
    this.drawgrid(this.canvasIns.numRows, this.canvasIns.numCols);
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
      if (Array.isArray(this.canvasIns.selectedCol)) {
        if (
          this.canvasIns.selectedCol[0] <= i &&
          i <= this.canvasIns.selectedCol[1]
        ) {
          this.ctxTopHeader.save();
          this.ctxTopHeader.fillStyle = "rgb(16,124,65)";
          let text = this.convertToTitle(i + 1);
          cellPosition += this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
          let xPosition = cellPosition - (this.cellWidths.get(i) || 100) / 2;
          let yPosition = 15;
          this.ctxTopHeader.fillText(text, xPosition, yPosition + 1);
          this.ctxTopHeader.restore();
        } else {
          this.ctxTopHeader.save();
          let text = this.convertToTitle(i + 1);
          cellPosition += this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
          let xPosition = cellPosition - (this.cellWidths.get(i) || 100) / 2;
          let yPosition = 15;
          this.ctxTopHeader.fillText(text, xPosition, yPosition + 1);
          this.ctxTopHeader.restore();
        }
      } else if (this.canvasIns.selectedCol == i) {
        this.ctxTopHeader.save();
        this.ctxTopHeader.fillStyle = "white";
        let text = this.convertToTitle(i + 1);
        cellPosition += this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
        let xPosition = cellPosition - (this.cellWidths.get(i) || 100) / 2;
        let yPosition = 15;
        this.ctxTopHeader.font = "bold 16px Arial";
        this.ctxTopHeader.fillText(text, xPosition, yPosition + 1);
        this.ctxTopHeader.restore();
      } else if (this.canvasIns.selectedCol == "all") {
        this.ctxTopHeader.save();
        this.ctxTopHeader.fillStyle = "rgb(16,124,65)";
        let text = this.convertToTitle(i + 1);
        cellPosition += this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
        let xPosition = cellPosition - (this.cellWidths.get(i) || 100) / 2;
        let yPosition = 15;
        this.ctxTopHeader.fillText(text, xPosition, yPosition + 1);
        this.ctxTopHeader.restore();
      } else {
        this.ctxTopHeader.save();
        let text = this.convertToTitle(i + 1);
        cellPosition += this.cellWidths.get(i) ? this.cellWidths.get(i) : 100;
        let xPosition = cellPosition - (this.cellWidths.get(i) || 100) / 2;
        let yPosition = 15;
        this.ctxTopHeader.fillText(text, xPosition, yPosition + 1);
        this.ctxTopHeader.restore();
      }
    }
    this.canvasIns.selectedCol = null;
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
      if (Array.isArray(this.canvasIns.selectedRow)) {
        if (
          this.canvasIns.selectedRow[0] <= i &&
          i <= this.canvasIns.selectedRow[1]
        ) {
          this.ctxLeftHeader.save();
          cellPosition += this.cellHeight.get(i) || 21;
          let text = (i + 1).toString();
          let textWidth = this.ctxLeftHeader.measureText(text).width;
          let xPosition = this.ctxLeftHeader.canvas.width - textWidth - 10;
          let yPosition = cellPosition - (this.cellHeight.get(i) || 21) / 2;
          this.ctxLeftHeader.fillStyle = "rgb(16,124,65)";
          this.ctxLeftHeader.fillText(text, xPosition, yPosition + 4);
          this.ctxLeftHeader.restore();
        } else {
          cellPosition += this.cellHeight.get(i) || 21;
          let text = (i + 1).toString();
          let textWidth = this.ctxLeftHeader.measureText(text).width;
          let xPosition = this.ctxLeftHeader.canvas.width - textWidth - 10;
          let yPosition = cellPosition - (this.cellHeight.get(i) || 21) / 2;
          this.ctxLeftHeader.fillText(text, xPosition, yPosition + 4);
        }
      } else if (this.canvasIns.selectedRow == i) {
        this.ctxLeftHeader.save();
        cellPosition += this.cellHeight.get(i) || 21;
        let text = (i + 1).toString();
        let textWidth = this.ctxLeftHeader.measureText(text).width;
        this.ctxLeftHeader.font = "bold 14px Arial";
        let xPosition = this.ctxLeftHeader.canvas.width - textWidth - 10;
        let yPosition = cellPosition - (this.cellHeight.get(i) || 21) / 2;
        this.ctxLeftHeader.fillStyle = "white";
        this.ctxLeftHeader.fillText(text, xPosition, yPosition + 4);
        this.ctxLeftHeader.restore();
      } else if (this.canvasIns.selectedRow == "all") {
        this.ctxLeftHeader.save();
        cellPosition += this.cellHeight.get(i) || 21;
        let text = (i + 1).toString();
        let textWidth = this.ctxLeftHeader.measureText(text).width;
        let xPosition = this.ctxLeftHeader.canvas.width - textWidth - 10;
        let yPosition = cellPosition - (this.cellHeight.get(i) || 21) / 2;
        this.ctxLeftHeader.fillStyle = "rgb(16,124,65)";
        this.ctxLeftHeader.fillText(text, xPosition, yPosition + 4);
        this.ctxLeftHeader.restore();
      } else {
        cellPosition += this.cellHeight.get(i) || 21;
        let text = (i + 1).toString();
        let textWidth = this.ctxLeftHeader.measureText(text).width;

        let xPosition = this.ctxLeftHeader.canvas.width - textWidth - 10;
        let yPosition = cellPosition - (this.cellHeight.get(i) || 21) / 2;
        this.ctxLeftHeader.fillText(text, xPosition, yPosition + 4);
      }
    }
    this.canvasIns.selectedRow = null;
  }
}

new newCanvas("Sheet-1");
