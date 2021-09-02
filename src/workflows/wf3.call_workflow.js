const fs = require('fs')
const path = require('path')
const faker = require('faker')
const FormData = require('form-data')
const filePath = __dirname + '/test.jpg'
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum')
const caelum = new Caelum(process.env.STORAGE, process.env.GOVERNANCE)
const adminInfo = require('../json/admin.json')

// Main function.
const setup = async (did, workflowId, apiToken) => {
  const idspace = await caelum.loadOrganization(did)
  await idspace.startSdk()

  // Call Workflow
  const callWF = {
    stateId: 0,
    workflowId: workflowId,
    actionId: 1,
    partyId: 1,
    apiToken: apiToken,
    ciutada_currentGivenName: faker.name.firstName(),
    ciutada_currentFamilyName: faker.name.lastName(),
    ciutada_email: faker.internet.email(),
    ciutada_govId: '22211111A',
    ciutada_additional_cadastre: '232422',
    ciutada_telephone: '+34 655 14 42 11',
    materials_material1: 'Fusta',
    materials_weight1: '5 kg',
    materials_material2: 'Ferro',
    materials_weight2: '2 kg'
  }
  result = await idspace.sdk.call('workflow', 'set', {data: callWF})
  const stateId = result.stateId
  console.log('StateId ' + stateId)
  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID, process.env.WORKFLOW3_ID,process.env.WF3_API_TOKEN)
}
main()


