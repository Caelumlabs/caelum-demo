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

  let issueForm = {
    certificateId: '2323',
    subject:  {
		persona: {
			firstName: 'Alex',
			lastName: 'Puig' ,
		},
		materials: {
			or: '10kg',
			plata: '20kg'
		}
	}
  }
  let api = await idspace.sdk.call('tag', 'issue', {data: issueForm, params:[12]})
  console.log(api)
  process.exit()
}

/**
* Main
**/
const main = async () => {
  await setup(process.env.DID)
}
main()


