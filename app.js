//Selections
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const lockButton = document.querySelectorAll('.lock');
let initialColors;
let savedPalettes = [];

//Event listeners
generateBtn.addEventListener('click', randomColors);

sliders.forEach(slider =>{
    slider.addEventListener('input', hslControls)
});

colorDivs.forEach((div,index)=>{
    div.addEventListener("change", ()=>{
        updateText(index);
    });
});

currentHexes.forEach(hex=>{
    hex.addEventListener('click', ()=>{
        copyToClipboard(hex);
    });
});

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustButton.forEach((button, index) =>{
    button.addEventListener('click', ()=>{
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button, index) =>{
    button.addEventListener('click', ()=>{
        closeAdjustmentPanel(index);
    });
});

lockButton.forEach((button, index) => {
    button.addEventListener("click", e => {
      lockLayer(e, index);
    });
  });

//Functions
function generateHex(){ //uses chroma.js to generate random color
    const hexColor = chroma.random();
    return hexColor;

         //no api ver.
            // let hash = "#";
            // const values = "0123456789ABCDEF";
            // for(i=0; i < 6; i++){
            //     hash += values[Math.floor(Math.random()*16)];
            // }
            // return hash;
}

function randomColors(){ //generate random color across each div
   //set up initial array
   initialColors = [];
   //generate hexes
    colorDivs.forEach((div, index) =>{
        const hexText = div.children[0];
        const randomColor = generateHex();

        //adds non-locked colors to array
        if(div.classList.contains('locked')){
            initialColors.push(hexText.innerText);
            return;
        }else{
        initialColors.push(chroma(randomColor).hex());
        }

        //add selected color to bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        //check contrast
        checkContrast(randomColor, hexText);
        //initialize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const bright = sliders[1];
        const sat = sliders[2];

        colorizeSliders(color, hue, bright, sat);
    });
    //reset inputs
    resetInputs();
    //check for button contrast
    adjustButton.forEach((button,index) =>{
        checkContrast(initialColors[index], button);
        checkContrast(initialColors[index], lockButton[index]);
    });
}

function checkContrast(color, text){ //uses chroma.js to check luminance
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    }else{
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, bright, sat){
    
    //saturation scale
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color,fullSat]);

    //brightness scale
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright,"white"]);

    //update input colors
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204, 204, 75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
    sat.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    bright.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
}
function hslControls(e){
    const index = e.target.getAttribute('data-bright') || e.target.getAttribute('data-sat') || e.target.getAttribute('data-hue');

    let sliders = e.target.parentElement.querySelectorAll('input[type ="range"]');
    const hue = sliders[0];
    const bright = sliders [1];
    const sat = sliders[2];

    //references initial colors so saturation is not lost in b/w changes
    const bgColor = initialColors[index];

    let color = chroma(bgColor)
    .set('hsl.h', hue.value)
    .set('hsl.l', bright.value)
    .set('hsl.s', sat.value);

    colorDivs[index].style.backgroundColor = color;
   
    colorizeSliders(color,hue,bright,sat);
}

function updateText(index){
    const active = colorDivs[index];
    const color = chroma(active.style.backgroundColor);
    const text = active.querySelector('h2');
    const icons = active.querySelectorAll('.controls button');
    text.innerText = color.hex();

    checkContrast(color, text);
    for(icon of icons){
    checkContrast(color, icon);
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if(slider.name === 'hue'){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if(slider.name === 'saturation'){
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100; //rounds off to .01 values
        }
        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100; //rounds off to .01 values
        }
    });

}

function copyToClipboard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove('active');
}

function lockLayer(e, index) {
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");
  
    if (lockSVG.classList.contains("fa-lock-open")) {
      e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
  }



//For local storage
//
//
//Selections
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

//Event Listeners
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

//Functions
function openPalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
 } 
 
 function savePalette(e){
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    //Generate object
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    if (paletteObjects) {
      paletteNr = paletteObjects.length;
    } else {
      paletteNr = savedPalettes.length;
    }
    const paletteObj = {name, colors, nr: paletteNr};
    savedPalettes.push(paletteObj);
    savetoLocal(paletteObj);
    saveInput.value = '';

    //Generate palette for Library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";

    //Attach event to the btn
    paletteBtn.addEventListener("click", e => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
        initialColors.push(color);
        colorDivs[index].style.backgroundColor = color;
        const text = colorDivs[index].children[0];
        checkTextContrast(color, text);
        updateText(index);
    });
    resetInputs();
    });
    //append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes') === null){
        localPalettes = [];
    }else{
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
  }
  function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
  }

function getLocal() {
    if (localStorage.getItem("palettes") === null) {
      //Local Palettes
      localPalettes = [];
    } else {
      const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
      // *2
  
      savedPalettes = [...paletteObjects];
      paletteObjects.forEach(paletteObj => {
        //Generate the palette for Library
        const palette = document.createElement("div");
        palette.classList.add("custom-palette");
        const title = document.createElement("h4");
        title.innerText = paletteObj.name;
        const preview = document.createElement("div");
        preview.classList.add("small-preview");
        paletteObj.colors.forEach(smallColor => {
          const smallDiv = document.createElement("div");
          smallDiv.style.backgroundColor = smallColor;
          preview.appendChild(smallDiv);
        });
        const paletteBtn = document.createElement("button");
        paletteBtn.classList.add("pick-palette-btn");
        paletteBtn.classList.add(paletteObj.nr);
        paletteBtn.innerText = "Select";
  
        //Attach event to the btn
        paletteBtn.addEventListener("click", e => {
          closeLibrary();
          const paletteIndex = e.target.classList[1];
          initialColors = [];
          paletteObjects[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkContrast(color, text);
            updateText(index);
          });
          resetInputs();
        });
  
        //Append to Library
        palette.appendChild(title);
        palette.appendChild(preview);
        palette.appendChild(paletteBtn);
        libraryContainer.children[0].appendChild(palette);
      });
    }
  }

//runs on page load
getLocal();
randomColors();