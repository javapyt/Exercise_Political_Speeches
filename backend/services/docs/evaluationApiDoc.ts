export const evaluationApiDoc = {
  "description": "A service to evaluate csv files with speeches",
  "operations": {
    "find": {
      "parameters": [
        {
          "description": "Url to the csv file that should be evaluated",
          "in": "query",
          "name": "url",
          "type": "array",
          "items": {
            "type": "string"
          },
          "collectionFormat": "multi"
        },
        {
          "description": "Year that should be evaluated in question 1: who gave the most speeches in the given year",
          "in": "query",
          "name": "year",
          "type": "string"
        },
        {
          "description": "Whether all files that are located in Backend files directory should be evaluated instead of urls",
          "in": "query",
          "name": "allFiles",
          "type": "boolean"
        }
      ]
    }
  },
};