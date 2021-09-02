const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum')
const caelum = new Caelum(process.env.STORAGE, process.env.GOVERNANCE)
const adminInfo = require('../json/admin.json')

// Main function.
const users = async (did) => {
  // Load User and Idspace.
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Login as admin to the idspace.
  await user.login(did, 'admin')

  // After login. Set the session parameters to be able to interact with the idspace.
  console.log(user.sessions)
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

  // Get a list of the users.
  console.log('Get users')
  const users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length)

  // Get One user.
  const admin = await idspace.sdk.call('user', 'getOne', {params: [users[0].id]})
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
