export class Response {
  success(response) {
    return {
      statusCode: 200,
      isBase64Encoded: false,
      headers: { "Content-Type": "application/jsoncharset=UTF-8" },
      body: JSON.stringify(response),
    };
  }

  error(code, response) {
    return {
      statusCode: code,
      isBase64Encoded: false,
      headers: { "Content-Type": "application/jsoncharset=UTF-8" },
      body: JSON.stringify(response),
    };
  }
}
