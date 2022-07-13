import dynamoDB from '../dynamoDB.mjs'
import staticData from '../config/test/staticData.mjs'

describe("DynamoDB queries", () => {
  test("Create item", async () => {
    let result = await dynamoDB.createItem(staticData.optionsDynamoDBCreate)
    result = JSON.parse(result.body)
    expect(result).toMatchObject(staticData.dynamoDBCreateExpected)
  })
  test("Get item by id", async () => {
    let result = await dynamoDB.getItemById(staticData.paramsDynamoDBGetById)
    result = JSON.parse(result.body)
    expect(result).toMatchObject(staticData.dynamoDBGetByIdExpected)
  })
  test("Update item", async () => {
    let result = await dynamoDB.updateItem(staticData.optionsDynamoDBUpdate)
    result = JSON.parse(result.body)
    expect(result).toMatchObject(staticData.dynamoDBUpdateExpected)
  })
  test("Delete item by id", async () => {
    let result = await dynamoDB.deleteItemById(staticData.paramsDynamoDBDelete)
    result = JSON.parse(result.body)
    expect(result).toMatchObject(staticData.dynamoDBDeleteExpected)
  })
})