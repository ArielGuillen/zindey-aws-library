import { DynamoDB } from 'aws-sdk'

const dynamo = new DynamoDB.DocumentClient()

// --------------------- Dynamo Operations --------------------------
const createItem = async (ItemName, Item, TableName, Response) => {
  try {
    await dynamo.put({
      TableName,
      Item
    }).promise()
    Response.body = JSON.stringify({
      message: `${ItemName} created successfully.`,
      item: Item
    })
  } catch (error) {
    console.error(error);
    Response.statusCode = 500;
    Response.body = JSON.stringify({
      message: `Failed to create ${ItemName}.`,
      error: error.message
    })
  }
  return Response
}

const getItemOrderedByName = async ( Ascending, ItemName, businessId, TableName, Response) => {
  try {
    //Create the object with the Dynamo params
    let params = {
      TableName,
      ScanIndexForward: Ascending,    //Boolean value to sort ascending if true and descending if false
      KeyConditionExpression: 'businessId = :v_businessId',
      ExpressionAttributeValues: {
        ':v_businessId': businessId
      }
    }
    const result = await dynamo.query(params).promise();
    Response.body = JSON.stringify({ 
      message: `Get ${ItemName} successfully.`,
      result
    })
  } catch (error) {
    console.error(error);
    Response.statusCode = 500;
    Response.body = JSON.stringify({
      message: `Failed to get ${ItemName}.`,
      error: error.message
    })
  }
  return Response
}

const getItemByName = async(ItemName, Name, BusinessId, TableName, Response) => {
  try {
    //Create the object with the Dynamo params
    let params = {
      TableName,
      KeyConditionExpression: 'businessId = :v_businessId AND #name = :v_name',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':v_businessId': BusinessId,
        ':v_name': Name
      }
    }
    const result = await dynamo.query(params).promise();
    Response.body = JSON.stringify({
      message: `Get ${ItemName} successfully.`,
      result
    })
  } catch (error) {
    console.error(error);
    Response.statusCode = 500;
    Response.body = JSON.stringify({
      message: `Failed to get ${ItemName}.`,
      error: error.message
    })
  }
  return Response
}

const dynamoDB = {
  createItem,
  getItemByName,
  getItemOrderedByName
}

export default dynamoDB