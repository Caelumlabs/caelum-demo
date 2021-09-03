const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE);
const adminInfo = require('../json/admin.json')

// Main function.
const users = async (did) => {
  // Load User and Idspace.
  const {user, idspace} = await caelum.connect(adminInfo, did);

  // Get a list of the users.
  const users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length)

  // console.log(users);

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
