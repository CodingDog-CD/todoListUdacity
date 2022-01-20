import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { APIGatewayProxyEvent } from 'aws-lambda'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly getDocClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly todoTableName = process.env.TODOS_TABLE,
        private readonly todoIndexName = process.env.TODOS_CREATED_AT_INDEX){
        }
        
        async getTodos(userId: string): Promise<TodoItem[]> {
            console.log(`Get todo list for the user with the ID: ${userId}`)

            const result = await this.getDocClient.query({
                TableName: this.todoTableName,
                IndexName: this.todoIndexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                  ':userId': userId
                }
            }).promise()

            const todoItems = result.Items
            return todoItems as TodoItem[]
        }

        async createTodo(todoItem: TodoItem){
            console.log(`Creating a new todo item with id ${todoItem.todoId}`)
            
            await this.docClient.put({
                TableName: this.todoTable,
                Item: todoItem
            }).promise()
        }

        
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new AWS.DynamoDB.DocumentClient()
}