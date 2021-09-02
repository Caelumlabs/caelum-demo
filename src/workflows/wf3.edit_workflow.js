const fs = require('fs')
const path = require('path')
const faker = require('faker')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum')
const caelum = new Caelum(process.env.STORAGE, process.env.GOVERNANCE)
const adminInfo = require('../json/admin.json')

// Main function.
const setup = async (did, projectId) => {
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Admin login and set session
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

  // Add one workflow.
  const workflowForm = require('../json/workflow3.json')
  workflowForm.projectId = projectId
  workflowForm.workflowId = 3
  workflowForm.version = 2
  workflowForm.draft =  2

  // Save the new draft.
  workflow = await idspace.sdk.call('ide', 'deploy', {data: workflowForm})
  workflow = await idspace.sdk.call('ide', 'saveDraft', {data: workflowForm})
  workflow = await idspace.sdk.call('ide', 'deploy', {data: workflowForm})

  // Get Workflow info.
  workflow = await idspace.sdk.call('ide', 'getOneWorkflow', {params: [workflowForm.workflowId]})
  const apiToken = workflow.info.parties[0].apiToken
  console.log('Workflow ID ' + workflowForm.workflowId)
  console.log('API Token ' + apiToken)
  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID, process.env.PROJECT_ID)
}
main()


