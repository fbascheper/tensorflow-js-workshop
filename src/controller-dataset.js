/**
 * A dataset for webcam controls which allows the user to add sample Tensors
 * for particular labels. This object will concat them into two large xs and ys.
 */
export class ControllerDataset {
    constructor(numClasses) {
        this.numClasses = numClasses;
    }

    /**
     * Adds a sample to the controller dataset.
     * @param {Tensor} sample A tensor representing the sample. It can be an image,
     *     an activation, or any other type of Tensor.
     * @param {number} label The label of the sample. Should be a number.
     */
    addSample(sample, label) {
        alert('TODO - implement!!');
    }
}
