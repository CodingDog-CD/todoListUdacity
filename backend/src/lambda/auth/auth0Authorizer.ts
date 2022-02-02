import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-qvu-29oi.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  const kidPropJwt = jwt.header.kid
  const jwksClient = require('jwks-rsa')
  
  const jwksClientObject = jwksClient({
    strictSsl: true,
    jwksUri: jwksUrl
  })
  
  console.log(token)
  console.log(jwt)
  console.log(jwksClientObject)
  console.log(`kid value: ${kidPropJwt}`)
  console.log("Getting signingKey")
  /*
  const signingKey = jwksClientObject.getSigningKey(kidPropJwt, (err, key)=>{
    if (err) {
      console.log('failed to get signing key')
    }
    //key.publicKey || key.rsaPublicKey
    if (!key) {
      console.log('key doesn\'t exist!!!')
    }
    console.log(key)
    const keyResult = key.publicKey || key.rsaPublicKey
    return keyResult
  })
  console.log("verifying key pair")
  console.log(token)
  console.log(signingKey)
  */
  const key = await jwksClientObject.getSigningKey(kidPropJwt)
  const signingKey = key.getPublicKey()
  console.log(signingKey)
  const verifiedToken = verify(token, signingKey, {algorithms: ['RS256']}) as JwtPayload
  console.log(verifiedToken)

  return verifiedToken
}



function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
