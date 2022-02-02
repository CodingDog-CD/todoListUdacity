import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly todoTableName = process.env.TODOS_TABLE,
        private readonly todoIndexName = process.env.TODOS_CREATED_AT_INDEX){
        }
        
        async getTodos(userId: string): Promise<TodoItem[]> {
            logger.info(`Get todo list for the user with the ID: ${userId}`)

            const result = await this.docClient.query({
                TableName: this.todoTableName,
                IndexName: this.todoIndexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                  ':userId': userId
                }
            }).promise()
            logger.info(`there are ${result.Count} items detected`)
            const todoItems = result.Items
            return todoItems as TodoItem[]


            
        }

        async createTodo(todoItem: TodoItem): Promise<TodoItem>{
            logger.info(`Creating a new todo item with id ${todoItem.todoId}`)
            
            await this.docClient.put({
                TableName: this.todoTable,
                Item: todoItem
            }).promise()
            return todoItem
        }

        async updateTodo(userId: string, todoId: string, updatedItem: TodoUpdate): Promise<TodoUpdate> {
            const params = {
                TableName: this.todoTableName,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                },
                UpdateExpression: "set #na = :n, #ndD = :dD, #doe = :d",
                ExpressionAttributeNames:{
                    '#na' : 'name',
                    '#ndD': 'dueDate',
                    '#doe': 'done'
                },
                ExpressionAttributeValues:{
                    ":n" : updatedItem.name,
                    ":dD" : updatedItem.dueDate,
                    ":d" : updatedItem.done
                },
                ReturnValues: "UPDATED_NEW"
            }
            const updatedTodoItem = await this.docClient.update(params, function(err, data){
                if (err) {
                    logger.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2))
                } else {
                    logger.info("UpdateItem succeeded:", JSON.stringify(data, null, 2))
                }
            }).promise()
            return updatedTodoItem.Attributes as TodoUpdate
        }

        async deleteTodo(userId: string, todoId: string) {
            const params ={
                TableName: this.todoTableName,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                }
            }
            await this.docClient.delete(params, function(err,data){
                if (err) {
                    logger.error("Unable to delete item. Error JSON: ", JSON.stringify(err,null,2))
                } else {
                    logger.info("DeleteItem succeeded: ", JSON.stringify(data, null, 2))
                }
            }).promise()
        }

        
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}