import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler  from '@middy/http-error-handler'
import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
// import { stringify } from 'querystring'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    // TODO: Remove a TODO item by id
    await deleteTodo(userId,todoId)

    return {
      statusCode: 200,
      body: `the item ${todoId} has been removed`
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
