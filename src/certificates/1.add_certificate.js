const path = require('path')

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const addCertificate = async (did) => {
  // Validate that needed data is available
  if (did == null || did === "") {
    console.error("Missing variables or their values in .env");
    process.exit();
  }

  // Load User and Idspace
  const {user, idspace} = await caelum.connect(adminInfo, did);

  // Certificate example
  const tagForm = {
    title: 'Spacewalk certificate', // string
    description: 'The astronaut got out of the shuttle while in space', // string | null
    url: 'https://www.nasa.gov', // string | null
    logo: null, // string | null
    requirements: null, // string | null
    issuedTo: 'Persona'  // string['Nominal', 'Organisation', 'Persona'] - 'Organisation' is default
  }

  // Create the certificate via SDK
  const { certificateDid, certificateId } = await idspace.sdk.call('tag', 'add', { data: tagForm });
  console.log("certificateId:", certificateId);
  console.log("certificateDid:", certificateDid);

  process.exit();
}

const main = async () => {
  try {
    await addCertificate(process.env.DID);
  } catch (error) {
    console.log("Something went wrong!", error);
    process.exit();
  }
}

main();
