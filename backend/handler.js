const tf = require("@tensorflow/tfjs");
const tfnode = require("@tensorflow/tfjs-node");
const sharp = require("sharp");
const multipart = require("lambda-multipart-parser");
const targetSize = { width: 150, height: 150 }; // Target size expected by the model

const health = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Server is healthy ! ",
      },
      null,
      2
    ),
  };
};

async function preprocessImage(imageData, targetSize) {
  // Resize the image
  const resizedImage = await sharp(imageData)
    .resize(targetSize.width, targetSize.height)
    .toBuffer();

  // Normalize pixel values
  const normalizedImage = tfnode.node.decodeImage(resizedImage);
  const normalizedTensor = normalizedImage.toFloat().div(255.0);

  // Expand dimensions to match model input shape (e.g., [1, height, width, channels])
  const expandedTensor = normalizedTensor.expandDims();

  return expandedTensor;
}

const predict = async (event, context) => {
  try {
    // Load the model
    const handler = tfnode.io.fileSystem(
      "./multiclassification_flowers/model.json"
    );
    const model = await tf.loadLayersModel(handler);

    // Get the form data from client
    const formData = await multipart.parse(event);
    const imageFile = formData.files[0].content;

    // image preprocessing
    const preprocessedImage = await preprocessImage(imageFile, targetSize);

    // Generate the prediction
    const predictions = model.predict(preprocessedImage);
    const predictedClass = predictions.argMax(1).dataSync()[0];

    const classes = ['rose', 'daisy', 'dandelion', 'sunflower', 'tulip']

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: predictedClass ? classes[predictedClass] : 'Could not identify',
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: `Error -> ${error}`,
        },
        null,
        2
      ),
    };
  }
};

module.exports = {
  health,
  predict,
};
