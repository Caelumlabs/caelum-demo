const fs = require("fs");
const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const addCapability = async (did, userId) => {
  // Validate that needed data is available
  if (did == null || did === "" || userId == null || userId === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(adminInfo, did);

  // Capability example
  const userCapability = {
    userId: userId, // number
    subject: "member-technology" // string
  }

  // Add capability via SDK
  const response = await idspace.sdk.call("user", "issue", { data: userCapability });
  if (response === false) return; // SDK intercepted bad response
  console.log(response);

  /*
     The following lines are not needed, but
     demonstrate the process of claiming the new capability via notifications,
     which is what the app does
  */

  // Open a session as peerDid to be able to fetch notifications
  await user.login(idspace, "peerDid");

  // Get all open notifications
  const notifications = await idspace.sdk.call("auth", "notifications");
  if (notifications === false) return; // SDK intercepted bad response

  // Claim (sign) the new capability
  const lastNotificationIdx = notifications.length - 1;
  const signedCapability = await user.claim(idspace, notifications[lastNotificationIdx].notificationId);
  console.log(signedCapability);

  // Update JSON
  const userJson = await user.export();
  fs.writeFileSync(path.join(rootPath, "data", "admin.json"), userJson, "utf8");

  return;
}

const main = async () => {
  try {
    await addCapability(process.env.DID, process.env.USER_ID);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

main();
