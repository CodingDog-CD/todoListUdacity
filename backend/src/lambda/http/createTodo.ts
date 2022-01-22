import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodoItem } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item

    const userId = getUserId(event)
    const newTodoItem = await createTodoItem(newTodo, userId)

    return {
      statusCode: 201,
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: newTodoItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
