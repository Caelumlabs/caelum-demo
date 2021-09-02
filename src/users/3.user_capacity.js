const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum')
const caelum = new Caelum(process.env.STORAGE, process.env.GOVERNANCE)
const adminInfo = require('../json/admin.json')

// Main function.
const users = async (did, userId) => {
  // Load User and Idspace.
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

  // Issue a new capacity.
  const capacity = { userId: userId, subject: 'member-technology' }
  let result = await idspace.sdk.call('user', 'issue', {data: capacity})

  // List Notifications and find the new capacity. We need to login as peerdid (user), not as a particular credential (admin)
  await user.login(did, 'peerdid')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)
  const notifications = await idspace.sdk.call('auth', 'notifications')

  // Claim capacity for the user.
  await user.claim(idspace, notifications[0].id)

  // The wallet has been updated. Save changes.
  const userJson = await user.export()
  await fs.writeFileSync( path.resolve(__dirname, '../json') + '/admin.json', userJson, 'utf8')
  process.exit()
}

/**
* Main
**/
const main = async () => {
  await users(process.env.DID, process.env.USER_ID)
}
main()
