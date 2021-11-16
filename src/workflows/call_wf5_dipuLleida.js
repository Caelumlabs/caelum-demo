const faker = require("faker");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });
const filePath = path.join(rootPath, "data", "test.png");

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

  // Load User and Idspace (user is Dipu technician)
  const { user, idspace } = await caelum.connect(false, did);

  // Data (e.g. App Loop)
  const sessionToken = "kr2dnccsps4i7vo8ogogaprou3" // GET https://glpi95.tic.gal/apirest.php/initSession

  const dispositiu = {
    id: 17, // TICGal id
    type: "Computer", // Not returned
    name: "Caelum PC02", // name
    serial: "", // serial
  };

  const usuari = {
    givenName: faker.name.firstName(), // TICGal User.name
    familyName: faker.name.lastName(), // User.realname
    govId: null, // Does not exist
    telephone: "+34 677 88 55 44", // User.mobile
    additional: {
      "id": 64 // User.id
    },
    get email() {
      return `${this.givenName.toLowerCase()}@email.com`;
    }
  };

  const input = {
    _filename: ["signature.png"],
    tech_id: 2, // To Do - will come from idspace user.additional...
    user_id: usuari.additional.id,
    type: 1, // To Do - 1 entrega, 2 devolució
    items: [`${dispositiu.type}|${dispositiu.id}`]
  };

  // Workflow example
  const workflowForm = {
    workflowId,
    apiToken,
    "stateId": 0,
    "actionId": 1,
    "partyId": 1,

    "dispositiu_deviceId": dispositiu.id,
    "dispositiu_deviceType": dispositiu.type,
    "dispositiu_deviceName": dispositiu.name,
    "dispositiu_deviceSerial": dispositiu.serial,

    "usuari_currentGivenName": usuari.givenName,
    "usuari_currentFamilyName": usuari.familyName,
    "usuari_govId": usuari.govId,
    "usuari_email": usuari.email,
    "usuari_telephone": usuari.telephone,
    "usuari_additional": usuari.additional,

    "request_h_appToken": false, // nulls are skipped
    "request_h_sessionToken": sessionToken,
    "request_f_uploadManifest": JSON.stringify(input),
    "request_f_filename[0]": false,
  };

  // Start workflow via SDK
  const response1 = await idspace.sdk.call("workflow", "set", { data: workflowForm });
  if (response1 === false) return;  // SDK intercepted bad response
  console.log(response1);

  // Upload image
  const { stateId } = response1;
  const formData = new FormData();
  const stream = fs.createReadStream(filePath);
  formData.append("file", stream, { filePath, contentType: "image/png" });
  formData.append(
    "workflow",
    JSON.stringify({
      stateId,
      actionId: 2,
      partyId: 1,
      apiToken,
    }),
  );

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
