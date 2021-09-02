const fs = require('fs')
const path = require('path')
const faker = require('faker')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum')
const caelum = new Caelum(process.env.STORAGE, process.env.GOVERNANCE)
const adminInfo = require('../json/admin.json')

// Main function.
const setup = async (did) => {
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Admin login and set session
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

  // add a new API
  const projectForm = {
    name: 'Reciclatge',
    description: 'Processos de Reciclatge de l\'ajuntament'
  }

  // Add one API.
  let result = await idspace.sdk.call('ide', 'addProject', {data: projectForm})
  const projectId = result.id

  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID)
}
main()


