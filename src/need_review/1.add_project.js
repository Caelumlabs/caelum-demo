const fs = require('fs')
const path = require('path')
const faker = require('faker')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE);
const adminInfo = require('../json/admin.json')

// Main function.
const setup = async (did) => {
  // Connect and Login.
  const {user, idspace} = await caelum.connect(adminInfo, did);

  // add a new API
  const projectForm = {
    name: 'Reciclatge',
    description: 'Processos de Reciclatge de l\'ajuntament'
  }

  // Add one API.
  let result = await idspace.sdk.call('ide', 'addProject', {data: projectForm})
  const projectId = result.id
  console.log(result)

  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID)
}
main()


