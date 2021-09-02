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
    ciutada_telephone: '+34 655 14 42 11',
	ciutada_govId: '111111111A',
	ciutada_additional: { cadastre: faker.random.uuid() },
    coordenades_longitude: '1',
    coordenades_latitude: '2'
  }
  result = await idspace.sdk.call('workflow', 'set', {data: callWF})
  const stateId = result.stateId
  console.log('StateId ' + stateId)

  const imageData = fs.readFileSync(filePath)
  const form = new FormData()
  form.append('file', imageData, { filepath: filePath, contentType: 'image/png' })
  form.append('workflow', JSON.stringify({
      stateId: stateId,
      actionId: 2,
      partyId: 1,
      apiToken: apiToken
    }))
  await idspace.sdk.call('workflow', 'upload', {form: form})

  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID, process.env.WORKFLOW1_ID,process.env.WF1_API_TOKEN)
}
main()


