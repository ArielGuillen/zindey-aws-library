import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const client = new LambdaClient(config);

// --------------------- Lambda Operations --------------------------
/**
 * @description
 * @param {string} FunctionName
 * @param {Object} item
 * @returns {Object}
 */
export const Invoke = async (FunctionName, item) => {
  //Create the object to invoke the validation lambda
  let lambdaParams = {
    FunctionName,
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: JSON.stringify({ item }),
  };

  const command = new InvokeCommand(lambdaParams);
  const { Payload } = await client.send(command);
  const { body } = JSON.parse(Payload);
  const lambdaResult = JSON.parse(body);
  return lambdaResult;
};

