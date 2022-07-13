import { DynamoDB } from 'aws-sdk'

const dynamo = new DynamoDB.DocumentClient({
  region: 'local',
  endpoint: 'http://localhost:8000'
})

// --------------------- Dynamo Operations --------------------------

/**
 * @description
 * @param {Object} options
 * @param {String} options.ItemName
 * @param {Object} options.Item
 * @param {String} options.TableName
 * @returns {Object}
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
 * @param {Object} params
 * @param {string} params.TableName
 * @param {Object} params.Key
 * @param {string} params.Key.id
 * @returns {Object}
 */
const getItemById = async (params) => {
  let response = {}
  try {
    const data = await dynamo.get(params).promise()
    response.body = JSON.stringify(data?.Item)
  } catch (error) {
    console.log( error )
    response.statusCode = 500
    response.body = JSON.stringify( {
        message: "Failed to get item.",
        error: error.message
    })
  }
  return response
}

/**
 * @description
 * @param {Object} options
 * @param {Object} options.params
 * @param {string} options.params.TableName
 * @param {Object} options.params.Key
 * @param {string} options.params.Key.id
 * @param {Object} options.newData
 * @returns {Object}
 */
const updateItem = async (options) => {
  let response = {}
  const paramsArr = Object.keys(options?.newData)
  const params = {
    ...options?.params,
    UpdateExpression: `SET ${paramsArr.map((key) => `#${key} = :${key}`).join(",")}`,
    ExpressionAttributeNames: paramsArr.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
    ExpressionAttributeValues: paramsArr.reduce((acc, key) => ({ ...acc, [`:${key}`]: options?.newData[key] }), {}),
    ReturnValues: "UPDATED_NEW",
  }
  try {
    const updatedItem = await dynamo.update(params).promise()
    response.body = JSON.stringify({
      message: "Item updated successfully.",
      item: options?.newData,
    })
  } catch (error) {
    console.error(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: "Failed to update item.",
      error: error.message
    })
  }
  return response
}

/**
 * @description
 * @param {Object} params
 * @param {string} params.TableName
 * @param {Object} params.Key
 * @param {string} params.Key.id
 * @returns {Object}
 */
const deleteItemById = async (params) => {
  let response = {}
  try {
    await dynamo.delete(params).promise()
    response.body = JSON.stringify({ message: "Item deleted successfully." })
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: "Failed to delete item.",
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
  getItemById,
  getItemByName,
  getItemOrderedByName,
  updateItem,
  deleteItemById
}

export default dynamoDB