class RowColumnManager {
    constructor(mainInst, mainCanvas, valueInst) {
        this.mainInst = mainInst;
        this.mainCanvas = mainCanvas;
        this.valueInst = valueInst;
        this.scale = 1;
        this.eventListner();
    }

    eventListner() {
        const contextmenu = document.getElementById("contextmenu");
        this.mainCanvas.addEventListener(
            "contextmenu",
            (e) => {
                e.preventDefault();
                let cellPositionLeft = 0;
                let cellPositionTop = 0;
                for (
                    let i = this.mainInst.scrollLeftvalue;
                    i < this.mainInst.x1CellIndex + 1;
                    i++
                ) {
                    cellPositionLeft += this.valueInst.getCurCellWidth(i);
                }
                for (
                    let i = this.mainInst.scrollTopvalue;
                    i < this.mainInst.y1CellIndex;
                    i++
                ) {
                    cellPositionTop += this.valueInst.getCurCellHeight(i);
                }
                contextmenu.style.display = "block";
                contextmenu.style.top = `${cellPositionTop}px`;
                contextmenu.style.left = `${cellPositionLeft}px`;
                return false;
            },
            false
        );
    }
}

export { RowColumnManager };
