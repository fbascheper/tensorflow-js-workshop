# Hints for the assignments.

#### Definition of const webcam
The constructor of the ``Webcam`` class requires an HTML ``<video />`` element.
You can find the required element in ``index.html`` with element ``id="webcam"``

---

#### Implementing the WebCam capture method
Don't forget to pass the instace variable webcamElement of the ``WebCam`` class
into the ``tf.fromPixels()`` method, like so:

  ````javascript
  const webcamImage = tf.browser.fromPixels(this.webcamElement);
  ````  

---

#### Implementing setSampleHandler
* For ``const img`` you must call the ``capture()`` method in your instance of the ``WebCam`` class.
* To draw the thumbnail you must call the ``drawThumb()`` method from ``ui`` and pass the image and label as parameters.

---

#### Updating setSampleHandler
The addSample() method needs two parameters, a ``Tensor`` and a ``label``.
The Tensor is returned by the predict method, e.g. ``truncatedMobileNet.predict(img)``
