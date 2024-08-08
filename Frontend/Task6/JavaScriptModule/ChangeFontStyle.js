class FontStyle {
  constructor(mainInst, highlightInst, sheetData, mainCtx, mainCanvas) {
    this.mainInst = mainInst;
    this.highlightInst = highlightInst;
    this.sheetData = sheetData;
    this.mainCtx = mainCtx;
    this.mainCanvas = mainCanvas;
  }

  changeFontColor() {
    var value = colorSelector.value;
    const [startX, startY] = this.mainInst.selectedDimensionsMain;
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
    // this.sheetData[startY][startY][startX]["properties"] = newValue;

    result[startY][startX].properties = newValue;
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.highlightInst.highlightSelectedArea();
    this.mainInst.drawGrid();
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
      const [startX, startY] = this.mainInst.selectedDimensionsMain;
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
      this.highlightInst.highlightSelectedArea();
      this.mainInst.drawGrid();
    });

    fontfamily.addEventListener("change", () => {
      var value = fontfamily.value;
      const [startX, startY] = this.mainInst.selectedDimensionsMain;
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
      this.highlightInst.highlightSelectedArea();
      this.mainInst.drawGrid();
    });

    fontbold.addEventListener("click", () => {
      let value = "";
      if (!fontbold.classList.contains("fontstyleactive")) {
        value = "bold";
      }
      fontbold.classList.toggle("fontstyleactive");

      const [startX, startY] = this.mainInst.selectedDimensionsMain;
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
      this.highlightInst.highlightSelectedArea();
      this.mainInst.drawGrid();
    });

    fontitalic.addEventListener("click", () => {
      let value = "";
      if (!fontitalic.classList.contains("fontstyleactive")) {
        value = "italic";
      }
      fontitalic.classList.toggle("fontstyleactive");

      const [startX, startY] = this.mainInst.selectedDimensionsMain;

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
      this.highlightInst.highlightSelectedArea();
      this.mainInst.drawGrid();
    });
  }

  getPos(str = "", subStr, i) {
    return [
      str.split(subStr, i).join(subStr).length,
      str.split(subStr, i + 1).join(subStr).length,
    ];
  }
}

export { FontStyle };
