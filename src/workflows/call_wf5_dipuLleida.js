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

const responseValidator = (endpoint, status) => {
 if (status !== 200 && status !== 201) {
  throw(`${endpoint} responded ${status}`);
 }
}

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
  // 0. idspace: GET user (this is the person managing devices via LooP)
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

  // 1. TICGal: GET initSession (grab a token)
  const appToken = process.env.INTEGRATION_TICGAL_APP_TOKEN;

  let endpoint = "https://glpi95.tic.gal/apirest.php/initSession";
  const initSessionRes = await axios.get(
    endpoint,
    {
      auth: {
        "username": process.env.INTEGRATION_TICGAL_USERNAME,
        "password": process.env.INTEGRATION_TICGAL_PASSWORD
      },
      headers: { "App-Token": appToken }
    }
  )
  responseValidator(endpoint, initSessionRes.status);

  const { session_token } = initSessionRes.data;
  console.log(session_token);

  // --------------------- >>> QR Scan
  const dispositiu = {
    id: 17, // QR ID
    type: "Computer", // QR URL
  };

  // 2. TICGal: GET deviceById
  const headersConfig = {
    "App-Token": appToken,
    "Session-Token": session_token
  };
  endpoint = `https://glpi95.tic.gal/apirest.php/${dispositiu.type}/${dispositiu.id}?expand_dropdowns=true`
  const deviceByIdRes = await axios.get(endpoint, { headers: headersConfig });
  responseValidator(endpoint, deviceByIdRes.status);

  dispositiu.name = deviceByIdRes.data.name || null;
  dispositiu.serial = deviceByIdRes.data.serial || null;
  console.log(dispositiu);

  // 3. TICGal: GET user (by `email` for now)
  const usuari = {
    email: "daniel@ticgal.com"
  };

  endpoint = `https://glpi95.tic.gal/apirest.php/search/User?uid_cols=true&criteria[0][field]=5&criteria[0][searchtype]=contains&criteria[0][value]=${usuari.email}`; 
  const userByEmailRes = await axios.get(endpoint, { headers: headersConfig });
  responseValidator(endpoint, userByEmailRes.status);

  userTicGal = userByEmailRes.data.data[0]; // Caution
  console.log(userTicGal);
  usuari.givenName = userTicGal["User.name"]|| null;
  usuari.familyName = userTicGal["User.realname"] || null;
  usuari.govId = null; // Does not seem to exist
  usuari.telephone = userTicGal["User.mobile"] || null;
  usuari.additional = { id: userTicGal["User.id"] };
  console.log(usuari);

  // 4. User signs and a PNG file is generated
  // 5. TICGal: GET basicInfo (?) - DO NOT DO THIS FOR NOW
  // --------------------- >>> Submit form

  // 6. TICGal: POST saveSignature
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
  formData.append("filename[0]", stream, { filePath, contentType: "image/png" });
  
  Object.assign(headersConfig, formData.getHeaders());

  endpoint = "https://glpi95.tic.gal/plugins/blockchainid/apirest.php/saveSignature";
  const saveSignatureRes = await axios.post(
    endpoint,
    formData,
    { headers: headersConfig }
  );
  responseValidator(endpoint, saveSignatureRes.status);
  const { hash } = saveSignatureRes.data;
  console.log(hash);

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
