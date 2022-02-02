// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'heza8scpg2'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-qvu-29oi.us.auth0.com',            // Auth0 domain
  clientId: 'kJ9DugSQ7xjZcf7dDVk9n5XZ0oik3aJC',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}