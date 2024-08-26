import { MakeChart } from "./JavaScriptModule/Chart.js";
import { GetValues } from "./JavaScriptModule/GetValues.js";
import { DrawHighlight } from "./JavaScriptModule/DrawHighLight.js";
import { FontStyle } from "./JavaScriptModule/ChangeFontStyle.js";
import { ResizeGrid } from "./JavaScriptModule/ResizeGrid.js";
import { CopyPaste } from "./JavaScriptModule/CopyPaste.js";

//infinite scrolling
class newCanvas {
    constructor(sheetName) {
        // this.sheetData = sheetData;
        this.sheetName = sheetName;
        this.sheetData = [];
        this.prevOffset = -1;
        this.progressbarEle = document.getElementById("progressbarEle");
        this.intervalid = setInterval(this.fetchProgress, 100);

        this.inputBox = document.getElementById("canvasinput");
        this.scale = window.devicePixelRatio;

        // window.addEventListener("resize", () => {
        //     location.reload();
        // });

        this.createNewCanvas();

        this.initialVariables();

        this.valueInst = new GetValues(this);

        this.inputBoxPosition();

        this.highlightInst = new DrawHighlight(
            this,
            this.mainCtx,
            this.leftHeaderCtx,
            this.topHeaderCtx,
            this.selectedDimensionsMain,
            this.valueInst,
            this.inputBox,
            this.inputBoxPosition,
            this.drawGrid,
            this.sheetData
        );

        this.highlightInst.highlightSelectedAreaEvents();
        this.highlightInst.highlightSelectedArea();

        this.copyPasteInst = new CopyPaste(
            this,
            this.mainCtx,
            this.highlightInst,
            this.valueInst
        );

        this.resizeGridInst = new ResizeGrid(
            this,
            this.valueInst,
            this.highlightInst,
            this.copyPasteInst
        );
        this.resizeGridInst.resizeGridEvents();

        this.inputBox.style.display = "none";
        document.addEventListener("keydown", (event) => {
            const editingSectionModal = document.querySelector(
                ".editingSectionModal"
            );
            if (
                editingSectionModal.style.display == "" ||
                editingSectionModal.style.display == "none"
            ) {
                this.keyBoardEvents(event);
            }
        });

        this.drawGrid();
        this.renderLeftHeader();
        this.renderTopHeader();
        this.fontStyleInst = new FontStyle(this, this.sheetData);

        const findtextInput = document.querySelector("#findtextInput");
        const replacetextInput = document.querySelector("#replacetextInput");
        const replaceAllFun = document.querySelector("#replaceAllFun");
        replaceAllFun.addEventListener("click", () => {
            let findText = findtextInput.value;
            let replaceText = replacetextInput.value;
            this.findAndReplace(findText, replaceText);
        });

        const topleft = document.getElementById("topleft");
        topleft.addEventListener("click", () => {
            this.x1CellIndex = 0;
            this.y1CellIndex = 0;
            this.topheaderSelected = true;
            this.leftheaderSelected = true;

            this.isColSelected = true;
            this.isRowSelected = true;

            this.currSelectedCol = [0, 100];
            this.currSelectedRow = [0, 100];

            this.selectedDimensionsMain = [0, 0, 200, 200];
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.renderLeftHeader();
            this.renderTopHeader();
        });

        //charts
        var charts = document.querySelectorAll(".chart");
        this.chartInst = new MakeChart(this, this.mainCanvas, this.sheetData);
        this.chartArray = [];

        Array.from(charts).forEach((chart) => {
            chart.addEventListener("click", (e) => {
                let chartType = e.target.htmlFor
                    ? e.target.htmlFor
                    : e.target.id;
                this.chartInst.drawChart(
                    chartType,
                    this.selectedDimensionsMain
                );
            });
        });

        this.scrollFunction();
    }

