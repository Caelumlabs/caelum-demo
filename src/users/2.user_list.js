const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE);
const adminInfo = require('../json/admin.json')

// Main function.
const users = async (did) => {
  // Load User and Idspace.
  await caelum.connect();
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.getOrganizationFromDid(did);

  // Login as admin to the idspace.
  await user.login(did, 'admin')

  // After login. Set the session parameters to be able to interact with the idspace.

  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].signedCredential.credentialSubject.capability.type)

  // Get a list of the users.
  console.log('Get users')
  const users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length)

  console.log(users);

  // Get One user.
  const admin = await idspace.sdk.call('user', 'getOne', {params: [users[0].userId]})
  console.log('User: ', admin)
  process.exit()

}

/**
* Main
**/
const main = async () => {
  await users(process.env.DID)
}
main()
