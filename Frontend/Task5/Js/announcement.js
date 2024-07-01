import data from '../Data/announcementData.json' with {type: "json"};

    let count = 0;
  //card rendering
  data.forEach((d) => {
    const announcementSection = document.getElementById("announcementSection");
    var z = document.createElement("div"); // is a node
    z.classList.add("modalCard");
    if(d.readStatus==false){
        z.classList.add("inactive")
        count++;
    }
    z.innerHTML = `
        ${d.readStatus == true? 
            `<span class="icon">
                <img src="./Images/icons/check-circle.svg" alt="icon"/>
            </span>` :
            `<span class=" icon">
                <img src="./Images/icons/DND-Icon.svg" alt="icon"/>
            </span>`
        }
        <div class="from">
            <p>PA: <b> ${d.PA} </b></p>
        </div>
        <div class="message">
            ${d.Description}
        </div>
        ${d.Course &&
        `<div class="course">
        Course: ${
         d.Course!=""?`${d.Course}`:""
        } </div>`
    }
        <div class="footer">
        ${d.files_atteched!=""?`
            <div class="fileattach">
                    <img src="./Images/icons/attach-file.svg" alt="icon"/> 
                ${d.files_atteched}
            </div>`:""
        }
            <div class="timestamp">${d.Date_Time}</div>
        </div>
    `;
    announcementSection.appendChild(z);
  });
  
  localStorage.setItem('announcement',count);