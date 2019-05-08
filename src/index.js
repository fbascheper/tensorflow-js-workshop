import * as ui from './ui';
import {Webcam} from './webcam';

// The number of classes we want to predict. In this workshop, we will be
// predicting 2 classes (left and right).
const NUM_CLASSES = 2;

// A webcam class that generates Tensors from the images from the webcam.
const webcam = new Webcam(document.getElementById('webcam'));

// The dataset object where we will store activations.
const controllerDataset = undefined;

let truncatedMobileNet = undefined;
let model = undefined;

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadTruncatedMobileNet() {
}

// When the UI buttons are pressed, read a frame from the webcam and associate
// it with the class label given by the button.
// Left, right are labels 0, 1 respectively.
ui.setSampleHandler(label => {
});

/**
 * Sets up and trains the classifier.
 */
async function train() {
}

let isPredicting = false;
let isTrained = false;

async function predict() {
}

async function init() {
    console.log('Init - start');

    try {
        await webcam.setup();
    } catch (e) {
        document.getElementById('no-webcam').style.display = 'block';
    }

    ui.init();

    console.log('Init - finished');
}

// Initialize the application.
init().then(() => {

    console.log('Adding listeners to doc');

    document.getElementById('train').addEventListener('click', async () => {
        alert('Please add some samples before training!');
    });

    document.getElementById('play').addEventListener('click', () => {
        ui.startBreakout();
    });


});
