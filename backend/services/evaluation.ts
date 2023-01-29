import type { EvaluationResponse } from '../types/evaluation.js';
import { EventEmitter } from 'events';
import { SpeechProcessor } from '../utils/speechProcessor';
import type { Params } from '@feathersjs/feathers';
import { evaluationApiDoc } from './docs/evaluationApiDoc.js';
import fs from "fs";

const convertToUrls = (fileNames: string[]) => {
  return fileNames.map((fileName) => `http://localhost:${process.env.PORT}/csvprovider?fileName=${fileName}`);
}

export class EvaluationService extends EventEmitter {
	docs = evaluationApiDoc;
	async find(
		params: Params & { query: { url: string | string[]; year: string; allFiles: string; } } & {
			res: { status: (code: number) => void };
		}
	): Promise<EvaluationResponse | EvaluationResponse[]> {
		const { url } = params.query;
		const { year } = params.query;
    const allFiles = (params?.query?.allFiles ?? false) === "true";
    const fileNames = fs.readdirSync("backend/files"); 
    const urlToProcess = allFiles || !url ? convertToUrls(fileNames) : url;
    console.log(urlToProcess)

		let result: EvaluationResponse | EvaluationResponse[] = {
			mostSpeeches: null,
			mostSecurity: null,
			leastWordy: null
		};

    try {
		if (urlToProcess) {
			if (typeof urlToProcess === 'string') {
				const speechProcessor = new SpeechProcessor(urlToProcess, true, year ?? '2013');
				result = await speechProcessor.getEvaluationResult();
			} else if (Array.isArray(urlToProcess)) {
				result = [];
				for (let i = 0; i < urlToProcess.length; i++) {
					const speechProcessor = new SpeechProcessor(urlToProcess[i], false, year ?? '2013');
					const speechEvaluationResult = await speechProcessor.getEvaluationResult();
          if(allFiles) {
            speechEvaluationResult.fileName = fileNames[i];
          }
          result.push(speechEvaluationResult);
				}
			}
		}
  } catch (err) {
   console.log(err)
  }
		return result;
	}
}
