import * as tf from "@tensorflow/tfjs";

export interface NeuroSignal {
  focus: number;
  anxiety: number;
}

const focusKernel = tf.tensor2d([[1.3], [0.4]]);
const anxietyKernel = tf.tensor2d([[-1.1], [0.7]]);
const bias = tf.tensor1d([0.2, 0.4]);

function normalize(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function pulseFocusModel(intensity: number): NeuroSignal {
  return tf.tidy(() => {
    const clamped = Math.min(Math.max(intensity, 0), 1);
    const input = tf.tensor2d([[clamped, 1 - clamped]]);
    const focusTensor = input.matMul(focusKernel).add(bias.slice([0], [1])).sigmoid();
    const anxietyTensor = input.matMul(anxietyKernel).add(bias.slice([1], [1])).sigmoid();
    const [focus] = focusTensor.dataSync();
    const [anxiety] = anxietyTensor.dataSync();
    return {
      focus: normalize(focus),
      anxiety: normalize(anxiety)
    };
  });
}
