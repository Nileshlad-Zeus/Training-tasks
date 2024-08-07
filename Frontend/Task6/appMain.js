class newCanvas {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.inputBox = document.getElementById("canvasinput");
    this.scale = window.devicePixelRatio;
    window.addEventListener("resize", () => {
      location.reload();
    });
    this.createNewCanvas();
    this.initialVariables();

    this.highlightSelectedAreaEvents();
    this.scrollFunction();
    this.resizeGridEvents();
    this.highlightSelectedArea();
    this.inputBoxPosition();
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
    // this.highlightHeaders();
    this.renderLeftHeader();
    this.renderTopHeader();
    this.changeFontStyle();

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
      this.highlightSelectedArea();
      this.drawGrid();
      // this.highlightHeaders();
      this.renderLeftHeader();
      this.renderTopHeader();
    });

    var charts = document.querySelectorAll(".chart");
    this.chartArray = [];
    Array.from(charts).forEach((chart) => {
      chart.addEventListener("click", (e) => {
        this.barChart(e.target.id);
      });
    });
  }

  initialVariables() {
    this.drawGraph = false;
    //height and width of cell
    this.defaultCellHeight = 21;
    this.defaultCellWidth = 100;

    //initial number of rows and cols
    this.numRows = 100;
    this.numCols = 26;

    //data structure for storing data
    this.cellHeight = new Map();
    this.cellWidths = new Map();
    this.cellPositionTopArr = new Map();
    this.cellPositionTopArr = new Map();

    //colors
    this.strokeColor = "rgb(16,124,65)";
    this.areaHighlightColor = "rgb(231,241,236)";
    this.headersHighlightColor = "rgb(202,234,216)";
    this.gridStrokeColor = "rgb(128, 128, 128)";
    this.blackColor = "rgb(0, 0, 0)";
    this.whiteColor = "rgb(255, 255, 255)";
    this.headerBgColor = "rgb(245,245,245)";

    //selected rows and cols for highlight them
    this.currSelectedCol = null;
    this.currSelectedRow = null;
    this.isColSelected = false;
    this.isRowSelected = false;

    //resize column
    this.isDraggingTop = false;
    this.resizeColIndex = -1;
    this.resizeColTop = 0;
    this.resizeColWidth = 0;

    //resize row
    this.isDraggingLeft = false;
    this.resizeRowIndex = -1;
    this.resizeRowTop = 0;
    this.resizeRowHeight = 0;

    //current cell Index
    this.x1CellIndex = 0;
    this.x2CellIndex = 0;
    this.y1CellIndex = 0;
    this.y2CellIndex = 0;

    //current Cell positions
    this.cellPositionTop = 0;
    this.cellPositionLeft = 0;

    //coordinated for highlighting headers [x,y,width,height]
    this.headersHighlightCoordinate = null;

    this.topheaderSelected = false;
    this.leftheaderSelected = false;

    //coordinated for highlight selected area [startX,startY,endX,endY]
    this.isAreaSelected = false;
    this.selectedDimensionsMain = [0, 0, 0, 0];
    this.selectedTopHeaderCoordinates = [0, 0, 0, 0];
    this.selectedLeftHeaderCoordinates = [0, 0, 0, 0];

    //starring index of mouse Down Evenets
    this.startingIndex = null;
    this.startingIndexTop = null;
    this.startingIndexLeft = null;

    //Marching Ants Animation variables
    this.marchingAntsCoordinates = null;
    this.lineDashOffset = 0;
    this.isAnimationRunning = false;
    this.animateFullColumn = false;
    this.animateFullRow = false;
    this.alreadyCopy = 0; //0: ctrl+c on animation not running  1:ctr    l+c on animation already running

    this.colFlag = false;
    this.rowFlag = false;

    //data store
    //color, font style, bold, font size, font family
    // this.sheetData = [
    //   {
    //     0: {
    //       0: {
    //         data: "Nilesh",
    //         properties: "*****",
    //       },
    //       2: {
    //         data: "Lad",
    //         properties: "*****",
    //       },
    //     },
    //   },
    //   {
    //     1: {
    //       0: {
    //         data: "Jhon",
    //         properties: "*****",
    //       },
    //       1: {
    //         data: "Cena",
    //         properties: "*****",
    //       },
    //     },
    //   },
    //   {
    //     5: {
    //       0: {
    //         data: "Jhon",
    //         properties: "*****",
    //       },
    //       6: {
    //         data: "Cena",
    //         properties: "*****",
    //       },
    //     },
    //   },
    //   {
    //     3: {
    //       5: {
    //         data: "Harsh",
    //         properties: "*****",
    //       },
    //       0: {
    //         data: "Cena",
    //         properties: "*****",
    //       },
    //     },
    //   },
    // ];

    this.sheetData = [
      {
        0: {
          0: { data: "name", properties: "*****" },
          1: { data: "Country", properties: "*****" },
          2: { data: "City", properties: "*****" },
          3: { data: "telephone_number", properties: "*****" },
          4: { data: "DOB", properties: "*****" },
          5: { data: "FY2019-20", properties: "*****" },
          6: { data: "FY2020-21", properties: "*****" },
          7: { data: "FY2021-22", properties: "*****" },
          8: { data: "FY2022-23", properties: "*****" },
          9: { data: "FY2023-24", properties: "*****" },
        },
      },
      {
        1: {
          0: { data: "Emily FQbt6", properties: "*****" },
          1: { data: "Australia", properties: "*****" },
          2: { data: "Houston", properties: "*****" },
          3: { data: "5457952956", properties: "*****" },
          4: { data: "1/10/1988", properties: "*****" },
          5: { data: "71987", properties: "*****" },
          6: { data: "74470", properties: "*****" },
          7: { data: "118674", properties: "*****" },
          8: { data: "111997", properties: "*****" },
          9: { data: "52402", properties: "*****" },
        },
      },
      {
        2: {
          0: { data: "Jane OZUPM", properties: "*****" },
          1: { data: "Germany", properties: "*****" },
          2: { data: "New York", properties: "*****" },
          3: { data: "3553305164", properties: "*****" },
          4: { data: "4/15/1987", properties: "*****" },
          5: { data: "137336", properties: "*****" },
          6: { data: "41923", properties: "*****" },
          7: { data: "80143", properties: "*****" },
          8: { data: "87229", properties: "*****" },
          9: { data: "73409", properties: "*****" },
        },
      },
      {
        3: {
          0: { data: "Katie HyTYR", properties: "*****" },
          1: { data: "UK", properties: "*****" },
          2: { data: "Chicago", properties: "*****" },
          3: { data: "669768290", properties: "*****" },
          4: { data: "4/6/1957", properties: "*****" },
          5: { data: "140482", properties: "*****" },
          6: { data: "92176", properties: "*****" },
          7: { data: "73337", properties: "*****" },
          8: { data: "66622", properties: "*****" },
          9: { data: "147714", properties: "*****" },
        },
      },
      {
        4: {
          0: { data: "Katie aJetY", properties: "*****" },
          1: { data: "UK", properties: "*****" },
          2: { data: "Los Angeles", properties: "*****" },
          3: { data: "8141480576", properties: "*****" },
          4: { data: "5/16/1951", properties: "*****" },
          5: { data: "140968", properties: "*****" },
          6: { data: "116895", properties: "*****" },
          7: { data: "145380", properties: "*****" },
          8: { data: "75615", properties: "*****" },
          9: { data: "122402", properties: "*****" },
        },
      },
      {
        5: {
          0: { data: "Jane jGX3L", properties: "*****" },
          1: { data: "Germany", properties: "*****" },
          2: { data: "New York", properties: "*****" },
          3: { data: "353482959", properties: "*****" },
          4: { data: "11/6/1974", properties: "*****" },
          5: { data: "75468", properties: "*****" },
          6: { data: "58173", properties: "*****" },
          7: { data: "133088", properties: "*****" },
          8: { data: "146254", properties: "*****" },
          9: { data: "94909", properties: "*****" },
        },
      },
      {
        6: {
          0: { data: "Chris 9Rdzx", properties: "*****" },
          1: { data: "USA", properties: "*****" },
          2: { data: "New York", properties: "*****" },
          3: { data: "4041565147", properties: "*****" },
          4: { data: "10/14/1976", properties: "*****" },
          5: { data: "51297", properties: "*****" },
          6: { data: "76342", properties: "*****" },
          7: { data: "52802", properties: "*****" },
          8: { data: "41781", properties: "*****" },
          9: { data: "148994", properties: "*****" },
        },
      },
      {
        7: {
          0: { data: "Katie X3Gx5", properties: "*****" },
          1: { data: "UK", properties: "*****" },
          2: { data: "Phoenix", properties: "*****" },
          3: { data: "3469563819", properties: "*****" },
          4: { data: "2/16/1972", properties: "*****" },
          5: { data: "82928", properties: "*****" },
          6: { data: "75816", properties: "*****" },
          7: { data: "61833", properties: "*****" },
          8: { data: "65611", properties: "*****" },
          9: { data: "50962", properties: "*****" },
        },
      },
      {
        8: {
          0: { data: "Katie Bktxk", properties: "*****" },
          1: { data: "Australia", properties: "*****" },
          2: { data: "Los Angeles", properties: "*****" },
          3: { data: "2712084976", properties: "*****" },
          4: { data: "1/20/1999", properties: "*****" },
          5: { data: "144688", properties: "*****" },
          6: { data: "38226", properties: "*****" },
          7: { data: "139676", properties: "*****" },
          8: { data: "83774", properties: "*****" },
          9: { data: "64938", properties: "*****" },
        },
      },
      {
        9: {
          0: { data: "Emily LPuzu", properties: "*****" },
          1: { data: "Germany", properties: "*****" },
          2: { data: "Phoenix", properties: "*****" },
          3: { data: "9893149547", properties: "*****" },
          4: { data: "12/27/1973", properties: "*****" },
          5: { data: "63291", properties: "*****" },
          6: { data: "76657", properties: "*****" },
          7: { data: "69692", properties: "*****" },
          8: { data: "105696", properties: "*****" },
          9: { data: "70419", properties: "*****" },
        },
      },
      {
        10: {
          0: { data: "Jane zngX4", properties: "*****" },
          1: { data: "USA", properties: "*****" },
          2: { data: "Houston", properties: "*****" },
          3: { data: "273436682", properties: "*****" },
          4: { data: "8/28/1984", properties: "*****" },
          5: { data: "133321", properties: "*****" },
          6: { data: "114253", properties: "*****" },
          7: { data: "111180", properties: "*****" },
          8: { data: "141386", properties: "*****" },
          9: { data: "71835", properties: "*****" },
        },
      },
      {
        11: {
          0: { data: "Alex kXRmf", properties: "*****" },
          1: { data: "UK", properties: "*****" },
          2: { data: "Houston", properties: "*****" },
          3: { data: "2148165184", properties: "*****" },
          4: { data: "11/17/1972", properties: "*****" },
          5: { data: "88439", properties: "*****" },
          6: { data: "44598", properties: "*****" },
          7: { data: "112272", properties: "*****" },
          8: { data: "39311", properties: "*****" },
          9: { data: "83349", properties: "*****" },
        },
      },
      {
        12: {
          0: { data: "Emily 9kjPw", properties: "*****" },
          1: { data: "USA", properties: "*****" },
          2: { data: "Houston", properties: "*****" },
          3: { data: "1313221870", properties: "*****" },
          4: { data: "1/10/1997", properties: "*****" },
          5: { data: "137643", properties: "*****" },
          6: { data: "67790", properties: "*****" },
          7: { data: "88627", properties: "*****" },
          8: { data: "124546", properties: "*****" },
          9: { data: "44625", properties: "*****" },
        },
      },
      {
        13: {
          0: { data: "Emily va43C", properties: "*****" },
          1: { data: "USA", properties: "*****" },
          2: { data: "Chicago", properties: "*****" },
          3: { data: "7089910029", properties: "*****" },
          4: { data: "10/28/1991", properties: "*****" },
          5: { data: "108629", properties: "*****" },
          6: { data: "59682", properties: "*****" },
          7: { data: "47352", properties: "*****" },
          8: { data: "140016", properties: "*****" },
          9: { data: "45580", properties: "*****" },
        },
      },
      {
        14: {
          0: { data: "Chris P8cHX", properties: "*****" },
          1: { data: "Australia", properties: "*****" },
          2: { data: "Phoenix", properties: "*****" },
          3: { data: "8052835565", properties: "*****" },
          4: { data: "3/29/1973", properties: "*****" },
          5: { data: "69460", properties: "*****" },
          6: { data: "138752", properties: "*****" },
          7: { data: "95032", properties: "*****" },
          8: { data: "119769", properties: "*****" },
          9: { data: "66099", properties: "*****" },
        },
      },
      {
        15: {
          0: { data: "Chris TeV18", properties: "*****" },
          1: { data: "USA", properties: "*****" },
          2: { data: "New York", properties: "*****" },
          3: { data: "1284070085", properties: "*****" },
          4: { data: "1/9/1989", properties: "*****" },
          5: { data: "146852", properties: "*****" },
          6: { data: "94918", properties: "*****" },
          7: { data: "102026", properties: "*****" },
          8: { data: "82699", properties: "*****" },
          9: { data: "91803", properties: "*****" },
        },
      },
      {
        16: {
          0: { data: "Katie 0LpNB", properties: "*****" },
          1: { data: "Germany", properties: "*****" },
          2: { data: "Los Angeles", properties: "*****" },
          3: { data: "3148045878", properties: "*****" },
          4: { data: "2/19/1951", properties: "*****" },
          5: { data: "50021", properties: "*****" },
          6: { data: "135559", properties: "*****" },
          7: { data: "98509", properties: "*****" },
          8: { data: "34825", properties: "*****" },
          9: { data: "120590", properties: "*****" },
        },
      },
      {
        17: {
          0: { data: "Katie csnVg", properties: "*****" },
          1: { data: "Canada", properties: "*****" },
          2: { data: "New York", properties: "*****" },
          3: { data: "3777400485", properties: "*****" },
          4: { data: "3/3/1992", properties: "*****" },
          5: { data: "105875", properties: "*****" },
          6: { data: "133601", properties: "*****" },
          7: { data: "133361", properties: "*****" },
          8: { data: "35466", properties: "*****" },
          9: { data: "45354", properties: "*****" },
        },
      },
      {
        18: {
          0: { data: "Emily wB02d", properties: "*****" },
          1: { data: "Australia", properties: "*****" },
          2: { data: "New York", properties: "*****" },
          3: { data: "2166261664", properties: "*****" },
          4: { data: "9/29/1997", properties: "*****" },
          5: { data: "48985", properties: "*****" },
          6: { data: "82031", properties: "*****" },
          7: { data: "149330", properties: "*****" },
          8: { data: "48564", properties: "*****" },
          9: { data: "88813", properties: "*****" },
        },
      },
      {
        19: {
          0: { data: "Alex Yl4Br", properties: "*****" },
          1: { data: "Germany", properties: "*****" },
          2: { data: "Phoenix", properties: "*****" },
          3: { data: "1807641952", properties: "*****" },
          4: { data: "12/21/1971", properties: "*****" },
          5: { data: "44762", properties: "*****" },
          6: { data: "107977", properties: "*****" },
          7: { data: "86407", properties: "*****" },
          8: { data: "142413", properties: "*****" },
          9: { data: "107080", properties: "*****" },
        },
      },
      {
        20: {
          0: { data: "Jane SviWc", properties: "*****" },
          1: { data: "Australia", properties: "*****" },
          2: { data: "New York", properties: "*****" },
          3: { data: "5823155588", properties: "*****" },
          4: { data: "1/4/1982", properties: "*****" },
          5: { data: "71502", properties: "*****" },
          6: { data: "69496", properties: "*****" },
          7: { data: "45688", properties: "*****" },
          8: { data: "32109", properties: "*****" },
          9: { data: "51437", properties: "*****" },
        },
      },
      {
        21: {
          0: { data: "John 2avKM", properties: "*****" },
          1: { data: "Australia", properties: "*****" },
          2: { data: "Houston", properties: "*****" },
          3: { data: "2810470697", properties: "*****" },
          4: { data: "9/18/1967", properties: "*****" },
          5: { data: "112105", properties: "*****" },
          6: { data: "147949", properties: "*****" },
          7: { data: "80028", properties: "*****" },
          8: { data: "124944", properties: "*****" },
          9: { data: "130148", properties: "*****" },
        },
      },
      {
        22: {
          0: { data: "John 7uHEq", properties: "*****" },
          1: { data: "Canada", properties: "*****" },
          2: { data: "Houston", properties: "*****" },
          3: { data: "2570504167", properties: "*****" },
          4: { data: "5/22/1964", properties: "*****" },
          5: { data: "59496", properties: "*****" },
          6: { data: "59145", properties: "*****" },
          7: { data: "47781", properties: "*****" },
          8: { data: "48746", properties: "*****" },
          9: { data: "131767", properties: "*****" },
        },
      },
      {
        23: {
          0: { data: "John xYSuW", properties: "*****" },
          1: { data: "UK", properties: "*****" },
          2: { data: "Chicago", properties: "*****" },
          3: { data: "8436891984", properties: "*****" },
          4: { data: "11/5/1993", properties: "*****" },
          5: { data: "84744", properties: "*****" },
          6: { data: "87399", properties: "*****" },
          7: { data: "50861", properties: "*****" },
          8: { data: "90180", properties: "*****" },
          9: { data: "113477", properties: "*****" },
        },
      },
      {
        24: {
          0: { data: "Alex gA8Rf", properties: "*****" },
          1: { data: "Germany", properties: "*****" },
          2: { data: "Chicago", properties: "*****" },
          3: { data: "8629339455", properties: "*****" },
          4: { data: "7/28/1978", properties: "*****" },
          5: { data: "58677", properties: "*****" },
          6: { data: "104221", properties: "*****" },
          7: { data: "119337", properties: "*****" },
          8: { data: "96312", properties: "*****" },
          9: { data: "98264", properties: "*****" },
        },
      },
      {
        25: {
          0: { data: "Emily BpTl3", properties: "*****" },
          1: { data: "UK", properties: "*****" },
          2: { data: "Chicago", properties: "*****" },
          3: { data: "9285496787", properties: "*****" },
          4: { data: "12/28/1977", properties: "*****" },
          5: { data: "132803", properties: "*****" },
          6: { data: "69595", properties: "*****" },
          7: { data: "50743", properties: "*****" },
          8: { data: "62194", properties: "*****" },
          9: { data: "76466", properties: "*****" },
        },
      },
    ];
  }

  createNewCanvas() {
    //sheet canvas

    const main = document.getElementById("main");
    const mainCanvas = document.createElement("canvas");
    mainCanvas.setAttribute("id", this.sheetName);
    mainCanvas.setAttribute("class", "canvas");
    mainCanvas.width = Math.floor(2100 * this.scale);
    mainCanvas.height = Math.floor(1200 * this.scale);
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
    leftHeaderCanvas.height = Math.floor(1200 * this.scale);
    leftHeader.appendChild(leftHeaderCanvas);
    this.leftHeaderCanvas = leftHeaderCanvas;
    this.leftHeaderCtx = this.leftHeaderCanvas.getContext("2d");
    this.leftHeaderCtx.scale(this.scale, this.scale);

    this.mainCanvas.style.cursor = "cell";

    const topleftDiv = document.getElementById("topleftDiv");

    main.style.top = `${24 * this.scale}px`;
    main.style.marginLeft = `${40 * this.scale}px`;
    topHeader.style.height = `${24 * this.scale}px`;
    topHeader.style.marginLeft = `${40 * this.scale}px`;
    leftHeader.style.marginTop = `${24 * this.scale}px`;
    topleftDiv.style.width = `${40 * this.scale}px`;
    topleftDiv.style.height = `${24 * this.scale}px`;
  }

  clearCanvas() {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
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
  clearTopheader() {
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
    this.inputBox.style.top = `${(this.cellPositionTop + 0.6) * this.scale}px`;
    0;
    this.inputBox.style.left = `${
      (this.cellPositionLeft + 0.6) * this.scale
    }px`;
    this.inputBox.style.height = `${
      (this.getCurCellHeight(this.y1CellIndex) - 1.2) * this.scale
    }px`;
    this.inputBox.style.width = `${
      (this.getCurCellWidth(this.x1CellIndex) - 1.2) * this.scale
    }px`;
  }

  findAndReplace(findText, replaceText) {
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
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.highlightSelectedArea();
    this.drawGrid();
  }

  changeFontColor() {
    var value = colorSelector.value;
    const [startX, startY] = this.selectedDimensionsMain;
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
    this.highlightSelectedArea();
    this.drawGrid();
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
      const [startX, startY] = this.selectedDimensionsMain;
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
      this.highlightSelectedArea();
      this.drawGrid();
    });

    fontfamily.addEventListener("change", () => {
      var value = fontfamily.value;
      const [startX, startY] = this.selectedDimensionsMain;
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
      this.highlightSelectedArea();
      this.drawGrid();
    });

    fontbold.addEventListener("click", () => {
      let value = "";
      if (!fontbold.classList.contains("fontstyleactive")) {
        value = "bold";
      }
      fontbold.classList.toggle("fontstyleactive");

      const [startX, startY] = this.selectedDimensionsMain;
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
      this.highlightSelectedArea();
      this.drawGrid();
    });

    fontitalic.addEventListener("click", () => {
      let value = "";
      if (!fontitalic.classList.contains("fontstyleactive")) {
        value = "italic";
      }
      fontitalic.classList.toggle("fontstyleactive");

      const [startX, startY] = this.selectedDimensionsMain;

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
      this.highlightSelectedArea();
      this.drawGrid();
    });
  }

  //----------------------draw grid----------------------
  trimData(data, j, fontSize) {
    let cellwidth = this.getCurCellWidth(j);
    let length = data.length;
    let textWidth = this.mainCtx.measureText(data).width;
    let newfontSize = fontSize.slice(0, -2);
    let length2 = (textWidth - cellwidth) / (newfontSize - 2);
    data = data.slice(0, length - length2 - 2);
    return data;
  }
  renderData = () => {
    let i;
    let cellPositionY = 0;
    this.sheetData.forEach((data) => {
      let cellPositionX = 0;
      cellPositionY = 21;
      for (let k = 0; k < Object.keys(data); k++) {
        cellPositionY += this.getCurCellHeight(k);
      }
      i = Object.keys(data);

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

      for (let j = 0; j <= max && min != max; j++) {
        let currProperties = data[i][j]?.properties;
        if (currProperties) {
          let colorPos = this.getPos(currProperties, "*", 1);
          let fontColor = currProperties?.slice(colorPos[0] + 1, colorPos[1]);

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
            currProperties?.slice(fontSizePos[0] + 1, fontSizePos[1]) || "12pt";

          let fontFamPos = this.getPos(currProperties, "*", 5);
          let fontFam =
            currProperties?.slice(fontFamPos[0] + 1, fontFamPos[1]) ||
            "calibri";
          this.mainCtx.save();
          this.mainCtx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFam}`;
          let newData = this.trimData(data[i][j]?.data, j, fontSize);
          this.mainCtx.fillStyle = fontColor;
          this.mainCtx.fillText(newData, cellPositionX + 4, cellPositionY - 4);
          this.mainCtx.clip();
          this.mainCtx.restore();
        }
        cellPositionX += this.getCurCellWidth(j);
      }
      i++;
    });
  };

  drawGrid() {
    this.drawRows();
    this.drawColumns();
    this.renderData();
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

  drawRows() {
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCurCellHeight(i);
      this.mainCtx.beginPath();
      this.mainCtx.save();
      this.mainCtx.moveTo(0, cellPosition + 0.5);
      this.mainCtx.lineTo(this.mainCtx.canvas.width, cellPosition + 0.5);
      this.mainCtx.lineWidth = 0.2;
      this.mainCtx.strokeStyle = this.gridStrokeColor;
      this.mainCtx.stroke();
      this.mainCtx.restore();
    }
  }

  drawColumns() {
    let cellPosition = 0;
    for (let i = 0; i <= this.numCols; i++) {
      cellPosition += this.getCurCellWidth(i);
      this.mainCtx.beginPath();
      this.mainCtx.moveTo(cellPosition + 0.5, 0);
      this.mainCtx.lineTo(cellPosition + 0.5, this.mainCtx.canvas.height);
      this.mainCtx.lineWidth = 0.2;
      this.mainCtx.strokeStyle = this.gridStrokeColor;
      this.mainCtx.stroke();
    }
  }

  renderTopHeader() {
    let cellPosition = 0;
    this.topHeaderCtx.save();
    this.topHeaderCtx.beginPath();

    this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.topHeaderCtx.moveTo(0, 24 - 0.5);
    this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24 - 0.5);
    this.topHeaderCtx.stroke();
    this.topHeaderCtx.restore();
    this.highlightTopHeader();

    this.topHeaderCtx.font = "11pt Arial";
    this.topHeaderCtx.textAlign = "center";

    for (let i = 0; i <= this.numCols; i++) {
      cellPosition += this.getCurCellWidth(i);
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.moveTo(cellPosition + 0.5, 0);
      this.topHeaderCtx.lineTo(
        cellPosition + 0.5,
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

    cellPosition = 0;
    for (let i = 0; i <= this.numCols; i++) {
      cellPosition += this.getCurCellWidth(i);
      this.topHeaderCtx.save();
      let text = this.convertNumToChar(i + 1);
      let xPosition = cellPosition - this.getCurCellWidth(i) / 2;
      let yPosition = 15;

      this.topHeaderCtx.fillStyle = this.gridStrokeColor;
      if (Array.isArray(this.currSelectedCol)) {
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
        i == this.columnIndex2 &&
        cellPosition - this.columnLeftOfDrag >= 20
      ) {
        this.resizeLineVertical.style.top = 0;
        this.resizeLineVertical.style.left = `${cellPosition * this.scale}px`;
      }
    }
  }

  renderLeftHeader() {
    this.leftHeaderCtx.save();
    this.leftHeaderCtx.beginPath();
    this.leftHeaderCtx.moveTo(40 - 0.5, 0);
    this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
    this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.leftHeaderCtx.stroke();
    this.leftHeaderCtx.restore();
    this.highlightLeftHeaders();

    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCurCellHeight(i);
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

    cellPosition = 0;
    this.leftHeaderCtx.font = "14px Arial";
    for (let i = 0; i <= this.numRows; i++) {
      cellPosition += this.getCurCellHeight(i);

      this.leftHeaderCtx.save();
      let text = (i + 1).toString();
      let yPosition = cellPosition - this.getCurCellHeight(i) / 2;

      this.leftHeaderCtx.fillStyle = this.gridStrokeColor;
      if (Array.isArray(this.currSelectedRow)) {
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
        this.leftHeaderCtx.fillStyle = this.blackColor;
      }
      this.leftHeaderCtx.fillText(text, 20, yPosition + 4);
      this.leftHeaderCtx.restore();

      if (i == this.rowIndex2 && cellPosition - this.rowTopOfDrag > 10) {
        this.resizeLineHorizontal.style.top = `${cellPosition * this.scale}px`;
        this.resizeLineHorizontal.style.left = 0;
      }
    }

    // this.currSelectedRow = null;
  }

  //----------------------Scroll Functionality----------------------
  scrollFunction() {
    const main = document.getElementById("main");
    const topHeader = document.getElementById("topHeader");
    const leftHeader = document.getElementById("leftHeader");
    main.addEventListener("scroll", () => {
      topHeader.style.left = `-${main.scrollLeft}px`;
      leftHeader.style.top = `-${main.scrollTop}px`;
    });
  }

  //----------------------keyboard Evenets----------------------
  keyBoardEvents(e) {
    let flag = false;
    this.alreadyCopy = 0;
    let startX, startY, endX, endY;
    if ((e.ctrlKey && e.key === "c") || (e.ctrlKey && e.key === "C")) {
      // this.findAndReplace("Nilesh","lad2");
      this.marchingAntsCoordinates = this.selectedDimensionsMain;

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
      if (this.isAnimationRunning) {
        this.alreadyCopy = 1;
      }
      cancelAnimationFrame(this.animationFrameId);
      this.isAnimationRunning = true;
      this.startMarchingAntsAnimation();
      this.copyToClipboard();
    } else if ((e.ctrlKey && e.key === "v") || (e.ctrlKey && e.key === "V")) {
      this.pasteToSheet();
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
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    } else if (e.key == "Enter" || e.key == "ArrowDown") {
      this.cellPositionTop += this.getCurCellHeight(this.y1CellIndex);
      this.y1CellIndex = this.y1CellIndex + 1;
    } else if (e.key == "ArrowUp" && this.y1CellIndex >= 1) {
      this.cellPositionTop -= this.getCurCellHeight(this.y1CellIndex - 1);
      this.y1CellIndex = this.y1CellIndex - 1;
    } else if (e.key == "Tab" || e.key == "ArrowRight") {
      this.cellPositionLeft += this.getCurCellWidth(this.x1CellIndex);
      this.x1CellIndex = this.x1CellIndex + 1;
    } else if (e.key == "ArrowLeft" && this.x1CellIndex >= 1) {
      this.cellPositionLeft -= this.getCurCellWidth(this.x1CellIndex - 1);
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
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
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
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      this.renderTopHeader();
      this.renderLeftHeader();
    }

    if (!e.shiftKey && !e.ctrlKey) {
      // this.inputBoxPosition();
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    }
  }

  //----------------------Marching Ant Animation----------------------
  copyToClipboard = () => {
    const [startX, startY, endX, endY] = this.marchingAntsCoordinates;
    let textTocopy = "";
    for (let j = startY; j <= endY; j++) {
      const result = this.sheetData.find((item) => item[j]);
      let temp = "";

      for (let i = startX; i <= endX; i++) {
        let currentData = result ? result[j][i] : "";
        temp = temp + "	" + (currentData ? currentData.data : "");
      }
      textTocopy += temp.slice(1);
      textTocopy += "\n";
    }
    navigator.clipboard.writeText(textTocopy);
  };

  pasteToSheet = async () => {
    if (this.isAnimationRunning) {
      const [startX, startY, endX, endY] = this.marchingAntsCoordinates;
      this.selectedDimensionsMain = [
        this.x1CellIndex,
        this.y1CellIndex,
        this.x1CellIndex + (endX - startX),
        this.y1CellIndex + (endY - startY),
      ];

      this.highlightSelectedArea();

      let copiedText = await navigator.clipboard.readText();

      let x = startX;
      let y = startY;
      let a = 0;
      let b = 0;
      for (
        let i = this.y1CellIndex;
        i <= this.y1CellIndex + (endY - startY);
        i++
      ) {
        x = startX;
        let result = this.sheetData.find((item) => item[i]);
        if (!result) {
          this.sheetData.push({
            [i]: {},
          });
        }
        result = this.sheetData.find((item) => item[i]);
        let newData = copiedText.split("\r\n");
        let currData = newData[a].split("\t");
        console.log(result, newData, currData);
        a++;
        b = 0;
        for (
          let j = this.x1CellIndex;
          j <= this.x1CellIndex + (endX - startX);
          j++
        ) {
          if (!result[i][j]) {
            result[i][j] = {
              data: currData[b],
              properties: "*****",
            };
          } else {
            result[i][j].data = currData[b];
          }
          b++;
          x++;
        }
        y++;
      }
      this.renderData();
    }
  };

  startMarchingAntsAnimation() {
    if (this.isAnimationRunning == true) {
      const [startX, startY, endX, endY] = this.marchingAntsCoordinates;
      let x = 0;
      let y = 0;
      let width = 0;
      let height = 0;

      for (let i = 0; i < startX; i++) {
        x += this.getCurCellWidth(i);
      }
      for (let i = 0; i < startY; i++) {
        y += this.getCurCellHeight(i);
      }
      for (let i = startX; i <= endX; i++) {
        width += this.getCurCellWidth(i);
      }
      for (let i = startY; i <= endY; i++) {
        height += this.getCurCellHeight(i);
      }

      if (this.animateFullColumn) {
        y = 0;
        height = this.mainCtx.canvas.height;
      }
      if (this.animateFullRow) {
        x = 0;
        width = this.mainCtx.canvas.width;
      }

      // this.lineDashOffset = this.lineDashOffset - 0.2;
      this.lineDashOffset = this.lineDashOffset - 0.2;

      if (this.lineDashOffset < 0) {
        this.lineDashOffset = 8;
      }

      // this.clearCanvas();
      this.mainCtx.save();
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearLeftHeader();
      this.clearTopheader();
      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();

      this.mainCtx.beginPath();
      this.mainCtx.setLineDash([5, 3]);
      this.mainCtx.lineDashOffset = this.lineDashOffset;
      this.mainCtx.lineWidth = 2;
      this.mainCtx.strokeStyle = this.strokeColor;
      this.mainCtx.rect(x + 1, y + 1, width - 1, height - 1);
      this.mainCtx.stroke();
      this.mainCtx.restore();

      this.animationFrameId = requestAnimationFrame(() =>
        this.startMarchingAntsAnimation()
      );
    }
  }

  //----------------------Charts----------------------
  rotateMatrix(array) {
    const rows = array.length;
    const cols = array[0].length;
    const rotated = [];

    for (let i = 0; i < cols; i++) {
      rotated[i] = [];
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = array[i][j];
      }
    }

    return rotated;
  }

  makeitDraggable(chartDiv) {
    let rect = this.mainCanvas.getBoundingClientRect();
    this.draggableChart = false;

    chartDiv.addEventListener("pointerdown", (e) => {
      this.draggableChart = true;
    });
    chartDiv.addEventListener("pointermove", (e) => {
      chartDiv.style.cursor = "move";
      let clickX = (e.clientX - rect.left) / this.scale;
      let clickY = (e.clientY - rect.top) / this.scale;
      if (this.draggableChart) {
        chartDiv.style.top = `${clickY - 50}px`;
        chartDiv.style.left = `${clickX - 225}px`;
      }
    });
    chartDiv.addEventListener("pointerup", (e) => {
      this.draggableChart = false;
    });
  }

  barChart(chartType) {
    const [startX, startY, endX, endY] = this.selectedDimensionsMain;
    if (startX == 0 && startY == 0 && endX == 0 && endY == 0) {
      return;
    }
    const main = document.getElementById("main");
    let chartDiv = document.createElement("div");

    let canvas = document.createElement("canvas");
    chartDiv.appendChild(canvas);
    main.appendChild(chartDiv);

    let dataArray = [];
    let tempArray = [];
    let xValues = [];
    let i = 1;
    for (let j = startY; j <= endY; j++) {
      const result = this.sheetData.find((item) => item[j]);
      tempArray = [];
      for (let i = startX; i <= endX; i++) {
        let currentData = result ? result[j][i] : "";
        if (currentData && currentData != "" && !isNaN(currentData.data)) {
          tempArray.push(Number(currentData.data));
        }
      }
      if (tempArray.length > 0) {
        xValues.push(i++);
        dataArray.push(tempArray);
      }
    }
    if (dataArray.length <= 0) {
      return;
    }
    chartDiv.style.position = "absolute";
    chartDiv.style.border = "1px solid gray";
    chartDiv.style.top = "50px";
    chartDiv.style.left = "50px";
    chartDiv.style.width = "450px";
    chartDiv.style.padding = "10px";
    chartDiv.style.backgroundColor = "white";

    let dataSet = [];
    let backgroundColor = [
      "#4472C4",
      "#ED7D31",
      "#A5A5A5",
      "#FFC000",
      "#5B9BD5",
      "#F4B400",
      "#D3A7A1",
      "#009B77",
      "#6D6E71",
      "#FF6F61",
      "#C2C2C2",
      "#F2C6A1",
      "#2E8B57",
      "#FFC107",
      "#4F81BD",
    ];

    dataArray = this.rotateMatrix(dataArray);

    dataArray.forEach((d, index) => {
      if (chartType != "pie" || (chartType == "pie" && index == 0)) {
        dataSet.push({
          label: `Series${index}`,
          axis: "y",
          backgroundColor:
            chartType == "pie" || chartType == "doughnut"
              ? backgroundColor
              : backgroundColor[index],
          borderColor:
            chartType == "pie" || chartType == "doughnut"
              ? "white"
              : backgroundColor[index],
          fill: false,
          data: d,
        });
      }
    });

    new Chart(canvas, {
      type: chartType,
      data: {
        labels: xValues,
        datasets: dataSet,
      },
      options: {
        indexAxis: "y",
        cutoutPercentage: chartType == "doughnut" ? 80 : 0,
      },
    });
    this.makeitDraggable(chartDiv);
  }

  //----------------------Highlight Selected Area----------------------
  highlightSelectedArea() {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    const [startX, startY, endX, endY] = this.selectedDimensionsMain;

    const nameBoxInput = document.getElementById("nameBoxInput");
    let currentCell = `${this.convertNumToChar(startX + 1)}${startY + 1}`;
    nameBoxInput.value = currentCell;

    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCurCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCurCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCurCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCurCellHeight(i);
    }

    this.cellPositionLeft = 0;
    this.cellPositionTop = 0;

    if (this.isColSelected || this.isRowSelected) {
      this.x1CellIndex = startX;
      this.y1CellIndex = startY;
    }

    for (let i = 0; i < this.x1CellIndex; i++) {
      this.cellPositionLeft += this.getCurCellWidth(i);
    }
    for (let i = 0; i < this.y1CellIndex; i++) {
      this.cellPositionTop += this.getCurCellHeight(i);
    }
    this.mainCtx.save();

    this.mainCtx.fillStyle = this.areaHighlightColor;
    if (this.isColSelected) {
      this.currSelectedCol = [startX, endX];
      if (this.topheaderSelected && this.leftheaderSelected) {
        this.currSelectedRow = [0, 100];
      } else {
        this.currSelectedRow = "all";
      }
      this.mainCtx.fillRect(x, 0, width, this.mainCtx.canvas.height);
    } else if (this.isRowSelected) {
      this.currSelectedRow = [startY, endY];
      this.currSelectedCol = "all";
      this.mainCtx.fillRect(0, y, this.mainCtx.canvas.width, height);
    } else {
      this.currSelectedCol = [startX, endX];
      this.currSelectedRow = [startY, endY];
      this.mainCtx.fillRect(x, y, width, height);
    }

    if (this.isTopAreaSelected) {
      this.currSelectedCol = [startX, endX];
    }

    if (this.isLeftAreaSelected) {
      this.currSelectedRow = [startY, endY];
    }

    this.mainCtx.fillStyle = this.whiteColor;
    this.mainCtx.fillRect(
      this.cellPositionLeft,
      this.cellPositionTop,
      this.getCurCellWidth(this.x1CellIndex),
      this.getCurCellHeight(this.y1CellIndex)
    );

    this.mainCtx.lineWidth = 2;
    this.mainCtx.strokeStyle = this.strokeColor;
    if (this.isColSelected) {
      this.mainCtx.strokeRect(
        x - 0.5,
        -0.5,
        width + 1,
        this.mainCtx.canvas.height
      );
    } else if (this.isRowSelected) {
      this.mainCtx.strokeRect(-1, y - 1, this.mainCtx.canvas.width, height + 2);
    } else {
      this.mainCtx.strokeRect(x - 0.5, y - 0.5, width + 1, height + 1);
    }

    this.mainCtx.restore();

    this.headersHighlightCoordinate = [startX, startY, endX, endY];
  }

  highlightHeaders() {
    this.topHeaderCtx.save();
    this.topHeaderCtx.beginPath();

    this.topHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.topHeaderCtx.moveTo(0, 24 - 0.5);
    this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24 - 0.5);
    this.topHeaderCtx.stroke();
    this.topHeaderCtx.restore();

    this.leftHeaderCtx.save();
    this.leftHeaderCtx.beginPath();
    this.leftHeaderCtx.moveTo(40 - 0.5, 0);
    this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
    this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.leftHeaderCtx.stroke();
    this.leftHeaderCtx.restore();

    const [startX, startY, endX, endY] = this.headersHighlightCoordinate;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCurCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCurCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCurCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCurCellHeight(i);
    }

    if (this.isColSelected && this.isRowSelected) {
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.strokeColor;
      this.topHeaderCtx.fillRect(0, 0, this.topHeaderCtx.canvas.width, 24);
      this.topHeaderCtx.restore();
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.fillStyle = this.strokeColor;
      this.leftHeaderCtx.fillRect(0, 0, 44, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.restore();
    } else if (this.isColSelected) {
      //Top Header
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.strokeColor;
      this.topHeaderCtx.fillRect(
        x - 2,
        0,
        width + 4,
        this.topHeaderCtx.canvas.height
      );
      this.topHeaderCtx.restore();

      //left Header
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(40, 0);
      this.leftHeaderCtx.lineTo(40, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.fillStyle = this.headersHighlightColor;
      this.leftHeaderCtx.fillRect(0, 0, 44, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.lineWidth = 5;
      this.leftHeaderCtx.strokeStyle = this.strokeColor;
      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();
    } else if (this.isRowSelected) {
      //Left Header
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.fillStyle = this.strokeColor;
      this.leftHeaderCtx.fillRect(
        0,
        y - 2,
        this.leftHeaderCtx.canvas.width,
        height + 4
      );
      this.leftHeaderCtx.restore();

      //Top Header
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.moveTo(0, 24);
      this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 24);
      this.topHeaderCtx.fillStyle = this.headersHighlightColor;
      this.topHeaderCtx.fillRect(0, 0, this.topHeaderCtx.canvas.width, 26);
      this.topHeaderCtx.lineWidth = 5;
      this.topHeaderCtx.strokeStyle = this.strokeColor;
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();
    } else {
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.headersHighlightColor;
      this.topHeaderCtx.fillRect(x, 0, width, 24);
      this.topHeaderCtx.moveTo(x - 2, 24);
      this.topHeaderCtx.lineTo(x + width + 2.5, 24);
      this.topHeaderCtx.lineWidth = 5;
      this.topHeaderCtx.strokeStyle = this.strokeColor;
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();

      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(40, y - 2);
      this.leftHeaderCtx.lineTo(40, y + height + 3);
      this.leftHeaderCtx.fillStyle = this.headersHighlightColor;
      this.leftHeaderCtx.fillRect(0, y, 40, height);
      this.leftHeaderCtx.lineWidth = 5;
      this.leftHeaderCtx.strokeStyle = this.strokeColor;
      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();
    }
  }

  highlightLeftHeaders() {
    this.leftHeaderCtx.save();
    this.leftHeaderCtx.beginPath();
    this.leftHeaderCtx.moveTo(40 - 0.5, 0);
    this.leftHeaderCtx.lineTo(40 - 0.5, this.leftHeaderCtx.canvas.height);
    this.leftHeaderCtx.strokeStyle = this.gridStrokeColor;
    this.leftHeaderCtx.stroke();
    this.leftHeaderCtx.restore();

    const [startX, startY, endX, endY] = this.headersHighlightCoordinate;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCurCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCurCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCurCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCurCellHeight(i);
    }

    if (this.isColSelected && this.isRowSelected) {
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.fillStyle = this.strokeColor;
      this.leftHeaderCtx.fillRect(0, 0, 44, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.restore();
    } else if (this.isColSelected) {
      //left Header
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(39, 0);
      this.leftHeaderCtx.lineTo(39, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.fillStyle = this.headersHighlightColor;
      this.leftHeaderCtx.fillRect(0, 0, 44, this.leftHeaderCtx.canvas.height);
      this.leftHeaderCtx.lineWidth = 2;
      this.leftHeaderCtx.strokeStyle = this.strokeColor;
      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();
    } else if (this.isRowSelected) {
      //Left Header
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.fillStyle = this.strokeColor;
      this.leftHeaderCtx.fillRect(
        0,
        y - 2,
        this.leftHeaderCtx.canvas.width,
        height + 4
      );
      this.leftHeaderCtx.restore();
    } else {
      this.leftHeaderCtx.save();
      this.leftHeaderCtx.beginPath();
      this.leftHeaderCtx.moveTo(39, y - 2);
      this.leftHeaderCtx.lineTo(39, y + height + 3);
      this.leftHeaderCtx.fillStyle = this.headersHighlightColor;
      this.leftHeaderCtx.fillRect(0, y, 40, height);
      this.leftHeaderCtx.lineWidth = 2;
      this.leftHeaderCtx.strokeStyle = this.strokeColor;
      this.leftHeaderCtx.stroke();
      this.leftHeaderCtx.restore();
    }
  }

  highlightTopHeader() {
    const [startX, startY, endX, endY] = this.headersHighlightCoordinate;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < startX; i++) {
      x += this.getCurCellWidth(i);
    }
    for (let i = 0; i < startY; i++) {
      y += this.getCurCellHeight(i);
    }
    for (let i = startX; i <= endX; i++) {
      width += this.getCurCellWidth(i);
    }
    for (let i = startY; i <= endY; i++) {
      height += this.getCurCellHeight(i);
    }
    if (this.isColSelected && this.isRowSelected) {
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.strokeColor;
      this.topHeaderCtx.fillRect(0, 0, this.topHeaderCtx.canvas.width, 24);
      this.topHeaderCtx.restore();
    } else if (this.isColSelected) {
      //Top Header
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.strokeColor;
      this.topHeaderCtx.fillRect(
        x - 2,
        0,
        width + 4,
        this.topHeaderCtx.canvas.height
      );
      this.topHeaderCtx.restore();
    } else if (this.isRowSelected) {
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.moveTo(0, 23);
      this.topHeaderCtx.lineTo(this.topHeaderCtx.canvas.width, 23);
      this.topHeaderCtx.fillStyle = this.headersHighlightColor;
      this.topHeaderCtx.fillRect(0, 0, this.topHeaderCtx.canvas.width, 26);
      this.topHeaderCtx.lineWidth = 2;
      this.topHeaderCtx.strokeStyle = this.strokeColor;
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();
    } else {
      this.topHeaderCtx.save();
      this.topHeaderCtx.beginPath();
      this.topHeaderCtx.fillStyle = this.headersHighlightColor;
      this.topHeaderCtx.fillRect(x, 0, width, 24);
      this.topHeaderCtx.moveTo(x - 2, 23);
      this.topHeaderCtx.lineTo(x + width + 2.5, 23);
      this.topHeaderCtx.lineWidth = 2;
      this.topHeaderCtx.strokeStyle = this.strokeColor;
      this.topHeaderCtx.stroke();
      this.topHeaderCtx.restore();
    }
  }

  highlightSelectedAreaEvents() {
    this.mainCtx.canvas.addEventListener("dblclick", (e) => {
      this.inputBoxPosition();
      this.inputBox.focus();
      this.isAnimationRunning = false;
      this.highlightSelectedArea();
      this.drawGrid();
      this.renderLeftHeader();
      this.renderTopHeader();
    });

    this.mainCtx.canvas.addEventListener("pointerdown", (e) => {
      this.highlightAreaPointerDown(e);
    });

    window.addEventListener("pointermove", (e) => {
      this.highlightAreaPointerMove(e);
    });

    window.addEventListener("pointerup", (e) => {
      this.highlightAreaPointerUp();
    });

    window.addEventListener("pointerleave", (e) => {
      this.highlightAreaPointerUp();
    });
  }

  highlightAreaPointerDown(e) {
    this.topheaderSelected = false;
    this.leftheaderSelected = false;
    this.inputBox.style.display = "none";
    this.isColSelected = false;
    this.isRowSelected = false;
    this.alreadyCopy = 0;

    const rect = this.mainCtx.canvas.getBoundingClientRect();
    this.isAreaSelected = true;
    const clickX = (e.clientX - rect.left) / this.scale;
    const clickY = (e.clientY - rect.top) / this.scale;

    const colIndex = this.getCurColumnIndex(clickX);
    const rowIndex = this.getCurRowIndex(clickY);
    this.startingIndex = [
      this.getCurColumnIndex(clickX),
      this.getCurRowIndex(clickY),
    ];

    this.cellPositionLeft = 0;
    this.cellPositionTop = 0;
    this.x1CellIndex = this.getCurColumnIndex(clickX);
    this.y1CellIndex = this.getCurRowIndex(clickY);
    this.x2CellIndex = this.getCurColumnIndex(clickX);
    this.y2CellIndex = this.getCurRowIndex(clickY);

    for (let i = 0; i < this.x1CellIndex; i++) {
      this.cellPositionLeft += this.getCurCellWidth(i);
    }
    for (let i = 0; i < this.y1CellIndex; i++) {
      this.cellPositionTop += this.getCurCellHeight(i);
    }

    const startX = Math.min(this.startingIndex[0], colIndex);
    const startY = Math.min(this.startingIndex[1], rowIndex);
    const endX = Math.max(this.startingIndex[0], colIndex);
    const endY = Math.max(this.startingIndex[1], rowIndex);

    this.selectedDimensionsMain = [startX, startY, endX, endY];
    this.highlightSelectedArea();
    this.drawGrid();
    this.clearLeftHeader();
    this.clearTopheader();
    // this.highlightHeaders();
    this.renderLeftHeader();
    this.renderTopHeader();
  }

  highlightAreaPointerMove(e) {
    if (this.isAreaSelected) {
      const rect = this.mainCtx.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / this.scale;
      const clickY = (e.clientY - rect.top) / this.scale;

      const colIndex = this.getCurColumnIndex(clickX);
      const rowIndex = this.getCurRowIndex(clickY);

      // Determine dimensions of selection
      const startX = Math.max(0, Math.min(this.startingIndex[0], colIndex));
      const startY = Math.max(0, Math.min(this.startingIndex[1], rowIndex));
      const endX = Math.max(this.startingIndex[0], colIndex);
      const endY = Math.max(this.startingIndex[1], rowIndex);

      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.headersHighlightCoordinate = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      // this.highlightHeaders();
      this.renderLeftHeader();
      this.renderTopHeader();
    }
  }

  highlightAreaPointerUp(e) {
    this.isAreaSelected = false;
    const [startX, startY, endX, endY] = this.selectedDimensionsMain;
    let sum = 0,
      max = Number.MIN_VALUE,
      min = Number.MAX_VALUE,
      avg = 0,
      count = 0,
      numerical_count = 0;
    for (let j = startY; j <= endY; j++) {
      const result = this.sheetData.find((item) => item[j]);
      for (let i = startX; i <= endX; i++) {
        let currentData = result ? result[j][i] : "";
        count++;
        if (!isNaN(Number(currentData?.data))) {
          sum += Number(currentData.data);
          max = Math.max(max, currentData.data);
          min = Math.min(min, currentData.data);
          numerical_count++;
        }
        avg = sum / numerical_count;
      }
    }
    const mathsCalculation = document.getElementById("mathsCalculation");
    if (numerical_count == 0 || count <= 1) {
      mathsCalculation.innerHTML = `
      <p>Count: ${count}</p>
      `;
    } else {
      mathsCalculation.innerHTML = `
    <p>Average: ${avg.toFixed(2)}</p>
    <p>Count: ${count}</p>
    <p>Numerical Count: ${numerical_count}</p>
    <p>Min: ${min}</p>
    <p>Max: ${max}</p>
    <p>Sum: ${sum}</p>
    `;
    }
  }

  //----------------------Resize Grid Columns and rows----------------------
  resizeGridEvents() {
    this.pointerDownHeader = this.mainCanvas;
    this.topHeaderCanvas.addEventListener("pointerdown", (e) => {
      this.pointerDownHeader = this.topHeaderCanvas;
      this.resizeGridPointerDown(e, this.topHeaderCanvas);
    });
    this.leftHeaderCanvas.addEventListener("pointerdown", (e) => {
      this.pointerDownHeader = this.leftHeaderCanvas;
      this.resizeGridPointerDown(e, this.leftHeaderCanvas);
    });
    window.addEventListener("pointermove", (e) => {
      let text = e.target.id;
      let result = text.replace(/-sheet-[0,100]/, "");
      if (result == "topHeader") {
        this.pointerDownHeader = this.topHeaderCanvas;
      } else if (result == "leftHeader") {
        this.pointerDownHeader = this.leftHeaderCanvas;
      }
      this.resizeGridPointerMove(e, this.pointerDownHeader);
    });
    window.addEventListener("pointerup", () => this.resizeGridPointerUp());
    window.addEventListener("pointerleave", () => this.resizeGridPointerUp());
  }

  resizeGridPointerDown(e, header) {
    this.inputBox.style.display = "none";

    if (this.isAnimationRunning) {
      this.alreadyCopy = 1;
    }

    let rect = header.getBoundingClientRect();

    const clickX = (e.clientX - rect.left) / this.scale;
    const clickY = (e.clientY - rect.top) / this.scale;
    let columnIndex = this.getCurColumnIndex(clickX);
    let rowIndex = this.getCurRowIndex(clickY);

    let iscolPointDraggable = this.isColPointDraggable(clickX);
    let isrowPointDraggable = this.isRowPointDraggable(clickY);

    if (!iscolPointDraggable) {
      this.startingIndexTop = [
        this.getCurColumnIndex(clickX),
        this.getCurRowIndex(clickY),
      ];
    }

    if (!isrowPointDraggable) {
      this.startingIndexLeft = [
        this.getCurColumnIndex(clickX),
        this.getCurRowIndex(clickY),
      ];
    }

    let columnLeft = 0;
    let rowTop = 0;
    for (let i = 0; i < columnIndex; i++) {
      columnLeft += this.getCurCellWidth(i);
    }
    for (let i = 0; i < rowIndex; i++) {
      rowTop += this.getCurCellHeight(i);
    }

    if (
      header == this.topHeaderCanvas &&
      rowIndex == 0 &&
      columnIndex !== -1 &&
      !iscolPointDraggable
    ) {
      this.clearTopheader();
      this.clearLeftHeader();
      this.isTopAreaSelected = true;
      this.topheaderSelected = true;
      this.alreadyCopy = 0;
      this.currSelectedCol = this.startingIndexTop[0];

      this.isColSelected = true;
      this.isRowSelected = false;
      this.currSelectedRow = "all";
      const startX = Math.min(this.startingIndexTop[0], columnIndex);
      const startY = Math.min(this.startingIndexTop[1], rowIndex);
      const endX = Math.max(this.startingIndexTop[0], columnIndex);
      const endY = Math.max(this.startingIndexTop[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();

      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    } else if (
      header == this.leftHeaderCanvas &&
      columnIndex == 0 &&
      rowIndex !== -1 &&
      !isrowPointDraggable
    ) {
      this.clearLeftHeader();
      this.clearTopheader();
      this.isLeftAreaSelected = true;
      this.leftheaderSelected = true;
      this.alreadyCopy = 0;
      this.currSelectedRow = this.startingIndexLeft[1];
      this.isRowSelected = true;
      this.isColSelected = false;
      this.currSelectedCol = "all";
      const startX = Math.min(this.startingIndexLeft[0], columnIndex);
      const startY = Math.min(this.startingIndexLeft[1], rowIndex);
      const endX = Math.max(this.startingIndexLeft[0], columnIndex);
      const endY = Math.max(this.startingIndexLeft[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();

      // this.highlightHeaders();
      this.renderLeftHeader();
      this.renderTopHeader();
    }
    if (rowIndex == 0 && columnIndex !== -1 && iscolPointDraggable) {
      this.isDraggingTop = true;
      this.resizeColIndex = columnIndex;
      this.resizeColTop = clickX;
      this.resizeColWidth = this.getCurCellWidth(columnIndex);
    }

    if (columnIndex == 0 && rowIndex !== -1 && isrowPointDraggable) {
      this.isDraggingLeft = true;
      this.resizeRowIndex = rowIndex;
      this.resizeRowTop = clickY;
      this.resizeRowHeight = this.getCurCellHeight(rowIndex);
    }

    this.rowIndex2 = this.getCurRowIndex(clickY - 5);
    this.columnIndex2 = this.getCurColumnIndex(clickX - 10);
    let width = this.getCurCellWidth(this.columnIndex2);
    let height = this.getCurCellHeight(this.rowIndex2);

    if (header == this.topHeaderCanvas && iscolPointDraggable) {
      this.mainCtx.beginPath();
      this.mainCtx.save();
      this.mainCtx.lineWidth = 2;
      this.mainCtx.strokeStyle = this.strokeColor;
      this.columnLeftOfDrag = columnLeft;
      this.mainCtx.strokeRect(
        columnLeft - 0.5,
        -2,
        width + 1,
        this.mainCtx.canvas.height
      );
      this.mainCtx.restore();
    }

    if (header == this.leftHeaderCanvas && isrowPointDraggable) {
      this.rowTopOfDrag = rowTop;
      this.mainCtx.beginPath();
      this.mainCtx.save();
      this.mainCtx.lineWidth = 2;
      this.mainCtx.strokeStyle = this.strokeColor;
      this.mainCtx.strokeRect(
        -2,
        rowTop - 0.5,
        this.mainCtx.canvas.width,
        height + 1
      );
      this.mainCtx.restore();
    }
  }

  resizeGridPointerMove(e, header) {
    this.resizeLineVertical = document.getElementById("resizeLineVertical");
    this.resizeLineHorizontal = document.getElementById("resizeLineHorizontal");

    let rect = header.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / this.scale;
    const clickY = (e.clientY - rect.top) / this.scale;
    let columnIndex = this.getCurColumnIndex(clickX);
    let rowIndex = this.getCurRowIndex(clickY);
    let iscolPointDraggable = this.isColPointDraggable(clickX);
    let isrowPointDraggable = this.isRowPointDraggable(clickY);

    if (
      // rowIndex == 0 && columnIndex !== -1 &&
      iscolPointDraggable
    ) {
      this.topHeaderCanvas.style.cursor = "ew-resize";
    } else {
      this.topHeaderCanvas.style.cursor = "pointer";
    }

    if (
      // columnIndex == 0 && rowIndex !== -1 &&
      isrowPointDraggable
    ) {
      this.leftHeaderCanvas.style.cursor = "ns-resize";
    } else {
      this.leftHeaderCanvas.style.cursor = "pointer";
    }

    if (this.isDraggingTop) {
      this.columnIndex2 = this.getCurColumnIndex(clickX - 10);
      this.clearTopheader();
      this.clearLeftHeader();
      // this.highlightHeaders();
      this.topHeaderCanvas.style.cursor = "ew-resize";
      this.mainCanvas.style.cursor = "ew-resize";
      this.resizeLineVertical.style.cursor = "ew-resize";
      const deltaX = clickX - this.resizeColTop;
      this.newWidth = Math.max(20, this.resizeColWidth + deltaX);
      this.cellWidths.set(this.resizeColIndex, this.newWidth);

      if (Array.isArray(this.currSelectedCol) && this.topheaderSelected) {
        this.colFlag = true;
      }

      if (!this.isColSelected) {
        cancelAnimationFrame(this.animationFrameId);
        this.startMarchingAntsAnimation();
      }

      this.resizeLineVertical.style.display = "block";
      this.resizeLineVertical.style.height = `${this.mainCtx.canvas.height}px`;

      this.renderTopHeader();
      this.renderLeftHeader();
    } else if (this.isTopAreaSelected) {
      this.topHeaderCanvas.style.cursor = "pointer";
      const startX = Math.min(this.startingIndexTop[0], columnIndex);
      const startY = Math.min(this.startingIndexTop[1], rowIndex);
      const endX = Math.max(this.startingIndexTop[0], columnIndex);
      const endY = Math.max(this.startingIndexTop[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    }

    if (this.isDraggingLeft) {
      this.rowIndex2 = this.getCurRowIndex(clickY - 5);

      this.clearLeftHeader();
      this.clearTopheader();
      // this.highlightHeaders();
      this.leftHeaderCanvas.style.cursor = "ns-resize";
      this.resizeLineHorizontal.style.cursor = "ns-resize";

      const deltaY = clickY - this.resizeRowTop;
      this.newHeight = Math.max(10, this.resizeRowHeight + deltaY);

      this.cellHeight.set(this.resizeRowIndex, this.newHeight);
      if (Array.isArray(this.currSelectedRow) && this.leftheaderSelected) {
        this.rowFlag = true;
      }

      if (!this.isRowSelected) {
        cancelAnimationFrame(this.animationFrameId);
        this.startMarchingAntsAnimation();
      }

      this.resizeLineHorizontal.style.display = "block";
      this.resizeLineHorizontal.style.width = `${this.mainCtx.canvas.width}px`;

      this.renderLeftHeader();
      this.renderTopHeader();
    } else if (this.isLeftAreaSelected) {
      this.leftHeaderCanvas.style.cursor = "pointer";
      const startX = Math.min(this.startingIndexLeft[0], columnIndex);
      const startY = Math.min(this.startingIndexLeft[1], rowIndex);
      const endX = Math.max(this.startingIndexLeft[0], columnIndex);
      const endY = Math.max(this.startingIndexLeft[1], rowIndex);
      this.selectedDimensionsMain = [startX, startY, endX, endY];
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
    }
  }

  resizeGridPointerUp() {
    this.mainCanvas.style.cursor = "cell";
    this.resizeLineHorizontal.style.display = "none";
    this.resizeLineVertical.style.display = "none";
    if (
      this.topheaderSelected &&
      this.colFlag &&
      this.columnIndex2 >= this.currSelectedCol[0] &&
      this.columnIndex2 <= this.currSelectedCol[1]
    ) {
      this.colFlag = false;
      for (let i = this.currSelectedCol[0]; i <= this.currSelectedCol[1]; i++) {
        this.cellWidths.set(i, this.newWidth);
      }
    }

    if (
      this.rowFlag &&
      this.rowIndex2 >= this.currSelectedRow[0] &&
      this.rowIndex2 <= this.currSelectedRow[1]
    ) {
      for (let i = this.currSelectedRow[0]; i <= this.currSelectedRow[1]; i++) {
        this.cellHeight.set(i, this.newHeight);
      }
      this.rowFlag = false;
    }

    this.isTopAreaSelected = false;
    this.isLeftAreaSelected = false;

    if (this.isDraggingTop) {
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearTopheader();
      this.clearLeftHeader();
      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();

      this.isDraggingTop = false;
      this.resizeColIndex = -1;
    }
    if (this.isDraggingLeft) {
      this.mainCtx.clearRect(
        0,
        0,
        this.mainCanvas.width,
        this.mainCanvas.height
      );
      this.highlightSelectedArea();
      this.drawGrid();
      this.clearLeftHeader();
      this.clearTopheader();
      // this.highlightHeaders();
      this.renderTopHeader();
      this.renderLeftHeader();
      this.isDraggingLeft = false;
      this.resizeRowIndex = -1;
    }
  }

  //----------------------Get Calculated Values----------------------
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
    let cellPosition = 0;
    for (let i = 0; i <= this.numRows; i++) {
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
    for (let i = 0; i <= this.numRows; i++) {
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

export { newCanvas };
