import { DynamoDB } from 'aws-sdk'

const dynamo = new DynamoDB.DocumentClient()

// --------------------- Dynamo Operations --------------------------

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Item
 * @param {string} TableName
 * @returns {Object}
 */
const createItem = async (ItemName, Item, TableName) => {
  let response = {}
  try {
    await dynamo.put({
      TableName,
      Item
    }).promise()
    response.body = JSON.stringify({
      message: `${ItemName} created successfully.`,
      item: Item
    })
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to create ${ItemName}.`,
      error: error.message
    })
  }
  return response
}

/**
 * @description
 * @param {boolean} Sorting
 * @param {string} ItemName
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const getItemOrderedByName = async ( Sorting, ItemName, BusinessId, TableName) => {
  let response = {}

  //Create the object with the Dynamo params
  let params = {
    TableName,
    ScanIndexForward: Sorting,    // Boolean value to sort -> ascending if true, descending if false
    KeyConditionExpression: 'businessId = :v_businessId',
    ExpressionAttributeValues: {
      ':v_businessId': BusinessId
    }
  }

  try {
    const result = await dynamo.query(params).promise()
    response.body = JSON.stringify({
      message: `Get ${ItemName} successfully.`,
      result
    })
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to get ${ItemName}.`,
      error: error.message
    })
  }
  return response
}

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Name
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const getItemByName = async(ItemName, Name, BusinessId, TableName) => {
  let response = {}

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
  try {
    const result = await dynamo.query(params).promise();
    response.body = JSON.stringify({
      message: `Get ${ItemName} successfully.`,
      result
    })
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to get ${ItemName}.`,
      error: error.message
    })
  }
  return response
}

const dynamoDB = {
  createItem,
  getItemByName,
  getItemOrderedByName
}

export default dynamoDB