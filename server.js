const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { User } = require("./models");
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use("/glbModels", express.static("public/glbModels"));
const session = require("express-session");

app.use(
  session({
    secret: "your-secret-key", // Change this to a random secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set 'true' if using HTTPS
  })
);

// Array of model objects with their paths, answers, and plate numbers
const allModels = [
  { plateNo: "PL1", path: "./glbModels/pl1.glb", answer: "12" },
  // { plateNo: "PL2", path: "./glbModels/pl2.glb", answer: "8" },
  // { plateNo: "PL3", path: "./glbModels/pl3.glb", answer: "6" },
  { plateNo: "PL4", path: "./glbModels/pl4.glb", answer: "29" },
  { plateNo: "PL5", path: "./glbModels/pl5.glb", answer: "57" },
  // { plateNo: "PL6", path: "./glbModels/pl6.glb", answer: "5" },
  // { plateNo: "PL7", path: "./glbModels/pl7.glb", answer: "3" },
  { plateNo: "PL8", path: "./glbModels/pl8.glb", answer: "15" },
  { plateNo: "PL9", path: "./glbModels/pl9.glb", answer: "74" },
  // { plateNo: "PL10", path: "./glbModels/pl10.glb", answer: "2" },
  { plateNo: "PL11", path: "./glbModels/pl11.glb", answer: "12" },
  { plateNo: "PL12", path: "./glbModels/pl12.glb", answer: "97" },
  { plateNo: "PL13", path: "./glbModels/pl13.glb", answer: "45" },
  // Add more models as needed
];

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/log-transcript", async (req, res) => {
  const transcript = req.body.transcript;
  console.log(`transcript ${transcript}`);

});
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const user = await User.create({
    name: username,
  });

  // Store the username in the session
  req.session.username = username;

  // Redirect to /test
  res.render("loggedIn");
});

// Route to show the model test
app.get("/ishihara", (req, res) => {
  const shuffled = allModels.sort(() => 0.5 - Math.random());
  const selectedModels = shuffled.slice(0,5); // Select 5 random models
  res.render("index", { models: selectedModels });
});

app.get("vrGame", (req, res) => {
  res.render("vrGame");
});
// Route to handle responses
app.post("/submit", async (req, res) => {
  const finalResponses = req.body.responses; // Get the responses from the request
  const redGreenDeficiency = evaluateResponses(finalResponses);
  const { blindnessType, intensity } =
    determineColorBlindnessType(redGreenDeficiency);
  const username = req.session.username || req.body.username;
  const user = await User.findOne({ where: { name: username } });

  if (user) {
    // Append new responses to the existing inputs array as a stringified JSON object
    const updatedInputs = user.inputs
      ? [...user.inputs, JSON.stringify({ blindnessType, intensity, finalResponses })]
      : [JSON.stringify({ blindnessType, intensity, finalResponses })];
  
    // Update the user record in the database
    await user.update({
      inputs: updatedInputs,
    });
  }
    res.json({ blindnessType, intensity, finalResponses });
});

// Function to evaluate responses
function evaluateResponses(userResponses) {
  let correctCount = 0;
  let redGreenDeficiency = 0;
  // Compare each response to the correct answer based on plate number
  userResponses.forEach((response, index) => {
    const { plateNo } = response; // Extract plate number from response
    const model = allModels.find((model) => model.plateNo === plateNo); // Find the model by plate number
    if (model && response.answer === model.answer) {
      correctCount++;
    } else {
      redGreenDeficiency++;
    }
  });
  console.log(correctCount);
  console.log(redGreenDeficiency);
  return correctCount < redGreenDeficiency; // Return the count of correct responses
}

// Function to determine color blindness type
function determineColorBlindnessType(redGreenDeficiency) {
  let blindnessType = "";
  let intensity = "";

  // Example logic for determining blindness type based on correct responses
  //   if (correctCount === 5) {
  //     blindnessType = "Normal Vision";
  //     intensity = "None";
  //   } else if (correctCount >= 3) {
  //     blindnessType = "Mild Color Blindness";
  //     intensity = "Low";
  //   } else if (correctCount === 1 || correctCount === 2) {
  //     blindnessType = "Moderate Color Blindness";
  //     intensity = "Medium";
  //   } else {
  //     blindnessType = "Severe Color Blindness";
  //     intensity = "High";
  //   }

  if (redGreenDeficiency) {
    blindnessType = "Red-Green Deficiency";
    intensity = "High";
  } else {
    blindnessType = "Normal Vision";
    intensity = "None";
  }

  return { blindnessType, intensity };
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
