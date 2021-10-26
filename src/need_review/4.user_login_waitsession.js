const fs = require('fs')

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const Caelum = require('caelum-sdk');
const caelum = new Caelum(process.env.SUBSTRATE)

// Main function.
const users = async (did) => {
  // Connect to idspace and get org
  const {user, idspace} = await caelum.connect(adminInfo, did);

  // Get session with the Idspace.
  const session = await idspace.getSession('admin');
  console.log('Session: ', session.sessionIdString, session.connectionString);
  idspace.waitSession(session.sessionIdString)
    .then((result) => {
	  console.log('Login Successful: ', result);
	  await caelum.diconnect();
      process.exit();
	});

  // Fullfill session request.
  await user.login(idspace, 'admin', session.sessionIdString);
  
}

/**
* Main
**/
const main = async () => {
  await users(process.env.DID)
}
main()
