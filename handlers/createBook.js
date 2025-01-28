const AWS = require('aws-sdk');

exports.createBook = async (event) => {
  console.log("Event", event);
  const body = JSON.parse((event.body).toString());
  console.log("Body", body);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  try {
    //Validate inputs
    if (!body.name || !body.author || !body.price) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "All fields are required"
        })
      }
    }

    //Check if an existing book
    const scanParams = {
      TableName: process.env.DYNAMODB_BOOK_TABLE,
      FilterExpression: "#nameAttr = :name",
      ExpressionAttributeNames: {
        "#nameAttr": "name"
      },
      ExpressionAttributeValues: {
        ":name": body.name
      }
    }
    console.log("Scan params", scanParams);
    const existingBook = await dynamoDb.scan(scanParams).promise();
    console.log("Existing book", existingBook);
    if ( existingBook.Items && existingBook.Items.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "The book is already exists"
        })
      }
    }

    //Adding a book
    const bookId = AWS.util.uuid.v4();
    console.log("Book id", bookId);
    const params = {
      TableName: process.env.DYNAMODB_BOOK_TABLE,
      Item: {
        bookId: bookId,
        name: body.name,
        author: body.author,
        price: body.price
      }
    }
    console.log("Params", params);
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Book added successfully!",
      }),
    };

  } catch (error) {
    console.log("Error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error while adding a book"
      })
    }
  }
  };
  