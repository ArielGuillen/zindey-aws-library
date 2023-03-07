import {
  QueryCommand,
  GetItemCommand,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
const dynamo = new DynamoDBClient();

import { Response } from "./config/constants/Response";

// --------------------- Dynamo Operations --------------------------

/**
 * @description
 * @param {Object} input            - input object
 * @param {string} input.ItemName   - name of item
 * @param {Object} input.Item       - item object to be created
 * @param {string} input.TableName  - name of table
 * @returns {Object}                - response object with message and item created
 */
export const createItem = async (input) => {
  try {
    const command = new PutItemCommand({
      TableName: input?.TableName,
      Item: input?.Item,
    });
    const response = await dynamo.send(command);

    return Response.success({
      message: `${input?.ItemName} created successfully.`,
      item: input?.Item,
    });
  } catch (error) {
    console.error(error);
    return Response.error(500, {
      message: `Failed to create ${input?.ItemName}.`,
      error: error.message,
    });
  }
};

/**
 * @description
 * @param {Object} input            - input object
 * @param {string} input.TableName  - name of table
 * @param {Object} input.Key        - key object
 * @param {string} input.Key.id     - id of item to get
 * @returns {Object}                - response object with message and item found
 */
export const getItemById = async (input) => {
  try {
    const command = new ImportTableCommand(input);
    const response = await dynamo.send(command);
    return Response.success(response?.Item);
  } catch (error) {
    console.log(error);
    return Response.error(500, {
      message: "Failed to get item.",
      error: error.message,
    });
  }
};

/**
 * @description
 * @param {Object} input            - input object
 * @param {string} input.TableName  - name of table
 * @param {Object} input.Key        - key object
 * @param {string} input.Key.id     - id of item to update
 * @param {Object} input.newData    - new data to be updated
 * @returns {Object}                - response object with message and item updated
 */
export const updateItem = async (input) => {
  const paramsArr = Object.keys(input?.newData);
  const params = {
    ...input,
    UpdateExpression: `SET ${paramsArr
      .map((key) => `#${key} = :${key}`)
      .join(",")}`,
    ExpressionAttributeNames: paramsArr.reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    ),
    ExpressionAttributeValues: paramsArr.reduce(
      (acc, key) => ({ ...acc, [`:${key}`]: input?.newData[key] }),
      {}
    ),
    ReturnValues: "UPDATED_NEW",
  };
  try {
    const command = new UpdateItemCommand(params);
    const response = await dynamo.send(command);
    return Response.success({
      message: "Item updated successfully.",
      item: input?.newData,
    });
  } catch (error) {
    console.error(error);
    return Response.error(500, {
      message: "Failed to update item.",
      error: error.message,
    });
  }
};

/**
 * @description
 * @param {Object} input            - input object
 * @param {string} input.TableName  - name of table
 * @param {Object} input.Key        - key object
 * @param {string} input.Key.id     - id of item to delete
 * @returns {Object}                - response object with message if item has been deleted
 */
export const deleteItemById = async (input) => {
  try {
    const command = new DeleteItemCommand(input);
    const response = await dynamo.send(command);
    return Response.success({ message: "Item deleted successfully." });
  } catch (error) {
    console.log(error);
    return Response.error(500, {
      message: "Failed to delete item.",
      error: error.message,
    });
  }
};

/**
 * @description
 * @param {Object}  input            - input object
 * @param {boolean} input.Sorting    - Boolean value to sort -> ascending if true, descending if false
 * @param {string}  input.ItemName   - name of item for response messages
 * @param {string}  input.BusinessId - id of business
 * @param {string}  input.TableName  - name of table
 * @returns {Object}                 - response object with message and items sorted by name
 */
export const getItemOrderedByName = async (input) => {
  let params = {
    TableName: input.TableName,
    ScanIndexForward: input.Sorting,
    KeyConditionExpression: "businessId = :v_businessId",
    ExpressionAttributeValues: {
      ":v_businessId": input.BusinessId,
    },
  };

  try {
    const command = new QueryCommand(params);
    const response = await client.send(command);

    return Response.success({
      message: `Get ${ItemName} successfully.`,
      item: response,
    });
  } catch (error) {
    console.error(error);
    return Response.error(500, {
      message: `Failed to get ${ItemName}.`,
      error: error.message,
    });
  }
};

/**
 * @description
 * @param {Object} input              - input object
 * @param {string} input.ItemName     - name of item for response messages
 * @param {String} input.Name         - name of item to get
 * @param {string} input.BusinessId   - id of business
 * @param {string} input.TableName    - name of table to get item from
 * @returns {Object}                  - response object with message and item found
 */
export const getItemByName = async (input) => {
  let params = {
    TableName: input?.TableName,
    KeyConditionExpression: "businessId = :v_businessId AND #name = :v_name",
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":v_businessId": input?.BusinessId,
      ":v_name": input?.Name,
    },
  };
  try {
    const command = new QueryCommand(params);
    const response = await client.send(command);
    return Response.success({
      message: `Get ${input?.ItemName} successfully.`,
      result,
    });
  } catch (error) {
    console.error(error);
    return Response.error(500, {
      message: `Failed to get ${input?.ItemName}.`,
      error: error.message,
    });
  }
  return response;
};
