const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const addApi = async (did) => {
  // Validate given params
  if (did == null || did === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const {user, idspace} = await caelum.connect(adminInfo, did);

  // Tramit
  let auth = {
    url: "https://api.pre.apptramit.com/authorize/login",
    username: process.env.INTEGRATION_TRAMIT_USERNAME,
    password: process.env.INTEGRATION_TRAMIT_PASSWORD,
  };
  let endpoints = [
    {
      method: "POST",
      url: "https://api.pre.apptramit.com/process-request/feedback",
      name: "feedback",
    },
  ];
  let apiForm = {
    name: "Tràmit",
    description: "Tràmit - integració",
    integrationTypeId: 2,
    authenticationId: 3,
    authConfiguration: JSON.stringify(auth),
    endpoints: JSON.stringify(endpoints),
  };

  // Add API (also called "") via SDK
  let response = await idspace.sdk.call("api", "add", { data: apiForm });
  if (response === false) return;  // SDK intercepted bad response
  console.log("Tramit", response);

  // TICGal
  auth = {
    "App-Token": process.env.INTEGRATION_TICGAL_APP_TOKEN,
    "Session-Token": null,
  };
  endpoints = [
    {
      method: "GET",
      url: "https://glpi95.tic.gal/apirest.php/Computer/17?expand_dropdowns=true",
      name: "getDeviceById",
    },
    {
      method: "POST",
      url: "https://glpi95.tic.gal/plugins/blockchainid/apirest.php/saveSignature",
      name: "postSignature",
    },
  ];
  apiForm = {
    name: "TICGal",
    description: "TICGal - integració",
    integrationTypeId: 2,
    authenticationId: 4,
    authConfiguration: JSON.stringify(auth),
    endpoints: JSON.stringify(endpoints),
  };

  // Add API (also called "") via SDK
  response = await idspace.sdk.call("api", "add", { data: apiForm });
  if (response === false) return;  // SDK intercepted bad response
  console.log("TICGal", response);

  // Add Sendgrid
  // auth = {
  //   value: process.env.INTEGRATION_SENGRID_API_KEY,
  //   from: process.env.INTEGRATION_SENGRID_FROM,
  // };
  // endpoints = [
  //   {
  //     templateId: "d-0bc1e997b4234b75aa2542bb9bfa68ca",
  //     name: "deixalleria - certificat",
  //   },
  // ];
  // apiForm = {
  //   name: "Sendgrid",
  //   description: "Certificat ús deixalleria",
  //   integrationTypeId: 1,
  //   authenticationId: 1,
  //   authConfiguration: JSON.stringify(auth),
  //   endpoints: JSON.stringify(endpoints),
  // };
  // res = await idspace.sdk.call("api", "add", { data: apiForm });
  // console.log("Res api add - Sengrid", res);

  return;
}

const main = async () => {
  try {
    await addApi(process.env.DID);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