    fetchProgress = async () => {
        try {
            const response = await fetch(
                `http://localhost:5022/api/Employee/GetProgress`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            let percentage =
                (data[0].currentchunks / data[0].totalchunks) * 100;
            this.progressbarEle.value = percentage;
            if (percentage > 0) {
                this.progressbarEle.style.display = "block";
            }
            if (percentage == 100) {
                this.progressbarEle.style.display = "none";
                clearInterval(this.intervalid);
                this.fetchUserData(0);
            }
        } catch (error) {
            clearInterval(this.intervalid);
        }
    };

    fetchUserData = async (offset = 0) => {
        const response = await fetch(
            `http://localhost:5022/api/Employee?offset=${offset}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();
        let sheetData = this.convertJsonData(data);

        this.sheetData.push(...sheetData);
        sheetData = [];
        this.renderData();
        return sheetData;
    };

    convertJsonData = (data) => {
        const result = [];
        if (data.length > 0) {
            const keys = Object.keys(data[0]);
            data.forEach((item, index) => {
                const formattedItem = {};
                keys.forEach((key, idx) => {
                    if (key != "RowNo" && key != "id") {
                        formattedItem[idx - 2] = {
                            data: item[key],
                            properties: "*****",
                        };
                    }
                });
                result.push({ [item["RowNo"]]: formattedItem });
            });
        }
        return result;
    };

    initialVariables() {
        /**
         * current vertical scroll position
         * @type {number}
         */
        this.scrollTopvalue = 0;

        /**
         * current horizontal scroll position
         * @type {number}
         */
        this.scrollLeftvalue = 0;

        /**
         * color used to highlight text from top header and left header of selected area
         * and border of selected area
         * @type {string} -
         */
        this.strokeColor = "rgb(16,124,65)";

        /**
         * gray color used for draw rows and columns
         * @type {string}
         */
        this.gridStrokeColor = "rgb(128, 128, 128)";

        /**
         * color used when user selected particular column or row
         * @type {string}
         */
        this.whiteColor = "rgb(255, 255, 255)";

        /**
         * Index of current selected columns
         * @type {Array | null | number | string}
         */
        this.currSelectedCol = null;

        /**
         * Index of current selected row
         * @type {Array | null | number | string}
         */
        this.currSelectedRow = null;

        /**
         * Indicates whether a column is selected.
         * @type {boolean}
         */
        this.isColSelected = false;

        /**
         * Indicates whether a row is selected.
         * @type {boolean}
         */
        this.isRowSelected = false;

        /**
         * Index of the top-left cell in the current selection.
         * @type {number}
         */
        this.x1CellIndex = 0;

        /**
         * Index of the bottom-right cell in the current selection.
         * @type {number}
         */
        this.x2CellIndex = 0;

        /**
         * Index of the top-left cell in the current selection (vertical).
         * @type {number}
         */
        this.y1CellIndex = 0;

        /**
         * Index of the bottom-right cell in the current selection (vertical).
         * @type {number}
         */
        this.y2CellIndex = 0;

        /**
         * Input Cell position from Top
         * @type {number}
         */
        this.cellPositionTop = 0;

        /**
         * Input Cell position from Left
         * @type {number}
         */
        this.cellPositionLeft = 0;

        /**
         * Indicates whether the top header is selected.
         * @type {boolean}
         */
        this.topheaderSelected = false;

        /**
         * Indicates whether the left header is selected.
         * @type {boolean}
         */
        this.leftheaderSelected = false;

        /**
         * coordinates of the selected area [startX,startY,endX,endY]
         * @type {number[]}
         */
        this.selectedDimensionsMain = [0, 0, 0, 0];

        /**
         * Indicates whether the marching ants animation is running.
         * @type {boolean}
         */
        this.isAnimationRunning = false;

        /**
         * Indicates whether the animation should cover the full column.
         * @type {boolean}
         */
        this.animateFullColumn = false;

        /**
         * Indicates whether the animation should cover the full row.
         * @type {boolean}
         */
        this.animateFullRow = false;

        /**
         * Indicates whether the left area is selected.
         * @type {boolean}
         */
        this.isLeftAreaSelected = false;

        /**
         * Indicates whether the Top area is selected.
         * @type {boolean}
         */
        this.isTopAreaSelected = false;

        /**
         * Reference to the vertical resize line element.
         * @type {HTMLElement}
         */
        this.resizeLineVertical = document.getElementById("resizeLineVertical");

        /**
         * Reference to the horizontal resize line element.
         * @type {HTMLElement}
         */
        this.resizeLineHorizontal = document.getElementById(
            "resizeLineHorizontal"
        );

        // this.sheetData = [
        //   {
        //     30: {
        //       0: { data: "name", properties: "*****" },
        //       1: { data: "Country", properties: "*****" },
        //       2: { data: "City", properties: "*****" },
        //       3: { data: "telephone_number", properties: "*****" },
        //       4: { data: "DOB", properties: "*****" },
        //       5: { data: "FY2019-20", properties: "*****" },
        //       6: { data: "FY2020-21", properties: "*****" },
        //       7: { data: "FY2021-22", properties: "*****" },
        //       8: { data: "FY2022-23", properties: "*****" },
        //       9: { data: "FY2023-24", properties: "*****" },
        //     },
        //   },
        //   {
        //     1: {
        //       0: { data: "Emily FQbt6", properties: "*****" },
        //       1: { data: "Australia", properties: "*****" },
        //       2: { data: "Houston", properties: "*****" },
        //       3: { data: "5457952956", properties: "*****" },
        //       4: { data: "1/10/1988", properties: "*****" },
        //       5: { data: "71987", properties: "*****" },
        //       6: { data: "74470", properties: "*****" },
        //       7: { data: "118674", properties: "*****" },
        //       8: { data: "111997", properties: "*****" },
        //       9: { data: "52402", properties: "*****" },
        //     },
        //   },
        //   {
        //     2: {
        //       0: { data: "Jane OZUPM", properties: "*****" },
        //       1: { data: "Germany", properties: "*****" },
        //       2: { data: "New York", properties: "*****" },
        //       3: { data: "3553305164", properties: "*****" },
        //       4: { data: "4/15/1987", properties: "*****" },
        //       5: { data: "137336", properties: "*****" },
        //       6: { data: "41923", properties: "*****" },
        //       7: { data: "80143", properties: "*****" },
        //       8: { data: "87229", properties: "*****" },
        //       9: { data: "73409", properties: "*****" },
        //     },
        //   },
        //   {
        //     3: {
        //       0: { data: "Katie HyTYR", properties: "*****" },
        //       1: { data: "UK", properties: "*****" },
        //       2: { data: "Chicago", properties: "*****" },
        //       3: { data: "669768290", properties: "*****" },
        //       4: { data: "4/6/1957", properties: "*****" },
        //       5: { data: "140482", properties: "*****" },
        //       6: { data: "92176", properties: "*****" },
        //       7: { data: "73337", properties: "*****" },
        //       8: { data: "66622", properties: "*****" },
        //       9: { data: "147714", properties: "*****" },
        //     },
        //   },
        //   {
        //     4: {
        //       0: { data: "Katie aJetY", properties: "*****" },
        //       1: { data: "UK", properties: "*****" },
        //       2: { data: "Los Angeles", properties: "*****" },
        //       3: { data: "8141480576", properties: "*****" },
        //       4: { data: "5/16/1951", properties: "*****" },
        //       5: { data: "140968", properties: "*****" },
        //       6: { data: "116895", properties: "*****" },
        //       7: { data: "145380", properties: "*****" },
        //       8: { data: "75615", properties: "*****" },
        //       9: { data: "122402", properties: "*****" },
        //     },
        //   },
        //   {
        //     5: {
        //       0: { data: "Jane jGX3L", properties: "*****" },
        //       1: { data: "Germany", properties: "*****" },
        //       2: { data: "New York", properties: "*****" },
        //       3: { data: "353482959", properties: "*****" },
        //       4: { data: "11/6/1974", properties: "*****" },
        //       5: { data: "75468", properties: "*****" },
        //       6: { data: "58173", properties: "*****" },
        //       7: { data: "133088", properties: "*****" },
        //       8: { data: "146254", properties: "*****" },
        //       9: { data: "94909", properties: "*****" },
        //     },
        //   },
        //   {
        //     6: {
        //       0: { data: "Chris 9Rdzx", properties: "*****" },
        //       1: { data: "USA", properties: "*****" },
        //       2: { data: "New York", properties: "*****" },
        //       3: { data: "4041565147", properties: "*****" },
        //       4: { data: "10/14/1976", properties: "*****" },
        //       5: { data: "51297", properties: "*****" },
        //       6: { data: "76342", properties: "*****" },
        //       7: { data: "52802", properties: "*****" },
        //       8: { data: "41781", properties: "*****" },
        //       9: { data: "148994", properties: "*****" },
        //     },
        //   },
        //   {
        //     7: {
        //       0: { data: "Katie X3Gx5", properties: "*****" },
        //       1: { data: "UK", properties: "*****" },
        //       2: { data: "Phoenix", properties: "*****" },
        //       3: { data: "3469563819", properties: "*****" },
        //       4: { data: "2/16/1972", properties: "*****" },
        //       5: { data: "82928", properties: "*****" },
        //       6: { data: "75816", properties: "*****" },
        //       7: { data: "61833", properties: "*****" },
        //       8: { data: "65611", properties: "*****" },
        //       9: { data: "50962", properties: "*****" },
        //     },
        //   },
        //   {
        //     8: {
        //       0: { data: "Katie Bktxk", properties: "*****" },
        //       1: { data: "Australia", properties: "*****" },
        //       2: { data: "Los Angeles", properties: "*****" },
        //       3: { data: "2712084976", properties: "*****" },
        //       4: { data: "1/20/1999", properties: "*****" },
        //       5: { data: "144688", properties: "*****" },
        //       6: { data: "38226", properties: "*****" },
        //       7: { data: "139676", properties: "*****" },
        //       8: { data: "83774", properties: "*****" },
        //       9: { data: "64938", properties: "*****" },
        //     },
        //   },
        //   {
        //     9: {
        //       0: { data: "Emily LPuzu", properties: "*****" },
        //       1: { data: "Germany", properties: "*****" },
        //       2: { data: "Phoenix", properties: "*****" },
        //       3: { data: "9893149547", properties: "*****" },
        //       4: { data: "12/27/1973", properties: "*****" },
        //       5: { data: "63291", properties: "*****" },
        //       6: { data: "76657", properties: "*****" },
        //       7: { data: "69692", properties: "*****" },
        //       8: { data: "105696", properties: "*****" },
        //       9: { data: "70419", properties: "*****" },
        //     },
        //   },
        //   {
        //     10: {
        //       0: { data: "Jane zngX4", properties: "*****" },
        //       1: { data: "USA", properties: "*****" },
        //       2: { data: "Houston", properties: "*****" },
        //       3: { data: "273436682", properties: "*****" },
        //       4: { data: "8/28/1984", properties: "*****" },
        //       5: { data: "133321", properties: "*****" },
        //       6: { data: "114253", properties: "*****" },
        //       7: { data: "111180", properties: "*****" },
        //       8: { data: "141386", properties: "*****" },
        //       9: { data: "71835", properties: "*****" },
        //     },
        //   },
        //   {
        //     11: {
        //       0: { data: "Alex kXRmf", properties: "*****" },
        //       1: { data: "UK", properties: "*****" },
        //       2: { data: "Houston", properties: "*****" },
        //       3: { data: "2148165184", properties: "*****" },
        //       4: { data: "11/17/1972", properties: "*****" },
        //       5: { data: "88439", properties: "*****" },
        //       6: { data: "44598", properties: "*****" },
        //       7: { data: "112272", properties: "*****" },
        //       8: { data: "39311", properties: "*****" },
        //       9: { data: "83349", properties: "*****" },
        //     },
        //   },
        //   {
        //     12: {
        //       0: { data: "Emily 9kjPw", properties: "*****" },
        //       1: { data: "USA", properties: "*****" },
        //       2: { data: "Houston", properties: "*****" },
        //       3: { data: "1313221870", properties: "*****" },
        //       4: { data: "1/10/1997", properties: "*****" },
        //       5: { data: "137643", properties: "*****" },
        //       6: { data: "67790", properties: "*****" },
        //       7: { data: "88627", properties: "*****" },
        //       8: { data: "124546", properties: "*****" },
        //       9: { data: "44625", properties: "*****" },
        //     },
        //   },
        //   {
        //     13: {
        //       0: { data: "Emily va43C", properties: "*****" },
        //       1: { data: "USA", properties: "*****" },
        //       2: { data: "Chicago", properties: "*****" },
        //       3: { data: "7089910029", properties: "*****" },
        //       4: { data: "10/28/1991", properties: "*****" },
        //       5: { data: "108629", properties: "*****" },
        //       6: { data: "59682", properties: "*****" },
        //       7: { data: "47352", properties: "*****" },
        //       8: { data: "140016", properties: "*****" },
        //       9: { data: "45580", properties: "*****" },
        //     },
        //   },
        //   {
        //     14: {
        //       0: { data: "Chris P8cHX", properties: "*****" },
        //       1: { data: "Australia", properties: "*****" },
        //       2: { data: "Phoenix", properties: "*****" },
        //       3: { data: "8052835565", properties: "*****" },
        //       4: { data: "3/29/1973", properties: "*****" },
        //       5: { data: "69460", properties: "*****" },
        //       6: { data: "138752", properties: "*****" },
        //       7: { data: "95032", properties: "*****" },
        //       8: { data: "119769", properties: "*****" },
        //       9: { data: "66099", properties: "*****" },
        //     },
        //   },
        //   {
        //     15: {
        //       0: { data: "Chris TeV18", properties: "*****" },
        //       1: { data: "USA", properties: "*****" },
        //       2: { data: "New York", properties: "*****" },
        //       3: { data: "1284070085", properties: "*****" },
        //       4: { data: "1/9/1989", properties: "*****" },
        //       5: { data: "146852", properties: "*****" },
        //       6: { data: "94918", properties: "*****" },
        //       7: { data: "102026", properties: "*****" },
        //       8: { data: "82699", properties: "*****" },
        //       9: { data: "91803", properties: "*****" },
        //     },
        //   },
        //   {
        //     16: {
        //       0: { data: "Katie 0LpNB", properties: "*****" },
        //       1: { data: "Germany", properties: "*****" },
        //       2: { data: "Los Angeles", properties: "*****" },
        //       3: { data: "3148045878", properties: "*****" },
        //       4: { data: "2/19/1951", properties: "*****" },
        //       5: { data: "50021", properties: "*****" },
        //       6: { data: "135559", properties: "*****" },
        //       7: { data: "98509", properties: "*****" },
        //       8: { data: "34825", properties: "*****" },
        //       9: { data: "120590", properties: "*****" },
        //     },
        //   },
        //   {
        //     17: {
        //       0: { data: "Katie csnVg", properties: "*****" },
        //       1: { data: "Canada", properties: "*****" },
        //       2: { data: "New York", properties: "*****" },
        //       3: { data: "3777400485", properties: "*****" },
        //       4: { data: "3/3/1992", properties: "*****" },
        //       5: { data: "105875", properties: "*****" },
        //       6: { data: "133601", properties: "*****" },
        //       7: { data: "133361", properties: "*****" },
        //       8: { data: "35466", properties: "*****" },
        //       9: { data: "45354", properties: "*****" },
        //     },
        //   },
        //   {
        //     18: {
        //       0: { data: "Emily wB02d", properties: "*****" },
        //       1: { data: "Australia", properties: "*****" },
        //       2: { data: "New York", properties: "*****" },
        //       3: { data: "2166261664", properties: "*****" },
        //       4: { data: "9/29/1997", properties: "*****" },
        //       5: { data: "48985", properties: "*****" },
        //       6: { data: "82031", properties: "*****" },
        //       7: { data: "149330", properties: "*****" },
        //       8: { data: "48564", properties: "*****" },
        //       9: { data: "88813", properties: "*****" },
        //     },
        //   },
        //   {
        //     19: {
        //       0: { data: "Alex Yl4Br", properties: "*****" },
        //       1: { data: "Germany", properties: "*****" },
        //       2: { data: "Phoenix", properties: "*****" },
        //       3: { data: "1807641952", properties: "*****" },
        //       4: { data: "12/21/1971", properties: "*****" },
        //       5: { data: "44762", properties: "*****" },
        //       6: { data: "107977", properties: "*****" },
        //       7: { data: "86407", properties: "*****" },
        //       8: { data: "142413", properties: "*****" },
        //       9: { data: "107080", properties: "*****" },
        //     },
        //   },
        //   {
        //     20: {
        //       0: { data: "Jane SviWc", properties: "*****" },
        //       1: { data: "Australia", properties: "*****" },
        //       2: { data: "New York", properties: "*****" },
        //       3: { data: "5823155588", properties: "*****" },
        //       4: { data: "1/4/1982", properties: "*****" },
        //       5: { data: "71502", properties: "*****" },
        //       6: { data: "69496", properties: "*****" },
        //       7: { data: "45688", properties: "*****" },
        //       8: { data: "32109", properties: "*****" },
        //       9: { data: "51437", properties: "*****" },
        //     },
        //   },
        //   {
        //     21: {
        //       0: { data: "John 2avKM", properties: "*****" },
        //       1: { data: "Australia", properties: "*****" },
        //       2: { data: "Houston", properties: "*****" },
        //       3: { data: "2810470697", properties: "*****" },
        //       4: { data: "9/18/1967", properties: "*****" },
        //       5: { data: "112105", properties: "*****" },
        //       6: { data: "147949", properties: "*****" },
        //       7: { data: "80028", properties: "*****" },
        //       8: { data: "124944", properties: "*****" },
        //       9: { data: "130148", properties: "*****" },
        //     },
        //   },
        //   {
        //     22: {
        //       0: { data: "John 7uHEq", properties: "*****" },
        //       1: { data: "Canada", properties: "*****" },
        //       2: { data: "Houston", properties: "*****" },
        //       3: { data: "2570504167", properties: "*****" },
        //       4: { data: "5/22/1964", properties: "*****" },
        //       5: { data: "59496", properties: "*****" },
        //       6: { data: "59145", properties: "*****" },
        //       7: { data: "47781", properties: "*****" },
        //       8: { data: "48746", properties: "*****" },
        //       9: { data: "131767", properties: "*****" },
        //     },
        //   },
        //   {
        //     23: {
        //       0: { data: "John xYSuW", properties: "*****" },
        //       1: { data: "UK", properties: "*****" },
        //       2: { data: "Chicago", properties: "*****" },
        //       3: { data: "8436891984", properties: "*****" },
        //       4: { data: "11/5/1993", properties: "*****" },
        //       5: { data: "84744", properties: "*****" },
        //       6: { data: "87399", properties: "*****" },
        //       7: { data: "50861", properties: "*****" },
        //       8: { data: "90180", properties: "*****" },
        //       9: { data: "113477", properties: "*****" },
        //     },
        //   },
        //   {
        //     24: {
        //       0: { data: "Alex gA8Rf", properties: "*****" },
        //       1: { data: "Germany", properties: "*****" },
        //       2: { data: "Chicago", properties: "*****" },
        //       3: { data: "8629339455", properties: "*****" },
        //       4: { data: "7/28/1978", properties: "*****" },
        //       5: { data: "58677", properties: "*****" },
        //       6: { data: "104221", properties: "*****" },
        //       7: { data: "119337", properties: "*****" },
        //       8: { data: "96312", properties: "*****" },
        //       9: { data: "98264", properties: "*****" },
        //     },
        //   },
        //   {
        //     25: {
        //       0: { data: "Emily BpTl3", properties: "*****" },
        //       1: { data: "UK", properties: "*****" },
        //       2: { data: "Chicago", properties: "*****" },
        //       3: { data: "9285496787", properties: "*****" },
        //       4: { data: "12/28/1977", properties: "*****" },
        //       5: { data: "132803", properties: "*****" },
        //       6: { data: "69595", properties: "*****" },
        //       7: { data: "50743", properties: "*****" },
        //       8: { data: "62194", properties: "*****" },
        //       9: { data: "76466", properties: "*****" },
        //     },
        //   },
        // ];
    }

    createNewCanvas() {
        //sheet canvas

        const main = document.getElementById("main");
        const scroller = document.getElementById("scroller");
        const mainCanvas = document.createElement("canvas");
        mainCanvas.setAttribute("id", this.sheetName);
        mainCanvas.setAttribute("class", "canvas");

        // mainCanvas.width = Math.floor(2100 * this.scale);
        // mainCanvas.width = Math.floor(1200 * this.scale);
        mainCanvas.height = (scroller.offsetHeight - 20) * this.scale;
        mainCanvas.width = (scroller.offsetWidth - 20) * this.scale;
        // mainCanvas.width = Math.floor(1200 * this.scale);
        // mainCanvas.height = (500 - 20) * this.scale;
        // mainCanvas.height = (main.offsetHeight - 20) * this.scale;
        main.appendChild(mainCanvas);
        this.mainCanvas = mainCanvas;
        this.mainCtx = this.mainCanvas.getContext("2d");
        this.mainCtx.scale(this.scale, this.scale);

        //topheader canvas
        const topHeader = document.getElementById("topHeader");
        const topHeaderCanvas = document.createElement("canvas");
        topHeaderCanvas.setAttribute("id", `topHeader-${this.sheetName}`);
        topHeaderCanvas.setAttribute("class", "topHeaderCanvas");
        topHeaderCanvas.width = Math.floor(2100 * this.scale);
        topHeaderCanvas.height = Math.floor(24 * this.scale);
        topHeader.appendChild(topHeaderCanvas);
        this.topHeaderCanvas = topHeaderCanvas;
        this.topHeaderCtx = this.topHeaderCanvas.getContext("2d");
        this.topHeaderCtx.scale(this.scale, this.scale);

        //leftheader canvas
        const leftHeader = document.getElementById("leftHeader");
        const leftHeaderCanvas = document.createElement("canvas");
        leftHeaderCanvas.setAttribute("id", `leftHeader-${this.sheetName}`);
        leftHeaderCanvas.setAttribute("class", "leftHeaderCanvas");
        leftHeaderCanvas.width = Math.floor(40 * this.scale);
        // leftHeaderCanvas.height = Math.floor(1200 * this.scale);
        leftHeaderCanvas.height = leftHeader.offsetHeight * this.scale;
        leftHeader.appendChild(leftHeaderCanvas);
        this.leftHeaderCanvas = leftHeaderCanvas;
        this.leftHeaderCtx = this.leftHeaderCanvas.getContext("2d");
        this.leftHeaderCtx.scale(this.scale, this.scale);

        this.mainCanvas.style.cursor = "cell";

        const topleftDiv = document.getElementById("topleftDiv");

        // main.style.top = `${24 * this.scale}px`;
        // main.style.marginLeft = `${40 * this.scale}px`;
        topHeader.style.height = `${24 * this.scale}px`;
        topHeader.style.zIndex = 100;
        topHeader.style.marginLeft = `${40 * this.scale}px`;
        leftHeader.style.marginTop = `${24 * this.scale}px`;
        topleftDiv.style.width = `${40 * this.scale}px`;
        topleftDiv.style.height = `${24 * this.scale}px`;
    }

    clearCanvas() {
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
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
    clearMainCanvas() {
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
    }
    clearTopHeader() {
        this.topHeaderCtx.clearRect(
            0,
            0,
            this.topHeaderCanvas.width,
            this.topHeaderCanvas.height
        );
    }

    clearLeftHeader() {
        this.leftHeaderCtx.clearRect(
            0,
            0,
            this.leftHeaderCanvas.width,
            this.leftHeaderCanvas.height
        );
    }

    inputBoxPosition() {
        this.inputBox.style.display = "block";
        this.inputBox.style.top = `${
            (this.cellPositionTop + 0.6) * this.scale
        }px`;
        0;
        this.inputBox.style.left = `${
            (this.cellPositionLeft + 0.6) * this.scale
        }px`;
        this.inputBox.style.height = `${
            (this.valueInst.getCurCellHeight(this.y1CellIndex) - 1.2) *
            this.scale
        }px`;
        this.inputBox.style.width = `${
            (this.valueInst.getCurCellWidth(this.x1CellIndex) - 1.2) *
            this.scale
        }px`;
    }

    findAndReplace(findText, replaceText) {
        console.log(findText, replaceText);
        
        this.sheetData.forEach((data) => {
            let i = Object.keys(data);
            let min = 0,
                max = 0;
            if (data[i]) {
                min = Object.keys(data[i])[0] || 0;
                max = Object.keys(data[i])[0] || 0;
                Object.keys(data[i]).forEach((ele) => {
                    min = Math.min(min, ele);
                    max = Math.max(max, ele);
                });
            }
            let result = this.sheetData.find((item) => item[i]);
            if (result) {
                for (let j = 0; j <= max && min != max; j++) {
                    let currData = data[i][j]?.data;
                    if (currData == findText) {
                        result[i][j].data = replaceText;
                    }
                }
            }
        });
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea();
        this.drawGrid();
    }

    //----------------------draw grid----------------------
    trimData(data, j, fontSize) {
        if (data == null) {
            return " ";
        }
        if (!isNaN(data)) {
            data = data.toString();
        }
        let cellwidth = this.valueInst.getCurCellWidth(j);
        let length = data.length;
        let textWidth = this.mainCtx.measureText(data).width;
        let newfontSize = fontSize.slice(0, -2);
        let length2 = (textWidth - cellwidth) / (newfontSize - 2);
        data = data.slice(0, length - length2 - 2);
        return data;
    }
    drawGrid(strokeColor = "", fillColor = "") {
        this.mainCtx.clearRect(
            0,
            0,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        this.highlightInst.highlightSelectedArea(strokeColor, fillColor);
        this.drawRows();
        this.drawColumns();
        this.renderData(strokeColor);
    }

    /**
     *
     * @param {String} str
     * @param {String} subStr
     * @param {number} i
     * @returns
     */

    getPos(str = "", subStr, i) {
        return [
            str.split(subStr, i).join(subStr).length,
            str.split(subStr, i + 1).join(subStr).length,
        ];
    }

    renderTopHeader(transparentColor = "") {
        this.topHeaderCtx.save();
        this.topHeaderCtx.beginPath();

        this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
        this.topHeaderCtx.moveTo(0, 24 - 0.5);
        this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24 - 0.5);
        this.topHeaderCtx.stroke();
        this.topHeaderCtx.restore();
        this.highlightInst.highlightTopHeader(transparentColor);

        this.topHeaderCtx.font = "10pt Arial";
        this.topHeaderCtx.textAlign = "center";

        const canvasHeight = this.mainCanvas.width;
        const colWidth = 100;

        const startCol = Math.floor(this.scrollLeftvalue / colWidth);
        const endCol = Math.ceil(
            (this.scrollLeftvalue + canvasHeight) / colWidth
        );

        let cellPositionX = -this.scrollLeftvalue % colWidth;

        for (let i = startCol; i <= endCol; i++) {
            cellPositionX += this.valueInst.getCurCellWidth(i);
            this.topHeaderCtx.save();
            this.topHeaderCtx.beginPath();
            this.topHeaderCtx.moveTo(cellPositionX + 0.5, 0);
            this.topHeaderCtx.lineTo(
                cellPositionX + 0.5,
                this.topHeaderCtx.canvas.height
            );

            if (
                this.topheaderSelected &&
                this.currSelectedCol[0] <= i &&
                i < this.currSelectedCol[1]
            ) {
                this.topHeaderCtx.strokeStyle = this.whiteColor;
                this.topHeaderCtx.lineWidth = 1;
            } else {
                this.topHeaderCtx.lineWidth = 0.2;
                this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
            }
            this.topHeaderCtx.stroke();
            this.topHeaderCtx.restore();
        }

        cellPositionX = -this.scrollLeftvalue % colWidth;
        for (let i = startCol; i <= endCol; i++) {
            cellPositionX += this.valueInst.getCurCellWidth(i);
            this.topHeaderCtx.save();
            let text = this.valueInst.convertNumToChar(i + 1);
            let xPosition =
                cellPositionX - this.valueInst.getCurCellWidth(i) / 2;
            let yPosition = 15;

            this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            if (transparentColor != "") {
                this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            } else if (Array.isArray(this.currSelectedCol)) {
                if (
                    this.topheaderSelected &&
                    this.currSelectedCol[0] <= i &&
                    i <= this.currSelectedCol[1]
                ) {
                    this.topHeaderCtx.font = "bold 16px Arial";
                    this.topHeaderCtx.fillStyle = this.whiteColor;
                } else if (
                    this.currSelectedCol[0] <= i &&
                    i <= this.currSelectedCol[1]
                ) {
                    this.topHeaderCtx.fillStyle = this.strokeColor;
                }
            } else if (this.currSelectedCol == i) {
                this.topHeaderCtx.fillStyle = this.whiteColor;
                this.topHeaderCtx.font = "bold 16px Arial";
            } else if (this.currSelectedCol == "all") {
                this.topHeaderCtx.fillStyle = this.strokeColor;
            } else {
                this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            }
            this.topHeaderCtx.fillText(text, xPosition, yPosition + 1);
            this.topHeaderCtx.restore();

            if (
                i == this.resizeGridInst.columnIndexAtDraggablepoint &&
                cellPositionX - this.resizeGridInst.columnDraggedPos >= 20
            ) {
                this.resizeLineVertical.style.top = 0;
                this.resizeLineVertical.style.left = `${
                    cellPositionX * this.scale
                }px`;
            }
        }
    }

    renderLeftHeader(transparentColor = "") {
        this.leftHeaderCtx.save();
        this.leftHeaderCtx.beginPath();
        this.leftHeaderCtx.moveTo(40 - 0.5, 0);
        this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
        this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
        this.leftHeaderCtx.stroke();
        this.leftHeaderCtx.restore();
        this.highlightInst.highlightLeftHeaders(transparentColor);

        const canvasHeight = this.mainCanvas.height;
        const rowHeight = this.valueInst.getCurCellHeight(0);
        const startRow = Math.floor(this.scrollTopvalue / rowHeight);
        const endRow = Math.ceil(
            (this.scrollTopvalue + canvasHeight) / rowHeight
        );
        let cellPosition = -this.scrollTopvalue % rowHeight;
        for (let i = startRow; i <= endRow; i++) {
            cellPosition += this.valueInst.getCurCellHeight(i);
            this.leftHeaderCtx.save();
            this.leftHeaderCtx.beginPath();
            this.leftHeaderCtx.moveTo(2, cellPosition + 0.5);
            this.leftHeaderCtx.lineTo(
                this.leftHeaderCtx.canvas.width,
                cellPosition + 0.5
            );

            if (
                this.leftheaderSelected &&
                this.currSelectedRow[0] <= i &&
                i < this.currSelectedRow[1]
            ) {
                this.leftHeaderCtx.lineWidth = 1;
                this.leftHeaderCtx.strokeStyle = this.whiteColor;
            } else {
                this.leftHeaderCtx.lineWidth = 0.2;
                this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
            }

            this.leftHeaderCtx.stroke();
            this.leftHeaderCtx.restore();
        }

        cellPosition = -this.scrollTopvalue % rowHeight;
        this.leftHeaderCtx.font = "14px Arial";
        for (let i = startRow; i <= endRow; i++) {
            cellPosition += this.valueInst.getCurCellHeight(i);
            this.leftHeaderCtx.save();
            let text = (i + 1).toString();
            let yPosition =
                cellPosition - this.valueInst.getCurCellHeight(i) / 2;

            this.leftHeaderCtx.fillStyle = this.gridStrokeColor;
            if (transparentColor != "") {
                this.topHeaderCtx.fillStyle = this.gridStrokeColor;
            } else if (Array.isArray(this.currSelectedRow)) {
                if (
                    this.leftheaderSelected &&
                    this.currSelectedRow[0] <= i &&
                    i <= this.currSelectedRow[1]
                ) {
                    this.leftHeaderCtx.font = "bold 14px Arial";
                    this.leftHeaderCtx.fillStyle = this.whiteColor;
                } else if (
                    this.currSelectedRow[0] <= i &&
                    i <= this.currSelectedRow[1]
                ) {
                    this.leftHeaderCtx.fillStyle = this.strokeColor;
                }
            } else if (this.currSelectedRow == i) {
                this.leftHeaderCtx.font = "bold 14px Arial";
                this.leftHeaderCtx.fillStyle = this.whiteColor;
            } else if (this.currSelectedRow == "all") {
                this.leftHeaderCtx.fillStyle = this.strokeColor;
            } else {
                this.leftHeaderCtx.fillStyle = this.gridStrokeColor;
            }
            this.leftHeaderCtx.textAlign = "right";
            this.leftHeaderCtx.fillText(text, 35, yPosition + 4);
            this.leftHeaderCtx.restore();

            if (
                i == this.resizeGridInst.rowIndexAtDraggablepoint &&
                cellPosition - this.resizeGridInst.rowDraggedPos > 10
            ) {
                this.resizeLineHorizontal.style.top = `${
                    cellPosition * this.scale
                }px`;
                this.resizeLineHorizontal.style.left = 0;
            }
        }
    }

    //----------------------Scroll Functionality----------------------

    renderData() {
        let i = 0;
        const canvasHeight = this.mainCanvas.height;
        const canvasWidth = this.mainCanvas.width;

        const rowHeight = this.valueInst.getCurCellHeight(0);
        const colWidth = 100;

        const startRow = Math.floor(this.scrollTopvalue / rowHeight);
        const endRow = Math.min(
            this.sheetData.length - 1,
            Math.ceil((this.scrollTopvalue + canvasHeight) / rowHeight)
        );

        let cellPositionY = -this.scrollTopvalue % rowHeight;

        const startCol = Math.floor(this.scrollLeftvalue / colWidth);
        const endCol = Math.ceil(
            (this.scrollLeftvalue + canvasWidth) / colWidth
        );
        let availableRow = [];
        for (let n = startRow; n <= endRow; n++) {
            let rowNo = Object.keys(this.sheetData[n]);
            availableRow.push(rowNo[0] - "0");
        }

        let m = startRow;
        for (let n = startRow; n <= endRow; n++) {
            if (!availableRow.includes(n + 1)) {
                cellPositionY += this.valueInst.getCurCellHeight(n);
                continue;
            } else {
                m++;
            }

            let cellPositionX = -this.scrollLeftvalue % colWidth;
            let data = this.sheetData[m - 1];

            cellPositionY += this.valueInst.getCurCellHeight(n);
            i = Object.keys(data) - "0";

            for (let j = startCol; j <= endCol; j++) {
                let currProperties = data[i][j]?.properties;

                if (currProperties) {
                    let colorPos = this.getPos(currProperties, "*", 1);
                    let fontColor = currProperties?.slice(
                        colorPos[0] + 1,
                        colorPos[1]
                    );

                    let fontStylePos = this.getPos(currProperties, "*", 2);
                    let fontStyle = currProperties?.slice(
                        fontStylePos[0] + 1,
                        fontStylePos[1]
                    );

                    let fontWeightPos = this.getPos(currProperties, "*", 3);
                    let fontWeight = currProperties?.slice(
                        fontWeightPos[0] + 1,
                        fontWeightPos[1]
                    );

                    let fontSizePos = this.getPos(currProperties, "*", 4);
                    let fontSize =
                        currProperties?.slice(
                            fontSizePos[0] + 1,
                            fontSizePos[1]
                        ) || "12pt";

                    let fontFamPos = this.getPos(currProperties, "*", 5);
                    let fontFam =
                        currProperties?.slice(
                            fontFamPos[0] + 1,
                            fontFamPos[1]
                        ) || "calibri";
                    this.mainCtx.save();
                    this.mainCtx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFam}`;
                    let newData = this.trimData(data[i][j]?.data, j, fontSize);
                    this.mainCtx.fillStyle = `${fontColor}`;
                    this.mainCtx.fillText(
                        newData,
                        cellPositionX + 4,
                        cellPositionY - 4
                    );
                    this.mainCtx.restore();
                }
                cellPositionX += this.valueInst.getCurCellWidth(j);
            }
            i++;
        }
    }

    drawRows() {
        const canvasHeight = this.mainCanvas.height;
        const rowHeight = this.valueInst.getCurCellHeight(0);

        const startRow = Math.floor(this.scrollTopvalue / rowHeight);
        const endRow = Math.ceil(
            (this.scrollTopvalue + canvasHeight) / rowHeight
        );

        let cellPositionY = -this.scrollTopvalue % rowHeight;

        for (let i = startRow; i <= endRow; i++) {
            cellPositionY += this.valueInst.getCurCellHeight(i);

            this.mainCtx.beginPath();
            // this.mainCtx.save();
            this.mainCtx.moveTo(0, cellPositionY + 0.5);
            this.mainCtx.lineTo(this.mainCanvas.width, cellPositionY + 0.5);
            this.mainCtx.lineWidth = 0.2;
            this.mainCtx.strokeStyle = this.gridStrokeColor;
            this.mainCtx.stroke();
            // this.mainCtx.restore();
        }
    }

    drawColumns() {
        const canvasHeight = this.mainCanvas.width;
        const colWidth = 100;

        const startCol = Math.floor(this.scrollLeftvalue / colWidth);
        const endCol = Math.ceil(
            (this.scrollLeftvalue + canvasHeight) / colWidth
        );

        let cellPositionX = -this.scrollLeftvalue % colWidth;

        for (let i = startCol; i <= endCol; i++) {
            cellPositionX += this.valueInst.getCurCellWidth(i);
            this.mainCtx.beginPath();
            this.mainCtx.moveTo(cellPositionX + 0.5, 0);
            this.mainCtx.lineTo(
                cellPositionX + 0.5,
                this.mainCtx.canvas.height
            );
            this.mainCtx.lineWidth = 0.2;
            this.mainCtx.strokeStyle = this.gridStrokeColor;
            this.mainCtx.stroke();
        }
    }

    scrollFunction() {
        const scroller = document.getElementById("scroller");
        const main = document.getElementById("main");

        scroller.addEventListener("scroll", (e) => {
            console.log("scroll");
            this.inputBox.style.display = "none";
            this.scrollTopvalue = Math.max(0, e.target.scrollTop);
            this.scrollLeftvalue = Math.max(0, e.target.scrollLeft);

            let offset = Math.floor(
                (Math.max(0, e.target.scrollTop / 21) + 100) / 500
            );

            if (
                Math.max(0, e.target.scrollTop) >= 8400 &&
                this.prevOffset != offset
            ) {
                this.prevOffset = offset;
                this.fetchUserData(offset);
            }

            if (this.scrollTopvalue > 9000) {
                main.style.height = `${this.scrollTopvalue + 1000}px`;
            }

            if (this.scrollLeftvalue > 100) {
                main.style.width = `${this.scrollLeftvalue + 2000}px`;
            }

            this.mainCtx.clearRect(
                0,
                0,
                this.mainCanvas.width,
                this.mainCanvas.height
            );
            this.leftHeaderCtx.clearRect(
                0,
                0,
                this.leftHeaderCanvas.width,
                this.leftHeaderCanvas.height
            );
            this.topHeaderCtx.clearRect(
                0,
                0,
                this.topHeaderCanvas.width,
                this.topHeaderCanvas.height
            );
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.renderLeftHeader();
            this.renderTopHeader();
        });
    }

    //----------------------keyboard Evenets----------------------
    keyBoardEvents(e) {
        let flag = false;
        let startX, startY, endX, endY;
        if ((e.ctrlKey && e.key === "c") || (e.ctrlKey && e.key === "C")) {
            this.copyPasteInst.marchingAntsCoordinates =
                this.selectedDimensionsMain;

            if (this.isColSelected) {
                this.animateFullRow = false;
                this.animateFullColumn = true;
            } else if (this.isRowSelected) {
                this.animateFullRow = true;
                this.animateFullColumn = false;
            } else {
                this.animateFullRow = false;
                this.animateFullColumn = false;
            }
            cancelAnimationFrame(this.copyPasteInst.animationFrameId);
            this.isAnimationRunning = true;
            this.copyPasteInst.startMarchingAntsAnimation();
            this.copyPasteInst.copyToClipboard();
        } else if (
            (e.ctrlKey && e.key === "v") ||
            (e.ctrlKey && e.key === "V")
        ) {
            this.copyPasteInst.pasteToSheet();
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
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.clearTopHeader();
            this.clearLeftHeader();
            // this.highlightHeaders();
            this.renderTopHeader();
            this.renderLeftHeader();
        } else if (e.key == "Enter" || e.key == "ArrowDown") {
            this.cellPositionTop += this.valueInst.getCurCellHeight(
                this.y1CellIndex
            );
            this.y1CellIndex = this.y1CellIndex + 1;
        } else if (e.key == "ArrowUp" && this.y1CellIndex >= 1) {
            this.cellPositionTop -= this.valueInst.getCurCellHeight(
                this.y1CellIndex - 1
            );
            this.y1CellIndex = this.y1CellIndex - 1;
        } else if (e.key == "Tab" || e.key == "ArrowRight") {
            this.cellPositionLeft += this.valueInst.getCurCellWidth(
                this.x1CellIndex
            );
            this.x1CellIndex = this.x1CellIndex + 1;
        } else if (e.key == "ArrowLeft" && this.x1CellIndex >= 1) {
            this.cellPositionLeft -= this.valueInst.getCurCellWidth(
                this.x1CellIndex - 1
            );
            this.x1CellIndex = this.x1CellIndex - 1;
        } else if (
            (e.key >= "a" && e.key <= "z") ||
            (e.key >= "0" && e.key <= "9") ||
            e.key == "Backspace" ||
            e.key == " "
        ) {
            if (e.key == " ") e.preventDefault();
            flag = true;
            this.isAnimationRunning = false;
            this.inputBoxPosition();
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.clearTopHeader();
            // this.highlightHeaders();
            this.renderTopHeader();
            this.renderLeftHeader();
            this.inputBox.focus();
        }

        if (
            e.key == "Enter" ||
            e.key == "ArrowDown" ||
            e.key == "ArrowUp" ||
            e.key == "Tab" ||
            e.key == "ArrowRight" ||
            e.key == "ArrowLeft"
        ) {
            this.inputBox.style.display = "none";
            this.topheaderSelected = false;
            this.leftheaderSelected = false;
            this.isColSelected = false;
            this.isRowSelected = false;
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
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.clearTopHeader();
            this.clearLeftHeader();
            this.renderTopHeader();
            this.renderLeftHeader();
        }

        if (!e.shiftKey && !e.ctrlKey) {
            // this.inputBoxPosition();
            this.highlightInst.highlightSelectedArea();
            this.drawGrid();
            this.clearTopHeader();
            this.clearLeftHeader();
            // this.highlightHeaders();
            this.renderTopHeader();
            this.renderLeftHeader();
        }
    }
}

export { newCanvas };
