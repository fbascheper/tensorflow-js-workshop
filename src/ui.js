import * as tf from '@tensorflow/tfjs';

const CONTROLS = ['left', 'right'];
const CONTROL_CODES = [37, 39];

export function init() {
    document.getElementById('controller').style.display = '';
    statusElement.style.display = 'none';
}

const trainStatusElement = document.getElementById('train-status');

// Set hyper params from UI values.
const learningRateElement = document.getElementById('learningRate');
export const getLearningRate = () => +learningRateElement.value;

const batchSizeFractionElement = document.getElementById('batchSizeFraction');
export const getBatchSizeFraction = () => +batchSizeFractionElement.value;

const epochsElement = document.getElementById('epochs');
export const getEpochs = () => +epochsElement.value;

const denseUnitsElement = document.getElementById('dense-units');
export const getDenseUnits = () => +denseUnitsElement.value;
const statusElement = document.getElementById('status');

export function startBreakout() {
    ordina.breakout.startGamePlay();
}

export function predictClass(classId) {
    ordina.breakout.keyPressed(CONTROL_CODES[classId]);
    document.body.setAttribute('data-active', CONTROLS[classId]);
}

export function isPredicting() {
    statusElement.style.visibility = 'visible';
}

export function donePredicting() {
    statusElement.style.visibility = 'hidden';
}

export function trainStatus(status) {
    trainStatusElement.innerText = status;
}

export let addSampleHandler;

export function setSampleHandler(handler) {
    addSampleHandler = handler;
}

let mouseDown = false;
const totals = [0, 0];

const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

const clearLeftButton = document.getElementById('clear-left');
const clearRightButton = document.getElementById('clear-right');

const thumbDisplayed = {};

async function handler(label) {
    const className = CONTROLS[label];
    const total = document.getElementById(className + '-total');
    mouseDown = true;

    while (mouseDown) {
        addSampleHandler(label);
        document.body.setAttribute('data-active', CONTROLS[label]);
        total.innerText = totals[label]++;
        await tf.nextFrame();
    }
    document.body.removeAttribute('data-active');
}

async function clear(label) {
    alert('TODO - implement!!');
}

leftButton.addEventListener('mousedown', () => handler(0));
leftButton.addEventListener('mouseup', () => mouseDown = false);

rightButton.addEventListener('mousedown', () => handler(1));
rightButton.addEventListener('mouseup', () => mouseDown = false);

clearLeftButton.addEventListener('click', () => clear(0));
clearRightButton.addEventListener('click', () => clear(1));

export function drawThumb(img, label) {
    if (thumbDisplayed[label] == null) {
        const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
        draw(img, thumbCanvas);
    }
}

export function draw(image, canvas) {
    const [width, height] = [224, 224];
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image.dataSync();
    for (let i = 0; i < height * width; ++i) {
        const j = i * 4;
        imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
        imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
        imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
        imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
}
