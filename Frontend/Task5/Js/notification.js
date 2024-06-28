import data from '../Data/notificationData.json' with {type: "json"};

  //card rendering
  data.forEach((d) => {
    const notificationSection = document.getElementById("notificationSection");
    var z = document.createElement("div"); // is a node
    z.classList.add("modalCard");
    if(d.readStatus==false){
        z.classList.add("inactive")
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
        ${d.PA?
            `<div class="from">
                <p>PA: <b> ${d.PA} </b></p>
            </div>`:
            ``
        }
        
        <div class="message">
            ${d.Description}
        </div>
        ${d.Course &&
            `<div class="course">
                Course: <b> ${d.Course!=""?`${d.Course}`:""}</b>
            </div>`
        }
        ${d.class &&
            `<div class="course">
                Class: <b> ${d.class!=""?`${d.class}`:""}</b>
            </div>`
        }
        <div class="footer">
        ${d.files_atteched && d.files_atteched!=""?`
            <div class="fileattach">
                <span > 
                 <img src="./Images/icons/attach-file.svg" alt="icon"/> 
                </span>
                ${d.files_atteched}
            </div>`:""
        }
            <div class="timestamp">${d.Date_Time}</div>
        </div>
    `;
    notificationSection.appendChild(z);
  });
  