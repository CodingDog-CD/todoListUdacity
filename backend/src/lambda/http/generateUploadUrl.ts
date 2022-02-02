import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler  from '@middy/http-error-handler'
import { createAttachmentPresignedUrl } from '../../helpers/todos'
//import { getUserId } from '../utils'
// import * as AWS from 'aws-sdk'

/*
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
*/
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    //const userId = getUserId(event)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    
    const url = await createAttachmentPresignedUrl(todoId)
    return {
      statusCode: 201,
      body: JSON.stringify({
          uploadUrl: url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
