const openColorPalette = document.getElementById("openColorPalette");
const colorSelector = document.getElementById("colorSelector");

openColorPalette.addEventListener("click",(e)=>{
    colorSelector.click()
    
})

colorSelector.addEventListener("change",(e)=>{
    console.log(colorSelector.value);
})