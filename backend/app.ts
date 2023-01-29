import { feathers } from "@feathersjs/feathers";
import swagger from "feathers-swagger";
import express from "@feathersjs/express";
import { EvaluationService } from "./services/evaluation.js";
import { CsvProviderService } from "./services/csvProvider.js";
import { json, rest } from "@feathersjs/express/lib";
import { notFound, errorHandler } from "@feathersjs/express";
import dotenv from 'dotenv';
import { handler } from '../build/handler.js';

dotenv.config();
const app = express(feathers());
app.use(json());
app.configure(rest());
app.configure(swagger({
  ui: swagger.swaggerUI({ docsPath: '/docs' }),
  specs: {
    info: {
      title: 'Political Speeches Api',
      description: 'Developed for Schwabeo GmbH by Daniel Kwoska',
      version: '1.0.0',
    },
    schemes: ['http']
  },
}))
app.use("/evaluation", new EvaluationService());
app.use("/csvprovider", new CsvProviderService());
app.use(handler);
// Return errors that include the URL
app.use(notFound({ verbose: true }));
app.use(errorHandler());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
