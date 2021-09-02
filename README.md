# Caelum - Ajuntament de Valls - Guia

Tutorial d'integració per a l'ajuntament de Valls.
Dins de src hi ha els diferents scripts per interactuar amb el Idspace

Primer instal.la
```bash
git clone ...
yarn
```

Ara pots anar al (frontend)[https://web.tabit.caelumapp.com] de Caelum i afegeix un nou ususari. Les dades poden ser inventades (email també).
Quan l'hagis afegit, fes click a sobre d'ell i a la dreta veuràs el secret Code.

Crea un fitxer .env a l'arrel amb lse següents dades:
```
STORAGE=https://api.bigchaindb.caelumapp.com/api/v1/
GOVERNANCE=wss://substrate.tabit.caelumapp.com
DID_CAELUM=5C5ZCTRoLuetMJr1nkt6VoNvdFN1ke7eLfRukGagtX2qbZtv
DID_VALLS=5Gs7jTt7vYXvA8EFs5LTuonn1Q5sWT8M9KyrU7hCijGAYsKf
SECRET=1
USER_ID=2
PROJECT_ID=1
API_TOKEN=0
WORKFLOW1_ID=1
WORKFLOW2_ID=2
WORKFLOW3_ID=3
WORKFLOW4_ID=4
```
El secret serà aquell que has agafat del frontend

## src/users - Scripts per a gestió d'usuaris
Amb això ja pots reclamar la capacitat d'admin per aquest usuari nou.

Executa:
```bash
# node src/users/1.claim_admin
```
Aquest script et crea un nou wallet i el guarda a /src/admin.json

Ara ja es pot veure els usuaris

En qualsevol moment es pot fer reset d'aquest admin cridant a : https://valls.tabit.caelumapp.com/api/v1/auth/reset/2
On l'últim parametre es el id de l'usuari

ARa pots modificar el .env amb el valor de USER_ID=0

```bash
# node src/users/2.user_list
```

I afegir una nova capacitat (per exemple : member-technology)
es poden veure les capacitat disponibles desde idspace.parameters
```bash
# node src/users/3.user_capacity
```

Desde el frontend o fent consulta a l'usuari ja veuràs que te dues capacitats : admin i member-technology

## src/configurations

Els següents passos son per a configurar el que ens cal per als workflows

### Integració amb Tràmit
Configurar l'api de Tràmit

```bash
# node src/configuration/1.apis_setup
```

### Configurar els Tags (certificats)
```bash
# node src/configuration/2.tags_setup
```

## src/workflows

Primer ens cal afegir un projecte que agrupi els workflows
```bash
# node src/workflows/1.project_add
```

Primer actualitzem el .env amb el projectId

I ja podem afegir el Workflow
```bash
# node src/workflows/2.workflow_add
```

Ara actualitzem el .env amb el workflowId1 i l'Api Token que ens cal per a poder cridar el procés que acabem d'instal.lar
Ja podem cridar el procés

```bash
# node src/workflows/3.workflow_call
```
Et retorn el stateId. Ja pots anar a l front i veure que hi ha una instància del prócés
Si fas login com a member-technology veuràs que tens pendent una tasca per aprobar
