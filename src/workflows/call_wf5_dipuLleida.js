const faker = require("faker");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });
const filePath = path.join(rootPath, "data", "test.jpg");

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);

const callWorkflow = async (did, workflowId, apiToken) => {
  // Validate given params
  if (did == null || did === "" ||
    workflowId == null || workflowId === "" ||
    apiToken == null || apiToken === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(false, did);

  // Workflow example
  const workflowForm = {
    stateId: 0,
    workflowId,
    actionId: 1,
    partyId: 1,
    apiToken,
    usuari_currentGivenName: faker.name.firstName(), // TICGal User.name
    usuari_currentFamilyName: faker.name.lastName(), // User.realname
    usuari_govId: null, // May not exist
    usuari_email: faker.internet.email(), // User.UserEmail
    usuari_telephone: "+34 677 88 55 44", // User.mobile
    usuari_additional: {
      id: 64, // User.id
    },
    dispositiu_deviceId: 17, // TICGal id
    dispositiu_deviceType: "Computer", // Not returned
    dispositiu_deviceName: "Caelum PC02", // name
    dispositiu_deviceSerial: "", // serial
    request_id: 0,
  };

  // Start workflow via SDK
  const response1 = await idspace.sdk.call("workflow", "set", { data: workflowForm });
  if (response1 === false) return;  // SDK intercepted bad response
  console.log(response1);

  // Upload image
  const { stateId } = response1;
  const imageData = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append("file", imageData, { filePath, contentType: "image/jpg" });
  formData.append(
    "workflow",
    JSON.stringify({
      stateId,
      actionId: 2,
      partyId: 1,
      apiToken,
    }),
  );
  console.log(formData.file);
  const response2 = await idspace.sdk.call("workflow", "upload", { form: formData });
  if (response2 === false) return;
  console.log(response2);

  return;
};

const main = async () => {
  try {
    await callWorkflow(process.env.DID,
      process.env.WORKFLOW5_ID,
      process.env.WORKFLOW5_API_TOKEN);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
