//hamburger menu open close for mobile devices
const navoptions = document.getElementById("nav");
const togglenav = () => {
  if (navoptions.style.display == "none") {
    navoptions.style.display = "flex";
  } else {
    navoptions.style.display = "none";
  }
};


//header
const headertab1 = document.getElementById("headertab1");
const headertab2 = document.getElementById("headertab2");
headertab1.addEventListener("click", () => {
  if (!headertab1.classList.contains("activeTab")) {
    headertab1.classList.add("activeTab");
    headertab2.classList.remove("activeTab");
  }
});
headertab2.addEventListener("click", () => {
  if (!headertab2.classList.contains("activeTab")) {
    headertab2.classList.add("activeTab");
    headertab1.classList.remove("activeTab");
  }
});


//navbar tab change
function activeTab(evt) {
  var i, tablinks;
  tablinks = document.getElementsByClassName("navEle");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("activetab", "");
  }
  evt.currentTarget.className += " activetab";
}



//card rendering
const data = [
  {
    coursename: "Acceleration",
    subject: "Physics",
    grade: 7,
    grade2: 2,
    courseLen: {
      units: 4,
      lessons: 18,
      topics: 24,
    },
    classStatus: "",
    teachers: [
      { value: "frank", label: "Mr. Frank's Class B" },
      { value: "all", label: "All Classes" },
    ],
    noOfStudents: 50,
    startdate: "21-Jan-2020",
    enddate: "21-Aug-2020",
    image: "imageMask",
    fav: "favourite",
    actionsOpacity: {
      preview: 1,
      manageCourse: 1,
      gradeSubmissions: 1,
      reports: 1,
    },
    expired: false,
  },
  {
    coursename: "Displacement, Velocity and Speed",
    subject: "Physics 2",
    grade: 6,
    grade2: 3,
    courseLen: {
      units: 2,
      lessons: 15,
      topics: 20,
    },
    classStatus: "disabled",
    teachers: [{ value: "noclass", label: "No Classes" }],
    noOfStudents: "",
    startdate: "",
    enddate: "",
    image: "imageMask-1",
    fav: "favourite",
    actionsOpacity: {
      preview: 1,
      manageCourse: 0.6,
      gradeSubmissions: 0.6,
      reports: 1,
    },
    expired: false,
  },
  {
    coursename:
    "Introduction to Biology: Micro organisms and how they affec...",
    subject: "Biology",
    grade: 4,
    grade2: 1,
    courseLen: {
      units: 5,
      lessons: 16,
      topics: 22,
    },
    classStatus: "",
    teachers: [{ value: "all", label: "All Classes" }],
    noOfStudents: "300",
    startdate: "",
    enddate: "",
    image: "imageMask-3",
    fav: "favourite",
    actionsOpacity: {
      preview: 1,
      manageCourse: 0.6,
      gradeSubmissions: 0.6,
      reports: 1,
    },
    expired: false,
  },
  {
    coursename: "Introduction to High School Mathematics",
    subject: "Mathematics",
    grade: 8,
    grade2: 3,
    courseLen: {
      units: 4,
      lessons: 18,
      topics: 24,
    },
    classStatus: "",
    teachers: [
      { value: "frank", label: "Mr. Frank's Class B" },
      { value: "all", label: "All Classes" },
    ],
    noOfStudents: "44",
    startdate: "14-Oct-2019",
    enddate: "20-Oct-2020",
    image: "imageMask-2",
    fav: "favourite",
    actionsOpacity: {
      preview: 1,
      manageCourse: 1,
      gradeSubmissions: 1,
      reports: 1,
    },
    expired: true,
  },
];

data.forEach((d) => {
  const courseSec = document.getElementById("coursesSection");
  var z = document.createElement("div"); // is a node
  z.classList.add("courseCard");
  z.innerHTML = `
  <span class="expired" style="display:${
    d.expired == true ? "block" : "none"
  }">Expired</span>
  <div class="coursesInfo">
  <div class="courseImage">
  <img src="./Images/CourseImage/${d.image}.png" alt="img" />
  </div>
  <div class="courseDetail">
  <div class="courseName">
  <p>${d.coursename}</p>
  <span>
  <img src="./Images/icons/${d.fav}.svg" alt="" />
  </span>
  </div>
  <div class="courseSub">
  <p>${d.subject}</p>
  <p>|</p>
  <p>Grade ${d.grade} 
  <span style="color: #1f7a54">+${d.grade2}</span>
  </p>
  </div>
  <div class="courseLen">
  <p><b>${d?.courseLen?.units}</b> Units</p>
  <p><b>${d?.courseLen?.lessons}</b> Lessons</p>
  <p><b>${d?.courseLen?.topics}</b> Topics</p>
  </div>
  <div class="courseTeacher">
  
  <select name="teacher" id="teacher" ${d?.classStatus}>
                
                  ${d.teachers.map(
                    (option) =>
                      `<option value=${option.value}>${option.label}</option>`
                  )}

                </select>
              </div>
              <div class="courseDate" style="display: ${
                d.classStatus == "disabled" ? "none" : "flex"
              }">
                <p>${d.noOfStudents} Students</p>
                ${
                  d.startdate &&
                  `<p>|</p>
                    <p>${d.startdate} - ${d.enddate}</p>`
                }
              </div>
            </div>
          </div>
          <hr />
          <div class="coursesActions">
            <span>
              <img src="./Images/icons/preview.svg" alt="" srcset=""   style="opacity: ${
                d?.actionsOpacity?.preview
              };" />
            </span>
            <span>
              <img src="./Images/icons/manage course.svg" alt="" srcset="" style="opacity: ${
                d?.actionsOpacity?.manageCourse
              };"/>
            </span>
            <span>
              <img
                src="./Images/icons/grade submissions.svg"
                alt=""
                srcset=""
                style="opacity: ${d?.actionsOpacity?.gradeSubmissions};"
              />
            </span>
            <span>
              <img src="./Images/icons/reports.svg" alt="" srcset="" style="opacity: ${
                d?.actionsOpacity?.reports
              };" />
            </span>
          </div>`;
  courseSec.appendChild(z);
});
