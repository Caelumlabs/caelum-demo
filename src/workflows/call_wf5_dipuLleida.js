const faker = require("faker");
const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);

const callWorkflow = async (did, workflowId, apiToken) => {
  // Validate that needed data is available
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
    usuari_additional: {
      id: 64, // User.id
    },
    dispositiu_deviceId: 17,
    dispositiu_deviceType: "Computer",
    dispositiu_deviceName: "Caelum PC02",
    dispositiu_deviceSerial: "",
    request_id: 0,
  };

  // Start workflow via SDK
  const response = await idspace.sdk.call("workflow", "set", { data: workflowForm });
  if (response === false) return;  // SDK intercepted bad response
  console.log(response);

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
