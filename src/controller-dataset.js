import * as tf from '@tensorflow/tfjs';

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
    }
}
