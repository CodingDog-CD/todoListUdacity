import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new AWS.S3({
    signatureVersion: 'v4'
  })

  export async function AttachmentUtils(todoId: string): Promise<string>{
    const url = s3.getSignedUrl('putObject', {
        Bucket: bucketName, // add bucket name from environment variable
        Key: todoId,        // add the key 
        Expires: urlExpiration // add the expiration time
      })
    return url
  }
  