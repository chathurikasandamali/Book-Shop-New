const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

exports.loginUser = async (event) => {
    console.log("Event", event);

    try {
        const body = JSON.parse((event.body).toString());
        console.log("Body", body);
        const dynamoDb = new AWS.DynamoDB.DocumentClient();

        console.log("@@@@@@")
        //Validate inputs
        if ( !body.email || !body.password) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "All fields are required"})
            }
        }
        console.log("!!!!!!!")

        //Check user already exists
        existingParams = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": body.email,
            }
        }
        const existingUser = await dynamoDb.scan(existingParams).promise();
        console.log("Exisiting user", existingUser)
        if( existingUser.Items && existingUser.Items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "User is not registered yet"})
            }
        }

        //Check valid password
        const user = existingUser.Items[0];
        const isValidPassword = await bcrypt.compare(body.password, user.password);
        if (!isValidPassword) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "Invalid user email or password"})
            }
        }
        console.log("First name", existingUser.Items[0].firstname);

        //Successfull login
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User login successfully",
                user: {
                    userId: existingUser.Items[0].UserId,
                    firstname: existingUser.Items[0].firstname,
                    lastname: existingUser.Items[0].lastname,
                    email: body.email
                }
            })
        }
    } catch (error) {
        console.log("Error", error);
        return {
            statusCode: 500, 
            body: JSON.stringify({message: "Error while getting the user"}),
          };
    }
  };
  