const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const getUsers = async (did, userId) => {
  // Validate given params
  if (did == null || did === "" || userId == null || userId === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(adminInfo, did);

  // Get all users via SDK
  // Grab the userId from the response to update process.env.USER_ID
  const allUsers = await idspace.sdk.call("user", "getAll");
  if (allUsers === false) return; // SDK intercepted bad response
  console.log("Total users:", allUsers.length);

  // Get one user
  const oneUser = await idspace.sdk.call("user", "getOne", { params: userId });
  if (oneUser === false) return; // SDK intercepted bad response
  console.log("User:", oneUser);

  return;
}

const main = async () => {
  try {
    await getUsers(process.env.DID, process.env.USER_ID);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
