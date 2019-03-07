# Hints for the assignments.

#### Definition of const webcam
The constructor of the ``Webcam`` class requires an HTML ``<video />`` element. 
You can find the required element in ``index.html`` with element ``id="webcam"``

---

#### Implementing setSampleHandler
* For ``const img`` you must call the ``capture()`` method in your instance of the ``WebCam`` class.
* To draw the thumbnail you must call the ``drawThumb()`` method from ``ui`` with the image and label as parameters.

