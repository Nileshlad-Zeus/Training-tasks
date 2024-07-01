//navbar tab change
function activeTab(evt) {
  var i, tablinks;
  tablinks = document.getElementsByClassName("navEle");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("activetab", "");
  }
  evt.currentTarget.className += " activetab";
}

//hamburger menu open close for mobile devices
const navoptions = document.getElementById("sidebar");
function togglenav() {
  navoptions.classList.toggle("activeSidebar");
}




function activeSide(evt) {
  const options = evt.currentTarget.querySelector(".sideEle-Options");
  const options2 = document.getElementsByClassName("sideEle-Options");
  const sideEle = document.getElementsByClassName("sideEle");

  for (i = 0; i < sideEle.length; i++) {
    sideEle[i].classList.remove("activetab1");
  }
  evt.currentTarget.classList.add("activetab1");
  
  for (i = 0; i < options2.length; i++) {
   options2[i].style.display = "none";
  }
  
  if (options?.style?.display == "none") {
    options.style.display = "flex";
  } else {
    options.style.display = "none";
  }
}



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

//nav modal
const notificationIcon = document.querySelector(".notificationIcon");
const notificationIconimg = document.querySelector(".notificationIcon img");
const notificationModal = document.querySelector("#notificationModal");

notificationIcon.addEventListener("mouseover", () => {
  notificationModal.classList.add("displayBlock");
  notificationIconimg.classList.add("hover");
  navoptions.classList.remove("activeSidebar");
});
notificationIcon.addEventListener("mouseout", () => {
  notificationModal.classList.remove("displayBlock");
  navoptions.classList.add("activeSidebar");
  notificationIconimg.classList.remove("hover");
});

const announcementsIcon = document.querySelector(".announcementsIcon");
const announcementsIconimg = document.querySelector(".announcementsIcon img");
const announcementModal = document.querySelector("#announcementModal");

announcementsIcon.addEventListener("mouseover", () => {
  announcementModal.classList.add("displayBlock");
  announcementsIconimg.classList.add("hover");
  navoptions.classList.remove("activeSidebar");
});
announcementsIcon.addEventListener("mouseout", () => {
  announcementModal.classList.remove("displayBlock");
  announcementsIconimg.classList.remove("hover");
  navoptions.classList.add("activeSidebar");
});

let notificationCount = localStorage.getItem("notification");
const notificationNumber = document.querySelector(".notificationIcon .number");
notificationNumber.innerHTML = notificationCount;

let announcementCount = localStorage.getItem("announcement");
const announcementNumber = document.querySelector(".announcementsIcon .number");
announcementNumber.innerHTML = announcementCount;
