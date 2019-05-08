# Instructions

### Assignment 1. Use the web cam to display a preview in the box under the ``PLAY`` button.
1. Change the style of the ``<div>`` with id = ``controller`` to ``"display:none"``.
   This will hide the controller at the bottom of the screen until the application 
   has been setup correctly. 

2. Implement the ``setup()`` function in the file ``webcam.js``.
      ````
      return new Promise((resolve, reject) => {
          const navigatorAny = navigator;
          navigator.getUserMedia = navigator.getUserMedia ||
              navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
              navigatorAny.msGetUserMedia;
          if (navigator.getUserMedia) {
              navigator.getUserMedia(
                  {video: true},
                  stream => {
                      this.webcamElement.srcObject = stream;
                      this.webcamElement.addEventListener('loadeddata', async () => {
                          this.adjustVideoSize(
                              this.webcamElement.videoWidth,
                              this.webcamElement.videoHeight);
                          resolve();
                      }, false);
                  },
                  error => {
                      reject();
                  });
          } else {
              reject();
          }
      });
      ````
   Later on, this will be used to setup an HTML ``<video />`` element. Unfortunately there are some issues with this code on Safari 12, 
   so we recommend using Chrome or FireFox on MacOS.
      
 
3. Setup the  web cam during initialization.
   1. Add import of ``Webcam`` to the file ``index.js``, e.g.
      ````
      import {Webcam} from './webcam';
      ````
      
   2. Create a new instance of Webcam as the value of ``const webcam``.
      
      Use this [hint](./hints.md#Definition-of-const-webcam) if you need it. 
   
   3. Call ``await webcam.setup()`` in the ``async function init()``
      and make sure that the HTML-element with id ``no-webcam`` is displayed (``style = block``)
      when an exception occurs in its ``setup()`` method.
      
      Note: You should use the ``try {} catch(e) {}`` construct to achieve this.  

4. Call ``ui.init()`` at the end of the ``async function init()``. 

5. Reload the application and verify that the web cam preview display renders as expected.

***

### Assignment 2. Add samples from the web cam for training TensorFlow.js 

1. Use NPM to add the TensorFlow.js dependency.
   1.  ````npm add "@tensorflow/tfjs" --save-prod````

2. Implement ``async function loadTruncatedMobileNet()``.
   1. Import ``*`` from module ``@tensorflow/tfjs`` as ``tf`` in the file ``index.js``. 
   
   2. Now implement function ``loadTruncatedMobileNet()`` to load a pre-trained
      [*MobileNet model*](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet)
      for TensorFlow.js.  
      ````
      const mobilenet = await tf.loadLayersModel(
          'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
  
      // Return a model that outputs an internal activation.
      const layer = mobilenet.getLayer('conv_pw_13_relu');
      return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
      ````
      
      This is the base model where we will apply Transfer learning. 

3. Load and warm up the TensorFlow.js model before calling ``ui.init()``  in the ``async function init()``.
      ````
          truncatedMobileNet = await loadTruncatedMobileNet();

          // Warm up the model. This uploads weights to the GPU and compiles the WebGL
          // programs so the first time we collect data from the webcam it will be quick.

          tf.tidy(() => truncatedMobileNet.predict(webcam.capture()));
      ````

4. Implement the ``capture()`` method in the file ``webcam.js``.
   1. First we need to import ``*`` from module ``@tensorflow/tfjs`` as ``tf``.
   
   2. Implement the ``capture()`` method 
   ````
        return tf.tidy(() => {
            // Reads the image as a Tensor from the webcam <video> element.
            const webcamImage = undefined; // TODO: implement me (using tf.browser)!

            // Crop the image so we're using the center square of the rectangular
            // webcam.
            const croppedImage = this.cropImage(webcamImage);

            // Expand the outer most dimension so we have a batch size of 1.
            const batchedImage = croppedImage.expandDims(0);

            // Normalize the image between -1 and 1. The image comes in between 0-255,
            // so we divide by 127 and subtract 1.
            return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
        });
   ````
   
      Don't forget to implement the ``// TODO`` from the snippet above 
      using [browser.fromPixels()](https://js.tensorflow.org/api/latest/#browser.fromPixels). 
      Use this [hint](./hints.md#Implementing-the-WebCam-capture-method) if you need it. 
      
      Note: the ``fromPixels()`` method constructs Tensors from the input images 
      captured by your WebCam.

5. Implement ``async function handler(label)`` in the file ``ui.js``.
   ````  
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
   ````
   
6. Implement ``ui.setSampleHandler()`` in the file ``index.js``.
   ````  
    tf.tidy(() => {
        const img = undefined; // TODO: implement me (using webcam.js)!

        // Draw the preview thumbnail.
        // TODO: implement me (using ui.js)!
    });
   ````  

   Don't forget to implement both ``// TODO`` from the snippet above. 
   You can use this [hint](./hints.md#Implementing-setSampleHandler) if you need it. 

   In conjunction with the ``handler()`` function from the previous step, this
   will ensure that a frame is read from the WebCam when a UI button is pressed
   and associated with the class label given by the button. 
   
   Note: left, right are labels 0, 1 respectively. 
   

7. Reload the application, add samples from the web cam and verify that the number of samples increases as expected.

***
   
### Assignment 3. Training the TensorFlow.js model using web cam images

1. Implement ``addSample()``  in the file ``controller-dataset.js``.
   ````  
   // One-hot encode the label.
   const y = tf.tidy(
       () => tf.oneHot(tf.tensor1d([label]).toInt(), this.numClasses));

   if (this.xs == null) {
       // For the first sample that gets added, keep sample and y so that the
       // ControllerDataset owns the memory of the inputs. This makes sure that
       // if addSample() is called in a tf.tidy(), these Tensors will not get
       // disposed.
       this.xs = tf.keep(sample);
       this.ys = tf.keep(y);
   } else {
       const oldX = this.xs;
       this.xs = tf.keep(oldX.concat(sample, 0));

       const oldY = this.ys;
       this.ys = tf.keep(oldY.concat(y, 0));

       oldX.dispose();
       oldY.dispose();
       y.dispose();
   }
   ````  

2. Create a new instance of ControllerDataset as the value of ``const controllerDataset``.

3. Use the ``addSample()`` method of the ``controllerDataset`` to add captured images from the web cam
   to the controller dataset, using the prediction ``truncatedMobileNet.predict(image)``.
   
4. Implement ``async function train()``  in the file ``index.js``.
   ````  
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
   ````  

5. Add the ``train()`` method to the ``onclick()`` event of the HTML-element with id=``"train"``.
   ````  
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
   ````  

6. Infer the correct value for ``const NUM_CLASSES`` at the head of the file ``index.js``.

7. Reload the application.
   1. Press the ``TRAIN MODEL`` button without loading any samples. 
      Ensure that the alert dialog is displayed as expected.
   
   2. Now add samples and press the ``TRAIN MODEL`` button again. 
      TensorFlow.js should now be using your samples for training.     

***

### Assignment 4. Implement the predict method to implement the paddle movement.

1. Implement ``async function predict()``  in the file ``index.js``.
   ````  
    ui.isPredicting();
    while (isPredicting) {
        const predictedClass = tf.tidy(() => {
            // Capture the frame from the webcam.
            const img = undefined; // TODO : implement me (using webcam.js)!

            // Make a prediction through mobilenet, getting the internal activation of
            // the mobilenet model, i.e., "embeddings" of the input images.
            const embeddings = undefined; // TODO : implement me (using the predict method of truncatedMobileNet)!

            // Make a prediction through our newly-trained model using the embeddings
            // from mobilenet as input.
            const predictions = undefined; // TODO : implement me (using the predict method of the model)!

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
   ````  

2. Add the ``predict()`` method to the ``onclick()`` event of the HTML-element with id=``"play"``.
   ````  
   if (isTrained === false) {
       alert('You must train the model before you can start playing!');
   } else {
       ui.startBreakout();
       isPredicting = true;
       predict();
   }
   ````  

3. Reload the application.
   1. Press the ``PLAY`` button and verify that the model must be trained before you can start playing.

   2. Add some samples from the web cam for left and right movement and press the ``TRAIN MODEL`` button.
   
   3. Now press the ``PLAY`` button again. The game should start and you should be able to use TensorFlow.js 
      to move the paddle with live images captured from your web cam.
      
   4. Try to win the game !      

***

### Optional assignments

1. Implement the code for the ``clear`` buttons.

2. Add an extra sample container to train the model when your head is in a neutral position. 
   In the neutral position, the paddle should stop moving and stay at the same position. 

3. Play the game again! Now it should be much easier to win the game.
  
