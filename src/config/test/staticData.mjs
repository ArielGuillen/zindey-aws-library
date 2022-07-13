export const optionsDynamoDBCreate = {
  ItemName: 'ITEM66',
  Item: {
    id: '93b366ce-783a-4898-9ece-ad6a113b43bc',
    businessId: '409e4e56-e74f-4f1e-8e0d-7df19449b11a',
    name: 'ITEM66',
    category: 'f53fa26a-b7fb-43bd-9f97-41c1594ec174',
    price: 100.32
  },
  TableName: 'zindey-suite-item-table',
}

export const paramsDynamoDBGetById = {
  Key: {
    id: '93b366ce-783a-4898-9ece-ad6a113b43bc',
  },
  TableName: 'zindey-suite-item-table',
}

export const optionsDynamoDBUpdate = {
  params:{
    Key: {
      id: '93b366ce-783a-4898-9ece-ad6a113b43bc',
    },
    TableName: 'zindey-suite-item-table',
  },
  newData:{
    name: 'ITEM67',
    price:24.22
  }
}

export const paramsDynamoDBDelete = {
  Key: {
    id: '93b366ce-783a-4898-9ece-ad6a113b43bc',
  },
  TableName: 'zindey-suite-item-table',
}

export const dynamoDBCreateExpected = {
  message: `${optionsDynamoDBCreate.ItemName} created successfully.`,
  item: optionsDynamoDBCreate.Item
}

export const dynamoDBUpdateExpected = {
  message: "Item updated successfully.",
  item: {
    name: 'ITEM67',
    price: 24.22
  }
}

export const dynamoDBGetByIdExpected = {
  id: '93b366ce-783a-4898-9ece-ad6a113b43bc',
  businessId: '409e4e56-e74f-4f1e-8e0d-7df19449b11a',
  name: 'ITEM66',
  category: 'f53fa26a-b7fb-43bd-9f97-41c1594ec174',
  price: 100.32,
}

export const dynamoDBDeleteExpected = {
  message: "Item deleted successfully."
}


const staticData = {
  optionsDynamoDBCreate,
  dynamoDBCreateExpected,
  paramsDynamoDBGetById,
  dynamoDBGetByIdExpected,
  optionsDynamoDBUpdate,
  dynamoDBUpdateExpected,
  paramsDynamoDBDelete,
  dynamoDBDeleteExpected,
}

export default staticData