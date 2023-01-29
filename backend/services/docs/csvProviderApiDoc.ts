export const csvProviderApiDoc = {
  "description": "A service to evaluate csv files with speeches",
  "operations": {
    "find": {
      "parameters": [{
          "description": "Name of the file that should be evaluated",
          "in": "query",
          "name": "fileName",
          "type": "string"
        },
        {
          "description": "Whether or not the result should be returned as a dictionary",
          "in": "query",
          "name": "returnDictionaries",
          "type": "boolean"
        }
      ]
    }
  }
};