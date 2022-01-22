import { TodoAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

// TODO: Implement businessLogic
const todoAccess = new TodoAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getTodosForUser(userId: string){
    return await todoAccess.getTodos(userId)
}


export async function createTodoItem(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    const newItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `http://${bucketName}.s3.amazonaws.com/${todoId}`
    }
    await todoAccess.createTodo(newItem)

    return newItem

}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string>{
    return AttachmentUtils(todoId)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoUpdate> {


    const updatedItem = {
        name: updatedTodo.name,
        dueDate: updatedTodo.dueDate,
        done: updatedTodo.done
    }
    const updatedTodoItem = await todoAccess.updateTodo(userId, todoId, updatedItem)
    return updatedTodoItem
}

export async function deleteTodo(userId: string, todoId: string) {
    await todoAccess.deleteTodo(userId,todoId)
}