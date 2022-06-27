import { Lambda } from 'aws-sdk'

const lambda = new Lambda()

// --------------------- Lambda Operations --------------------------
/**
 * @description
 * @param {string} FunctionName
 * @param {Object} item
 * @returns {Object}
 */
const Invoke = async (FunctionName, item) => {
  //Create the object to invoke the validation lambda
  let lambdaParams = {
    FunctionName,
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify({ item })
  }
  //Invoke lambda item_validation to check if the item name already exists
  const { Payload } = await lambda.invoke(lambdaParams).promise()
  const { body } = JSON.parse(Payload)
  const lambdaResult = JSON.parse(body)
  return lambdaResult
}

const lambda = {
  Invoke
}

export default lambda