/**
 * To change font property
 */

class FontStyle {
    /**
     *
     * @param {object} mainInst
     * @param {Array} sheetData
     */
    constructor(mainInst, sheetData) {
        this.mainInst = mainInst;
        this.sheetData = sheetData;

        this.changeFontPropertyEventListner();
    }

    /**
     * Event Listners for font style change
     */
    changeFontPropertyEventListner() {
        const fontsizeInput = document.getElementById("fontsize");
        const fontfamilyInput = document.getElementById("fontfamily");
        const fontboldButton = document.getElementById("fontbold");
        const fontitalicButton = document.getElementById("fontitalic");
        const openColorPalette = document.getElementById("openColorPalette");
        const colorSelectorInput = document.getElementById("colorSelector");
        const fontUnderlineElement = document.querySelector(".fontColor p");

        openColorPalette.addEventListener("click", () => {
            colorSelectorInput.click();
        });
        fontUnderlineElement.addEventListener("click", () => {
            var value = colorSelectorInput.value;
            fontUnderlineElement.style.borderColor = value;
            this.updateFontProperty("fontcolor", value);
        });
        colorSelectorInput.addEventListener("change", () => {
            var value = colorSelectorInput.value;
            fontUnderlineElement.style.borderColor = value;
            this.updateFontProperty("fontcolor", value);
        });

        fontsizeInput.addEventListener("change", () =>
            this.updateFontProperty("fontsize", fontsizeInput.value)
        );
        fontfamilyInput.addEventListener("change", () =>
            this.updateFontProperty("fontfamily", fontfamilyInput.value)
        );

        fontboldButton.addEventListener("click", () =>
            this.toggleFontProperty("bold", fontboldButton)
        );
        fontitalicButton.addEventListener("click", () =>
            this.toggleFontProperty("italic", fontitalicButton)
        );
    }

    /**
     * returns the index position for a property type
     * @param {string} propertyType - the type of property(eg, fontsize, fontfamily, bold, italic)
     * @returns {number} - the index position for the property
     */
    getPropertyIndex(propertyType) {
        const propertyIndices = {
            fontsize: 4,
            fontfamily: 5,
            bold: 3,
            italic: 2,
            fontcolor: 1,
        };
        return propertyIndices[propertyType] || 0;
    }

    /**
     * Updates the font property for the selected area
     * @param {string} propertyType - the type of property(eg, fontsize, fontfamily, bold, italic)
     * @param {string} [newValue=""]
     */
    updateFontProperty(propertyType, newValue = "") {
        const [startX, startY, endX, endY] =
            this.mainInst.selectedDimensionsMain;

        for (let row = startY; row <= endY; row++) {
            const result = this.sheetData.find((item) => item[row + 1]);

            for (let col = startX; col <= endX; col++) {
                let cellData = result[row + 1][col];
                let properties = cellData?.properties;
                let position = this.getPosition(
                    properties,
                    this.getPropertyIndex(propertyType)
                );
                let oldValue = properties.slice(position[0] + 1, position[1]);
                let updatedValue =
                    oldValue === ""
                        ? properties.slice(0, position[0] + 1) +
                          newValue +
                          properties.slice(position[0] + 1)
                        : properties.replace(oldValue, newValue);
                result[row + 1][col].properties = updatedValue;
            }
        }
        this.mainInst.clearMainCanvas();
        this.mainInst.drawGrid();
    }

    /**
     * Toggle a font property between active and inactive states.
     * @param {string} propertyType - the type of property(eg, fontsize, fontfamily, bold, italic)
     * @param {HTMLElement} element
     */
    toggleFontProperty(propertyType, element) {
        let isActive = element.classList.toggle("fontstyleactive");
        this.updateFontProperty(propertyType, isActive ? propertyType : "");
    }

    /**
     * Gets the position of a particular property by using indexPosition
     * @param {string} properties
     * @param {number} index
     * @returns {[number, number]}
     */
    getPosition(properties = "", index) {
        return [
            properties.split("*", index).join("*").length,
            properties.split("*", index + 1).join("*").length,
        ];
    }
}

export { FontStyle };
