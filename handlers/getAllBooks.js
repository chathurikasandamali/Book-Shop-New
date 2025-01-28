const AWS = require("aws-sdk");

exports.getAllBooks = async (event) => {
    console.log("Event", event);

    try{
        const dynamoDb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: process.env.DYNAMODB_BOOK_TABLE
        }
        const data = await dynamoDb.scan(params).promise();
        console.log("Data", data);

        return {
            statusCode: 200,
            body: JSON.stringify({
              message: "Recieved all records!",
              data: data.Items
            }),
        };
    } catch (error) {
        console.log("Error", error);
        return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Error while receiving all records!",
              data: data.Items
            }),
          };
    }
  };
  