const { Lambda } = require('aws-sdk');
const lambda = new Lambda();

// --------------------- Lambda Operations --------------------------
async function InvokeLambdaFunction(FunctionName, item) {
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

module.exports = {
    InvokeLambdaFunction
};