//Selections
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
let initialColors;

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
    colorDivs.forEach((div, index) =>{
        const hexText = div.children[0];
        const randomColor = generateHex();

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

randomColors();
//Event listeners