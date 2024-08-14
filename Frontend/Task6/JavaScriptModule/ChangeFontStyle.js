class FontStyle {
  /**
   * 
   * @param {object} mainInst 
   * @param {object} highlightInst 
   * @param {Array} sheetData 
   * @param {CanvasRenderingContext2D} mainCtx 
   * @param {HTMLCanvasElement} mainCanvas 
   */
    constructor(mainInst, highlightInst, sheetData, mainCtx, mainCanvas) {
        this.mainInst = mainInst;
        this.highlightInst = highlightInst;
        this.sheetData = sheetData;
        this.mainCtx = mainCtx;
        this.mainCanvas = mainCanvas;

        this.eventListenersFun();
    }

    /**
     * Event Listners for font style change
     */
    eventListenersFun() {
        const fontsize = document.getElementById("fontsize");
        const fontfamily = document.getElementById("fontfamily");
        const fontbold = document.getElementById("fontbold");
        const fontitalic = document.getElementById("fontitalic");
        const openColorPalette = document.getElementById("openColorPalette");
        const colorSelector = document.getElementById("colorSelector");
        const fontUnderline = document.querySelector(".fontColor p");

        openColorPalette.addEventListener("click", () => {
            colorSelector.click();
        });
        fontUnderline.addEventListener("click", () => {
            var value = colorSelector.value;
            fontUnderline.style.borderColor = value;
            this.updateFontProperty("fontcolor", value);
        });
        colorSelector.addEventListener("change", () => {
            var value = colorSelector.value;
            fontUnderline.style.borderColor = value;
            this.updateFontProperty("fontcolor", value);
        });

        fontsize.addEventListener("change", () =>
            this.updateFontProperty("fontsize", fontsize.value)
        );
        fontfamily.addEventListener("change", () =>
            this.updateFontProperty("fontfamily", fontfamily.value)
        );

        fontbold.addEventListener("click", () =>
            this.toggleFontProperty("bold", fontbold)
        );
        fontitalic.addEventListener("click", () =>
            this.toggleFontProperty("italic", fontitalic)
        );
    }

    /**
     * returns the index position for a property type
     * @param {string} type - the type of property(eg, fontsize, fontfamily, bold, italic)
     * @returns {number} the index position for the property
     */
    propertyIndex(type) {
        const propertyInd = {
            fontsize: 4,
            fontfamily: 5,
            bold: 3,
            italic: 2,
            fontcolor: 1,
        };
        return propertyInd[type] || 0;
    }

    /**
     * 
     * @param {string} type 
     * @param {string} [value=""] 
     */
    updateFontProperty(type, value = "") {
        const [startX, startY] = this.mainInst.selectedDimensionsMain;
        const result = this.sheetData.find((item) => item[startY]);
        let currentData = result[startY][startX];
        let properties = currentData?.properties;
        let Pos = this.getPos(properties, "*", this.propertyIndex(type));
        let oldVal = properties.slice(Pos[0] + 1, Pos[1]);
        let newValue =
            oldVal === ""
                ? properties.slice(0, Pos[0] + 1) +
                  value +
                  properties.slice(Pos[0] + 1)
                : properties.replace(oldVal, value);
        result[startY][startX].properties = newValue;

        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.mainInst.drawGrid();
    }

    /**
     * 
     * @param {string} type 
     * @param {HTMLElement} ele 
     */
    toggleFontProperty(type, ele) {
        let isActive = ele.classList.toggle("fontstyleactive");
        this.updateFontProperty(type, isActive ? type : "");
    }

    /**
     * 
     * @param {string} str 
     * @param {string} subStr 
     * @param {number} i 
     * @returns {[number, number]}
     */
    getPos(str = "", subStr, i) {
        return [
            str.split(subStr, i).join(subStr).length,
            str.split(subStr, i + 1).join(subStr).length,
        ];
    }
}

export { FontStyle };
