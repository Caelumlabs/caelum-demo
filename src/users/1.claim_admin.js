const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// const Caelum = require('caelum')
const Caelum = require('../../../caelum-sdk/src/index');
const caelum = new Caelum(process.env.SUBSTRATE);

// Main function.
const claimAdmin = async (did, secretCode) => {
  await caelum.connect();
  // Creates a new user Object with new connection keys.
  const user = await caelum.newUser()

  // Opens a new session with the Idspace.
  const idspace = await caelum.getOrganizationFromDid(did);
  const session = await idspace.getSession('admin');

  // This is the QR code we can see in the Web.
  console.log('QR Code : ' + session.connectionString)

  // Register the user with the secret Code.
  const peerDid = await user.registerConnectionString(session.connectionString, secretCode)
  process.exit();

  // Export user to JSON.
  const userJson = await user.export()
  await fs.writeFileSync( path.resolve(__dirname, '../json') + '/admin.json', userJson, 'utf8')

  process.exit()
}

/**
* Main
**/
const main = async () => {
  await claimAdmin(process.env.DID, process.env.SECRET)
}
main()
