class GetValues {
  constructor(mainIns, numCols, numRows, cellHeight, cellWidths) {
    this.mainIns = mainIns;
    this.numCols = numCols;
    this.numRows = numRows;
    this.defaultCellWidth = 100;
    this.defaultCellHeight = 21;
    this.cellHeight = cellHeight;
    this.cellWidths = cellWidths;
  }

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
    // console.log(x);

    let cellPosition = 0;
    for (let i = 0; i <= 10000; i++) {
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
    for (
      let i = 0;
      i <= 10000;
      i++
    ) {
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

export { GetValues };
