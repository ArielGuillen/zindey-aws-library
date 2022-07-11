import { DynamoDB } from 'aws-sdk'

const dynamo = new DynamoDB.DocumentClient({
  region: 'local',
  endpoint: 'http://host.docker.internal:8000'
})

// --------------------- Dynamo Operations --------------------------

/**
 * @description
 * @param {Object} options
 * @param {String} options.ItemName
 * @param {Object} options.Item
 * @param {String} options.TableName
 * @returns {Object} response
 */
const createItem = async (options) => {
  let response = {}
  try {
    await dynamo.put({
      TableName: options?.TableName,
      Item: options?.Item
    }).promise()
    response.body = JSON.stringify({
      message: `${options?.ItemName} created successfully.`,
      item: options?.Item
    })
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to create ${options?.ItemName}.`,
      error: error.message
    })
  }
  return response
}

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Item
 * @param {string} TableName
 * @returns {Object}
 */
const updateItem = async (ItemName, Item, TableName) => {
  let validationResponse = {}
  const response = {
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify({ message: "Update item." }),
    headers: { 'Content-Type': 'application/json;charset=UTF-8' }
  }
  // Get the id from the url params
  const { id } = event?.pathParameters
  // Transform the JSON string of body value to a javascript object
  const req = JSON.parse(event.body)
  const paramsArr = Object.keys(req)
  if(req?.name){
    /* try {
      validationResponse = await itemExist( LAMBDA_NAME, req?.name )
    } catch (error) {
      response.statusCode = 500
      response.body = JSON.stringify({
        message: "Failed to validate item.",
        error: error.message
      })
    } */
  validationResponse.status = 200
  } else validationResponse.status = true
  if ( validationResponse?.status || validationResponse?.id === id ) {
    const params = {
      TableName,
      Key: { id },
      UpdateExpression: `SET ${paramsArr.map((key) => `#${key} = :${key}`).join(",")}`,
      ExpressionAttributeNames: paramsArr.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      ExpressionAttributeValues: paramsArr.reduce((acc, key) => ({ ...acc, [`:${key}`]: req[key] }), {}),
      ReturnValues: "UPDATED_NEW",
    }
    try {
      await db.update(params).promise()
      response.body = JSON.stringify({
        message: "Item updated successfully.",
        item: req,
      })
    } catch (error) {
      console.error(error)
      response.statusCode = 500
      response.body = JSON.stringify({
        message: "Failed to update item.",
        error: error.message
      })
    }
  } else {
    response.statusCode = 403
    response.body = JSON.stringify({
      message: "Failed to update item.",
      error: `Item "${req?.name}" already exists.`,
    })
  }
  return response
}

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Item
 * @param {string} TableName
 * @returns {Object}
 */
const deleteItem = async (ItemName, Id, TableName) => {

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
 * @param {Object} options
 * @param {string} options.ItemName
 * @param {String} options.Name
 * @param {string} options.BusinessId
 * @param {string} options.TableName
 * @returns {Object}
 */
const getItemByName = async(options) => {
  let response = {}

  //Create the object with the Dynamo params
  let params = {
    TableName,
    KeyConditionExpression: 'businessId = :v_businessId AND #name = :v_name',
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ':v_businessId': options?.BusinessId,
      ':v_name': options?.Name
    }
  }
  try {
    const result = await dynamo.query(params).promise()
    response.body = JSON.stringify({
      message: `Get ${options?.ItemName} successfully.`,
      result
    })
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to get ${options?.ItemName}.`,
      error: error.message
    })
  }
  return response
}

const dynamoDB = {
  createItem,
  getItemByName,
  getItemOrderedByName,
  updateItem,
  deleteItem
}

export default dynamoDB