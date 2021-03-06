import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler  from '@middy/http-error-handler'
import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
// import { stringify } from 'querystring'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const result = await updateTodo(userId, todoId, updatedTodo)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result
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
