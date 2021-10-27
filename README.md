# Caelum Demo

A collection of scripts to play with the [caelum-sdk]() TODO npm package and experience the integrations with the rest of the environment:

- Substrate
- Backend (idspace)
- Client (Caelum front)
- App (Caelum Labs)

<br>

## How to set up the repository

Clone the repository (mind the current directory):

```bash
cd ~/Projects
git clone git@github.com:Caelumlabs/caelum-demo.git
```

Update the current directory and install the repository requirements:

```bash
cd caelum-sdk
yarn install
```

Create an `.env` file at the root of the project and define the required environment variables, e.g.:

```bash
# TODO perhaps update to tabit
SUBSTRATE=ws://127.0.0.1:9944
NETWORK=development
```

Find a complete list of environment variables at `.env.example`.

<br>

## How to use the repository

Scripts are located in the `/src` directory, organised around entities, e.g. users, certificates, etc.

Run first the script [claim_admin]() TO DO. This will generate a JSON file with your keys and certificates, which are needed to run the rest of the scripts.

Most of the other scripts can be executed in no particular order, but we suggest following the [Getting started]() TODO section below for a quick overview.

<br>

## Getting started

### 1. Claim admin

**Location**

[_src/users/1.claim_admin_]() TODO

**Background**

When setting up a new organisation, i.e. when creating an idspace instance, the first user is added with a `capability` of admin.

The user gets an email with a `secret` (required to complete their registration), and a link to the [Caelum front]() TODO, where a QR code pops up when attempting to access.

To proceed, users need to install the Caelum App on their phone. Set up name and password, then scan the QR and enter the secret.

As a result, an encrypted JSON file is generated and saved in the device, where the user keys and their certificates are stored for future usage, e.g. sharing credentials TODO.

This process applies to every new user added to the platform.

**Execution**

Run the command below to complete the registration process as admin of the platform.

By the end of the process you should be able to locate a JSON file with your keys and your admin credential at `data/admin.json`.

```bash
node src/users/1.claim_admin
```

### 2. Add other users

**Location**

[_src/users/3.add_user_]() TODO

**Background**

Add more users to the organisation by providing their details.

Run the script [add_capability]() TO DO inmediately after, to define the relationship between them and the organisation.

**Execution**

Run the command below to add a user. Send data as per `userForm`.

- All fields required except for `telephone `
- Field `email` must be unique

```bash
node src/certificates/2.add_certificate
```

### 3. Add capability

**Location**

[_src/users/4.add_capability_]() TODO

**Background**

By adding a capability you are issuing a credential of type `memberOf` that the user will later sign (similar to [claim_admin]() TO DO).

Execute this process when adding a new user to define their relationship with the organisation.

You can also execute it for existing users: one user can hold many capabilities, e.g. admin and member of customer service.

**Execution**

Run the command below to add a capability to a user. Set `userId` on the `.env` file (see [get_users]() TO DO). Send data as per `userCapability`.

The last part of the script is not needed, but demonstrate the process of claiming the new capability. If you run this against your user, your `data/admin.json` will be updated.

```bash
node src/certificates/2.add_certificate
```
