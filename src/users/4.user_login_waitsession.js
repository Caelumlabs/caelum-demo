const fs = require('fs')

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE)

// Main function.
const users = async (did) => {
  // Connect to idspace and get org
  await caelum.connect();
  const idspace = await caelum.getOrganizationFromDid(did);
  // Get session with the Idspace.
  const session = await idspace.getSession('admin');
  console.log('Session: ', session.sessionIdString, session.connectionString);
  const result = await idspace.waitSession(session.sessionIdString);
  console.log('Result: ', result);

  process.exit()
}

/**
* Main
**/
const main = async () => {
  await users(process.env.DID)
}
main()
