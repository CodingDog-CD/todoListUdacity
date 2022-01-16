import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS from 'aws-sdk'
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';


// TODO: Get all TODO items for a current user
const todoTableName = process.env.TODOS_TABLE
const todoIndexName = process.env.TODOS_CREATED_AT_INDEX
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const todos = '...'

    const userId = getUserId(event)
    const docClient = new AWS.DynamoDB.DocumentClient()
    const result = await docClient.query({
      TableName: todoTableName,
      IndexName: todoIndexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({items: result.Items})
    }
  }
)


handler.use(
  cors({
    credentials: true
  })
)
