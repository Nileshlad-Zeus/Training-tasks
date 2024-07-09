const modal = document.querySelector(".modal");
const fileUploadModal = document.querySelector("#fileUploadModal");
const file = document.querySelector("input[type='file']");
const closeModal = document.querySelector(".modal i");
const uplaodFile = document.querySelector("#uplaodFile");
const fileSubmitBtn = document.querySelector("#fileSubmitBtn");

const modalHeading = modal.querySelector("h3");
uplaodFile.addEventListener("click", () => {
  fileUploadModal.classList.add("fileUploadModal");
  fileUploadModal.classList.remove("closeFileUploadModal");
});

modal.addEventListener("click", () => {
  file.click();
});

file.addEventListener("change", (e) => {
  if (file.files.length) {
    const files = e.target.files;
    const fileName = files[0].name;
    modalHeading.innerText = fileName;
  }
});

fileSubmitBtn.addEventListener("click", (e) => {
  e.stopPropagation();
});

closeModal.addEventListener("click", (e) => {
  e.stopPropagation();
  fileUploadModal.classList.add("closeFileUploadModal");
  fileUploadModal.classList.remove("fileUploadModal");
});
