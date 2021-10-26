const fs = require('fs')
const path = require('path')
const faker = require('faker')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE);
const adminInfo = require('../json/admin.json');

// Main function.
const setup = async (did, projectId) => {
  const {user, idspace} = await caelum.connect(adminInfo, did);

  // Add one workflow.
  const workflowForm = require('../json/workflow1.json')
  workflowForm.projectId = projectId
  workflowForm.workflowId = 1
  workflowForm.version = 2
  workflowForm.draft = 2
  workflowForm.status = 'deployed'

  // Save the new draft.
  workflow = await idspace.sdk.call('ide', 'deploy', {data: workflowForm})
  workflow = await idspace.sdk.call('ide', 'saveDraft', {data: workflowForm})
  workflow = await idspace.sdk.call('ide', 'deploy', {data: workflowForm})

  // Get Workflow info.
  workflow = await idspace.sdk.call('ide', 'getOneWorkflow', {params: [workflowForm.workflowId]})
  console.log(workflow)
  console.log('Workflow ID ' + workflowForm.workflowId)
  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID, process.env.PROJECT_ID)
}
main()


