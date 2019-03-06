/**
 * A class that wraps webcam video elements to capture Tensor4Ds.
 */
export class Webcam {
    /**
     * @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the webcam feed.
     */
    constructor(webcamElement) {
        this.webcamElement = webcamElement;
    }

    /**
     * Captures a frame from the webcam and normalizes it between -1 and 1.
     * Returns a batched image (1-element batch) of shape [1, w, h, c].
     */
    capture() {
        alert('TODO - implement!!');
    }

    /**
     * Crops an image tensor so we get a square image with no white space.
     * @param {Tensor4D} img An input image Tensor to crop.
     */
    cropImage(img) {
        const size = Math.min(img.shape[0], img.shape[1]);
        const centerHeight = img.shape[0] / 2;
        const beginHeight = centerHeight - (size / 2);
        const centerWidth = img.shape[1] / 2;
        const beginWidth = centerWidth - (size / 2);
        return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
    }

    /**
     * Adjusts the video size so we can make a centered square crop without
     * including whitespace.
     * @param {number} width The real width of the video element.
     * @param {number} height The real height of the video element.
     */
    adjustVideoSize(width, height) {
        const aspectRatio = width / height;
        if (width >= height) {
            this.webcamElement.width = aspectRatio * this.webcamElement.height;
        } else if (width < height) {
            this.webcamElement.height = this.webcamElement.width / aspectRatio;
        }
    }

    async setup() {
        alert('TODO - implement!!');
    }
}
