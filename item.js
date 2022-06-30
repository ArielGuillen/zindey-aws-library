import uuid from 'uuid'

import dynamoDB from './dynamoDB'

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Body
 * @param {string} TableName
 * @returns {Object}
 */
const create_one = async (ItemName, Body, TableName) => {
  let validationResponse = {}
  //create the response object
  let response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/jsoncharset=UTF-8' },
    body: JSON.stringify({ message: `Create ${ItemName}.` })
  }

  try {
    validationResponse = await validate_name(ItemName, Body?.name, Body?.businessId, TableName)
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: `Failed to validate ${ItemName}.`,
      error: error.message
    })
  }
  const {status} = JSON.parse(validationResponse.body)
  if (status) {
    const id = uuid.v4()
    const newItem = {
      id,
      ...Body
    }
    try {
      response = await dynamoDB.createItem(ItemName, newItem, TableName)
    } catch (error) {
      console.error(error)
      response.statusCode = 500
      response.body = JSON.stringify({
        message: `Failed to create ${ItemName}`,
        error: error.message
      })
    }
  } else {
    response.statusCode = 403
    response.body = JSON.stringify({
      message: `Failed to create ${ItemName}.`,
      error: `${ItemName} "${Body?.name}" already exists.`
    })
  }
  return response
}

/**
 * @description
 * @param {string} ItemName
 * @param {string} Name
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const get_by_name = async (ItemName, Name, BusinessId, TableName) => {
  //create the response object
  let response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/jsoncharset=UTF-8' },
    body: JSON.stringify({ message: `Get ${ItemName}.` })
  }
  try {
    response = await dynamoDB.getItemByName(ItemName, Name, BusinessId, TableName)
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
 * @param {string} ItemName
 * @param {string} Name
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const validate_name = async (ItemName, Name, BusinessId, TableName) => {
  let response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/jsoncharset=UTF-8' },
    body: JSON.stringify({ message: `Validate ${ItemName} name.` })
  }
  try {
    response = await get_by_name(ItemName, Name, BusinessId, TableName)
    let { result } = JSON.parse( response.body )
    // Check if the result.Count contain a value, the name already exists
    if (result.Count == 0){
      response.body = JSON.stringify({
        status: true,
        message: `${ItemName} name ${Name} available.`,
      })
    }
    else {
      response.statusCode = 403
      response.body = JSON.stringify({
        status: false,
        message: `${ItemName} ${Name} already exists.`
      })
    }
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      status: false,
      message: `Failed to validate ${ItemName}.`,
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