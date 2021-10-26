const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const addUser = async (did) => {
  // Validate that needed data is available
  if (did == null || did === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(adminInfo, did);

  // User example
  const userForm = {
    currentGivenName: "Alexei", // string
    currentFamilyName: "Leonov", // string
    email: "alexei@cosmonauts.com", // string (must be unique)
    telephone: "+7 777 77 77", // string | null
    govId: "45 12 666777" // string
  }

  // Add user via SDK
  const response = await idspace.sdk.call("user", "add", { data: userForm });
  if (response === false) return; // SDK intercepted bad response
  console.log(response);

  return;
}

const main = async () => {
  try {
    await addUser(process.env.DID);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
