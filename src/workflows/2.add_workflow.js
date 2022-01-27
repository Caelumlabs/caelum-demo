const fs = require("fs");
const path = require("path");

const rootPath = path.join(__dirname, "../../");
require("dotenv").config({ path: path.join(rootPath, ".env") });

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const Caelum = require("caelum-sdk");
const caelum = new Caelum(process.env.SUBSTRATE, process.env.NETWORK);
const adminInfo = require(path.join(rootPath, "data", "admin.json"));

const addWorkflow = async (did, projectId, workflowNo) => {
  // Validate given params
  if (did == null || did === "" ||
    projectId == null || projectId === "") {
    console.error("Missing variables or their values in .env");
    return;
  }

  // Read workflow JSON
  const fileData = fs.readFileSync(path.join(rootPath, "src/json", `workflow${workflowNo}.json`));
  const workflowForm = JSON.parse(fileData);

  // Load User and Idspace
  const { user, idspace } = await caelum.connect(adminInfo, did);

  // Add workflow via SDK
  workflowForm.projectId = projectId;
  let res = await idspace.sdk.call("ide", "addWorkflow", { data: workflowForm });
  console.log("Res ide addWorkflow", res);

  workflowForm.workflowId = res.workflowId;

  // Save workflow as draft
  res = await idspace.sdk.call("ide", "saveDraft", { data: workflowForm });
  console.log("Res ide saveDraft", res);

  // Deploy workflow
  res = await idspace.sdk.call("ide", "deploy", { data: workflowForm });
  console.log("Res ide deploy", res);

  // Get workflow data (apiToken)
  res = await idspace.sdk.call("ide", "getOneWorkflow", { params: [workflowForm.workflowId] });
  console.log("Res ide getOneWorkflow", res);

  return;
};

const main = async (workflowNo) => {
  try {
    await addWorkflow(process.env.DID,
      process.env.PROJECT_ID,
      workflowNo);
  } catch (error) {
    console.log("Something went wrong!", error);
  }
  process.exit();
}

readline.question("Introduce workflow number (from JSON folder): ", (workflowNo) => {
  main(workflowNo);
});
