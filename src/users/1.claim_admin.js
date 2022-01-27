const fs = require("fs");
const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);

const claimAdmin = async (did, secretCode) => {
  // Validate given params
  if (did == null || did === "" ||
    secretCode == null || secretCode === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  await caelum.connect();

  // Creates a new User object with new connection keys
  const user = await caelum.newUser();

  // Opens a new session with the Idspace
  const idspace = await caelum.getOrganizationFromDid(did);
  const session = await idspace.getSession("admin");
  console.log("QR Code:" + session.connectionString);

  // Complete the registration process (with the secretCode received via email)
  const peerDid = await user.registerConnectionString(session.connectionString, secretCode);
  console.log("Registered peerDid (public key):", peerDid);

  // Export user to JSON (on the phone, the app will encrypt the file)
  const userJson = await user.export();
  fs.writeFileSync(path.join(rootPath, "data", "admin.json"), userJson, "utf8");

  return;
}

const main = async () => {
  try {
    await claimAdmin(process.env.DID, process.env.SECRET);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
