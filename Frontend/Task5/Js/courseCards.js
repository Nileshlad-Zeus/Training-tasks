import data from '../Data/courseData.json' with {type: "json"};

  //card rendering
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
              (option) => `<option value=${option.value}>${option.label}</option>`
            )}
          </select>
        </div>
        <div class="courseDate" 
              style="display: ${d.classStatus == "disabled" ? "none" : "flex"}">
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
        <img src="./Images/icons/preview.svg" alt="" srcset=""
          style="opacity: ${d?.actionsOpacity?.preview};"/>
      </span>
      <span>
        <img src="./Images/icons/manage course.svg" alt="" srcset=""
          style="opacity: ${d?.actionsOpacity?.manageCourse};"/>
      </span>
      <span>
        <img src="./Images/icons/grade submissions.svg" alt="" srcset=""
          style="opacity: ${d?.actionsOpacity?.gradeSubmissions};"/>
      </span>
      <span>
        <img src="./Images/icons/reports.svg" alt="" srcset=""
          style="opacity: ${d?.actionsOpacity?.reports};" />
      </span>
    </div>`;
    courseSec.appendChild(z);
  });
  