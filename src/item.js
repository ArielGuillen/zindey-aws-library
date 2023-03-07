import { v4 } from "uuid";

import * as dynamoDB from "./dynamoDB";
import { Response } from "./config/constants/Response";

/**
 * @description
 * @param {Object} input            - input object for item creation
 * @param {String} input.ItemName   - name of the item to response messages
 * @param {Object} input.Body       - body of the item to create
 * @param {String} input.TableName  - table name to create item
 * @returns {Object}
 */
export const create_one = async (input) => {
  let validationResponse = {};
  try {
    validationResponse = await validate_name({
      ItemName: input?.ItemName,
      Name: input?.Body?.Name,
      BusinessId: input?.Body?.BusinessId,
      TableName: input?.TableName,
    });

    const { status } = JSON.parse(validationResponse.body);
    if (status) {
      const id = v4();

      response = await dynamoDB.createItem({
        ItemName: input?.ItemName,
        Item: {
          id,
          ...input?.Body,
        },
        TableName: input?.TableName,
      });
      return response;
    } else
      return Response.error(403, {
        message: `Failed to create ${input?.ItemName}.`,
        error: `${input?.ItemName} "${input?.Body?.name}" already exists.`,
      });
  } catch (error) {
    console.error(error);
    return Response.error(500, {
      message: `Failed to create ${input?.ItemName}`,
      error: error.message,
    });
  }
};

/**
 * @description
 * @param {Object} input            - input object for item query
 * @param {string} input.ItemName   - name of the item to response messages
 * @param {string} input.Name       - name of the item to query
 * @param {string} input.BusinessId - business id of the item to query
 * @param {string} input.TableName  - table name to query item
 * @returns {Object}
 */
export const get_by_name = async (input) => {
  const response = await dynamoDB.getItemByName(input);
  return response;
};

/**
 * @description
 * @param {Object} input            - input object for item query
 * @param {string} input.ItemName   - name of the item to response messages
 * @param {string} input.Order      - parse ORDER String to a boolean value (ASC or DESC)
 * @param {string} input.BusinessId - business id of the item to query
 * @param {string} input.TableName  - table name to query item
 * @returns {Object}
 */
export const get_ordered = async (input) => {
  let Sorting = Order === "DESC" ? false : true;
  response = await dynamoDB.getItemOrderedByName({
    ...input,
    Sorting,
  });
  return response;
};

/**
 * @description
 * @param {Object} input
 * @param {string} input.ItemName
 * @param {string} input.Name
 * @param {string} input.BusinessId
 * @param {string} input.TableName
 * @returns {Object}
 */
export const validate_name = async (input) => {
  try {
    response = await get_by_name(input);
    let { result } = JSON.parse(response.body);

    // Check if result.Count contain a value, the name already exists
    if (result.Count == 0)
      return Response.success({
        status: true,
        message: `${input?.ItemName} name ${input?.Name} available.`,
      });
    else
      return Response.error(403, {
        status: false,
        message: `${input?.ItemName} ${input?.Name} already exists.`,
      });
  } catch (error) {
    console.log(error);
    return Response.error(500, {
      status: false,
      message: `Failed to validate ${input?.ItemName}.`,
      error: error.message,
    });
  }
};
