const axios = require('axios')
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

  /* ========
     App LooP
     ========
  */ 
  // User info from idspace (this is the person managing devices via LooP)
  const tecnic = {
    givenName: faker.name.firstName(),
    familyName: faker.name.lastName(),
    govId: null,
    telephone: "+34 655 66 33 21",
    additional: {
      "id": 2 // TICGal User.id
    },
    get email() {
      return `${this.givenName.toLowerCase()}@email.com`;
    }
  };

  // Request TICGal session token
  const appToken = process.env.INTEGRATION_TICGAL_APP_TOKEN;
  const sessionRes = await axios.get(
    "https://glpi95.tic.gal/apirest.php/initSession", {
      auth: {
        "username": process.env.INTEGRATION_TICGAL_USERNAME,
        "password": process.env.INTEGRATION_TICGAL_PASSWORD
      },
      headers: {
        "App-Token": appToken,
      }
    }
  )
  if (sessionRes.status !== 200) return "Bad response";
  console.log(sessionRes.data);
  const { session_token } = sessionRes.data;

  // QR Scan returns device, e.g.
  const dispositiu = {
    id: 17, // TICGal id
    type: "Computer", // Not returned
    name: "Caelum PC02", // name
    serial: "", // serial
  };

  // Search user by email, e.g.
  const usuari = {
    givenName: "Daniel", // TICGal User.name
    familyName: "Couso", // User.realname
    govId: null, // ? Don't think it exists
    telephone: "+34 677 88 55 44", // User.mobile
    email: "daniel@ticgal.com", // User.UserEmail.email
    additional: {
      "id": 64 // User.id
    },
  };

  // POST request to TICGals /saveSignature
  const headersConfig = {
    "App-Token": appToken,
    "Session-Token": session_token
  };

  const formData = new FormData();

  const input = {
    _filename: ["signature.png"], // The name of the signature file in the Flutter app
    tech_id: tecnic.additional.id,
    user_id: usuari.additional.id,
    type: 1, // To Do - 1 entrega, 2 devolució
    items: [`${dispositiu.type}|${dispositiu.id}`]
  };
  formData.append("uploadManifest", JSON.stringify({input}));

  const stream = fs.createReadStream(filePath);
  formData.append("file", stream, { filePath, contentType: "image/png" });
  
  Object.assign(headersConfig, formData.getHeaders());

  const signatureRes = await axios.post(
    "https://glpi95.tic.gal/plugins/blockchainid/apirest.php/saveSignature",
    formData,
    { headers: headersConfig }
  );
  if (signatureRes.status !== 200) return "Bad response";
  console.log(signatureRes.data);
  const { hash } = signatureRes.data;

  // Start workflow via SDK
  const workflowForm = {
    workflowId,
    apiToken,
    "stateId": 0,
    "actionId": 1,
    "partyId": 1,

    "tecnic_currentGivenName": tecnic.givenName,
    "tecnic_currentFamilyName": tecnic.familyName,
    "tecnic_govId": tecnic.govId,
    "tecnic_email": tecnic.email,
    "tecnic_telephone": tecnic.telephone,
    "tecnic_additional": tecnic.additional,

    "usuari_currentGivenName": usuari.givenName,
    "usuari_currentFamilyName": usuari.familyName,
    "usuari_govId": usuari.govId,
    "usuari_email": usuari.email,
    "usuari_telephone": usuari.telephone,
    "usuari_additional": usuari.additional,

    "dispositiu_deviceId": dispositiu.id,
    "dispositiu_deviceType": dispositiu.type,
    "dispositiu_deviceName": dispositiu.name,
    "dispositiu_deviceSerial": dispositiu.serial,

    "PDF_hash": hash
  };

  const response = await idspace.sdk.call("workflow", "set", { data: workflowForm });
  if (response === false) return; // SDK intercepted bad response
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
