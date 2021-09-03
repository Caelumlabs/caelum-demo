const fs = require('fs')
const path = require('path')
const faker = require('faker')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE);
const adminInfo = require('../json/admin.json');

// Main function.
const setup = async (did) => {
  // Load User and Idspace.
  const {user, idspace} = await caelum.connect(adminInfo, did);

  const auth = {
    url: "https://api.pre.apptramit.com/authorize/login",
    username: "caelum",
    password: "9T9HdY7RqK6nW8Zw"
  }
  const endpoints = [
    {
      method: "POST",
      url: "https://api.pre.apptramit.com/process-request/feedback",
      name: "feedback"
    }
  ]
  const apiForm = {
    name: 'Tramit',
    description: 'Tramit - integració',
    integrationTypeId : 2,
    authenticationId: 3,
    authConfiguration: JSON.stringify(auth),
    endpoints: JSON.stringify(endpoints)
  }
  let api = await idspace.sdk.call('api', 'add', {data: apiForm})

  // Get API Information.
  api = await idspace.sdk.call('api', 'getOne', {params: [1]})
  // console.log('API', api)

  console.log('GET All API')
  api = await idspace.sdk.call('api', 'getAll')
  console.log('API', api)

  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID)
}
main()


