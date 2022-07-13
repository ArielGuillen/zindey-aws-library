import { v4 } from 'uuid'

import dynamoDB from './dynamoDB'

/**
 * @description
 * @param {Object} options
 * @param {String} options.ItemName
 * @param {Object} options.Body
 * @param {String} options.TableName
 * @returns {Object} response
 */
const create_one = async (options) => {
  let validationResponse = {}
  //create the response object
  let response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/jsoncharset=UTF-8' },
    body: JSON.stringify({ message: `Create ${options?.ItemName}.` })
  }
  try {
    validationResponse = await validate_name({
      ItemName: options?.ItemName,
      Name: options?.Body?.Name,
      BusinessId: options?.Body?.BusinessId,
      TableName: options?.TableName
    })
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: `Failed to validate ${options?.ItemName}.`,
      error: error.message
    })
  }
  const { status } = JSON.parse(validationResponse.body)
  if (status) {
    const id = v4()
    const newItem = {
      id,
      ...options?.Body
    }
    try {
      response = await dynamoDB.createItem({
        ItemName:options?.ItemName,
        Item: newItem,
        TableName:options?.TableName
      })
    } catch (error) {
      console.error(error)
      response.statusCode = 500
      response.body = JSON.stringify({
        message: `Failed to create ${options?.ItemName}`,
        error: error.message
      })
    }
  } else {
    response.statusCode = 403
    response.body = JSON.stringify({
      message: `Failed to create ${options?.ItemName}.`,
      error: `${options?.ItemName} "${options?.Body?.name}" already exists.`
    })
  }
  return response
}

/**
 * @description
 * @param {Object} params
 * @param {string} params.ItemName
 * @param {string} params.Name
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const get_by_name = async (params) => {
  //create the response object
  let response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/jsoncharset=UTF-8' },
    body: JSON.stringify({ message: `Get ${params?.ItemName}.` })
  }
  try {
    response = await dynamoDB.getItemByName(params)
  } catch (error) {
    console.error(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: `Failed to get ${params?.ItemName}.`,
      error: error.message
    })
  }
  return response
}

/**
 * @description
 * @param {string} ItemName
 * @param {string} Order
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const get_ordered = async (ItemName, Order, BusinessId, TableName) => {
  //create the response object
  let response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/jsoncharset=UTF-8' },
    body: JSON.stringify({ message: `Get ${ItemName}.` })
  }
  try {
    //Parse ORDER String to a boolean value
    //True:Ascending  - False:descending
    let sorting = Order == 'DESC' ?
      false : true
    response = await dynamoDB.getItemOrderedByName(sorting, ItemName, BusinessId, TableName)
  } catch (error) {
      console.error(error)
      response.statusCode = 500
      response.body = JSON.stringify({
        message: `Failed to get ${ItemName}.`,
        error: error.message
      })
  }
  return response
}

/**
 * @description
 * @param {Object} params
 * @param {string} params.ItemName
 * @param {string} params.Name
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const validate_name = async (params) => {
  let response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/jsoncharset=UTF-8' },
    body: JSON.stringify({ message: `Validate ${params?.ItemName} name.` })
  }
  try {
    response = await get_by_name(params)
    let { result } = JSON.parse( response.body )
    // Check if the result.Count contain a value, the name already exists
    if (result.Count == 0){
      response.body = JSON.stringify({
        status: true,
        message: `${params?.ItemName} name ${params?.Name} available.`,
      })
    }
    else {
      response.statusCode = 403
      response.body = JSON.stringify({
        status: false,
        message: `${params?.ItemName} ${params?.Name} already exists.`
      })
    }
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      status: false,
      message: `Failed to validate ${params?.ItemName}.`,
      error: error.message
    })
  }
  return response
}

const item = {
  create_one,
  get_by_name,
  get_ordered,
  validate_name
}

export default item