const path = require("path")

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const addCertificate = async (did) => {
  // Validate given params
  if (did == null || did === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(adminInfo, did);

  // Certificate example
  const certificateForm = {
    title: "Certificat de la Diputació de préstec de dispositiu", // string
    description: "Préstec de dispositius des de LOOP", // string | null
    url: "https://www.diputaciolleida.cat/", // string | null
    logo: null, // string | null
    requirements: null, // string | null
    issuedTo: "Persona" // string["Nominal", "Organisation", "Persona"] - "Organisation" is default
  }

  // Add certificate (also called "tag") via SDK
  const response = await idspace.sdk.call("tag", "add", { data: certificateForm });
  if (response === false) return;  // SDK intercepted bad response
  console.log(response);

  return;
}

const main = async () => {
  try {
    await addCertificate(process.env.DID);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
