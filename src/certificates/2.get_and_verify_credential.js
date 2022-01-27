const path = require("path")

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const verifyCredential = async (did, certificateId) => {
  // Validate given params
  if (did == null || did === "" ||
    certificateId == null || certificateId === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(adminInfo, did);

  // Credential example
  const response = await idspace.sdk.call("tag", "getIssued", { params: certificateId });
  if (response === false) return "Hey ho"; // SDK intercepted bad response
  console.log(response);

  const signedCredential = JSON.parse(response[0].subject);
  console.log(signedCredential);

  const verify = await idspace.verifyCredential(signedCredential);
  console.log(verify);
}

const main = async () => {
    try {
      await verifyCredential(process.env.DID,
        process.env.CERTIFICATE_ID);
    } catch (error) {
      console.log("Something went wrong!", error);
    }
    process.exit();
  }
  
  main();
  