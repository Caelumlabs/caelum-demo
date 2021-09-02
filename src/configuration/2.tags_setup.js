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

  let tagForm = {
    title: 'Certificat de reciclatge',
    description: 'Certificat de Reciclatge per part del ciutadà',
    url: 'https://valls.cat',
    logo: 'https://valls.cat',
    requirements: 'Reciclar',
    issuedTo: 'Persona'
  }
  let api = await idspace.sdk.call('tag', 'add', {data: tagForm})

  tagForm.title = 'Certificat de compostatge'
  tagForm.description = 'Certificat de Compostatge per part del ciutadà',
  api = await idspace.sdk.call('tag', 'add', {data: tagForm})

  tagForm.title = 'Certificat de vsita a la deixalleria'
  tagForm.description = 'Certificat de Visita a la deixalleria i us dels seus serveis',
  api = await idspace.sdk.call('tag', 'add', {data: tagForm})

  api = await idspace.sdk.call('api', 'getAll')
  console.log(' Certificates: ', api.length)

  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID)
}
main()


