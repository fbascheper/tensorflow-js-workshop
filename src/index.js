import * as tf from '@tensorflow/tfjs';
import * as ui from './ui';
import {ControllerDataset} from "./controller-dataset";
import {Webcam} from './webcam';

// The number of classes we want to predict. In this workshop, we will be
// predicting 2 classes (left and right).
const NUM_CLASSES = 2;

// A webcam class that generates Tensors from the images from the webcam.
const webcam = new Webcam(document.getElementById('webcam'));

// The dataset object where we will store activations.
const controllerDataset = new ControllerDataset(NUM_CLASSES);

let truncatedMobileNet = undefined;
let model = undefined;

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadTruncatedMobileNet() {
    const mobilenet = await tf.loadLayersModel(
        'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');

    // Return a model that outputs an internal activation.
    const layer = mobilenet.getLayer('conv_pw_13_relu');
    return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
}

// When the UI buttons are pressed, read a frame from the webcam and associate
// it with the class label given by the button.
// Left, right are labels 0, 1 respectively.
ui.setSampleHandler(label => {
    tf.tidy(() => {
        const img = webcam.capture();
        controllerDataset.addSample(truncatedMobileNet.predict(img), label);

        // Draw the preview thumbnail.
        ui.drawThumb(img, label);
    });
});

/**
 * Sets up and trains the classifier.
 */
async function train() {
    if (controllerDataset.xs == null) {
        throw new Error('Add some samples before training!');
    }

    // Creates a 2-layer fully connected model. By creating a separate model,
    // rather than adding layers to the mobilenet model, we "freeze" the weights
    // of the mobilenet model, and only train weights from the new model.
    model = tf.sequential({
        layers: [
            // Flattens the input to a vector so we can use it in a dense layer. While
            // technically a layer, this only performs a reshape (and has no training
            // parameters).
            tf.layers.flatten({
                inputShape: truncatedMobileNet.outputs[0].shape.slice(1)
            }),
            // Layer 1.
            tf.layers.dense({
                units: ui.getDenseUnits(),
                activation: 'relu',
                kernelInitializer: 'varianceScaling',
                useBias: true
            }),
            // Layer 2. The number of units of the last layer should correspond
            // to the number of classes we want to predict.
            tf.layers.dense({
                units: NUM_CLASSES,
                kernelInitializer: 'varianceScaling',
                useBias: false,
                activation: 'softmax'
            })
        ]
    });

    // Creates the optimizers which drives training of the model.
    const optimizer = tf.train.adam(ui.getLearningRate());
    // We use categoricalCrossentropy which is the loss function we use for
    // categorical classification which measures the error between our predicted
    // probability distribution over classes (probability that an input is of each
    // class), versus the label (100% probability in the true class)>
    model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});

    // We parameterize batch size as a fraction of the entire dataset because the
    // number of samples that are collected depends on how many samples the user
    // collects. This allows us to have a flexible batch size.
    const batchSize =
        Math.floor(controllerDataset.xs.shape[0] * ui.getBatchSizeFraction());
    if (!(batchSize > 0)) {
        throw new Error(
            `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
    }

    // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
    model.fit(controllerDataset.xs, controllerDataset.ys, {
        batchSize,
        epochs: ui.getEpochs(),
        callbacks: {
            onBatchEnd: async (batch, logs) => {
                ui.trainStatus('Loss: ' + logs.loss.toFixed(5));
            }
        }
    });
}

let isPredicting = false;
let isTrained = false;

async function predict() {
    ui.isPredicting();
    while (isPredicting) {
        const predictedClass = tf.tidy(() => {
            // Capture the frame from the webcam.
            const img = webcam.capture();

            // Make a prediction through mobilenet, getting the internal activation of
            // the mobilenet model, i.e., "embeddings" of the input images.
            const embeddings = truncatedMobileNet.predict(img);

            // Make a prediction through our newly-trained model using the embeddings
            // from mobilenet as input.
            const predictions = model.predict(embeddings);

            // Returns the index with the maximum probability. This number corresponds
            // to the class the model thinks is the most probable given the input.
            return predictions.as1D().argMax();
        });

        const classId = (await predictedClass.data())[0];
        predictedClass.dispose();

        ui.predictClass(classId);
        await tf.nextFrame();
    }
    ui.donePredicting();
}

async function init() {
    console.log('Init - start');

    try {
        await webcam.setup();
    } catch (e) {
        document.getElementById('no-webcam').style.display = 'block';
    }

    truncatedMobileNet = await loadTruncatedMobileNet();

    // Warm up the model. This uploads weights to the GPU and compiles the WebGL
    // programs so the first time we collect data from the webcam it will be quick.

    tf.tidy(() => truncatedMobileNet.predict(webcam.capture()));

    ui.init();

    console.log('Init - finished');
}

// Initialize the application.
init().then(() => {

    console.log('Adding listeners to doc');

    document.getElementById('train').addEventListener('click', async () => {
        if (controllerDataset.xs == null) {
            alert('Please add some samples before training!');
        } else {
            ui.trainStatus('Training...');
            await tf.nextFrame();
            await tf.nextFrame();
            isPredicting = false;
            train();
            isTrained = true;
        }
    });

    document.getElementById('play').addEventListener('click', () => {
        if (isTrained === false) {
            alert('You must train the model before you can start playing!');
        } else {
            ui.startBreakout();
            isPredicting = true;
            predict();
        }
    });


});
