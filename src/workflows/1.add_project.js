const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const addProject = async (did) => {
  // Validate given params
  if (did == null || did === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(adminInfo, did);

  // Project Example
  const projectForm = {
    name: "Gestió de dispositius",
    description: "Processos de la Diputació",
  };

  // Add project via SDK
  const response = await idspace.sdk.call("ide", "addProject", { data: projectForm });
  if (response === false) return;  // SDK intercepted bad response
  console.log(response);

  return;
};

const main = async () => {
  try {
    await addProject(process.env.DID);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
