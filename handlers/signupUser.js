'use strict'
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

exports.signupUser = async (event) => {
    try {
        const body = JSON.parse((event.body).toString());
        const dynamoDb = new AWS.DynamoDB.DocumentClient();

        //Validate the input
        if (!body.firstname || !body.lastname || !body.email || !body.password){
            return {
                statusCode: 400,
                body: JSON.stringify({message: "All fields are required"})
            }
        }

        //Check user already exists
        const scanParams = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": body.email,
            }
        }
        const existingUser = await dynamoDb.scan(scanParams).promise();
        if (existingUser.Items && existingUser.Items.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "User already exists"})
            }
        }

        //Generate userId
        const userId = AWS.util.uuid.v4();

        //Encrypt the password
        const encryptedPassword = await bcrypt.hash(body.password, 10);

        //Store data to the table
        const putParams = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Item: {
                UserId: userId,
                firstname: body.firstname,
                lastname: body.lastname,
                email: body.email,
                password: encryptedPassword
            },
        }
        await dynamoDb.put(putParams).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({message: "User created successfully"}),
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Error while creating the user"})
        }
    }
}