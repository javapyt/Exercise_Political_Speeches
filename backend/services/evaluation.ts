import type { EvaluationResponse } from '../types/evaluation.js';
import { EventEmitter } from 'events';
import { SpeechProcessor } from '../utils/speechProcessor';
import type { Params } from '@feathersjs/feathers';
import { evaluationApiDoc } from './docs/evaluationApiDoc.js';
import { readdirSync } from 'fs';
import { Unprocessable } from '@feathersjs/errors';
const convertToUrls = (fileNames: string[]) => {
	return fileNames.map(
		(fileName) => `http://localhost:${process.env.PORT}/csvprovider?fileName=${fileName}`
	);
};

export class EvaluationService extends EventEmitter {
	docs = evaluationApiDoc;
	async find(
		params: Params & { query: { url: string | string[]; year: string; allFiles: string } } & {
			res: { status: (code: number) => void };
		}
	): Promise<EvaluationResponse | EvaluationResponse[]> {
		const { url } = params.query;
		const { year } = params.query;
		const allFiles = (params?.query?.allFiles ?? false) === 'true';
		const fileNames = readdirSync('backend/files');
		const urlToProcess = allFiles || !url ? convertToUrls(fileNames) : url;

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
						if (allFiles) {
							speechEvaluationResult.fileName = fileNames[i];
						}
						result.push(speechEvaluationResult);
					}
				}
			}
		} catch (err) {
			console.log(err);
			throw new Unprocessable('The url you provided did not contain a valid or well structured csv file')
		}
		return result;
	}
}
