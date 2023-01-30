import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import type { Params } from '@feathersjs/feathers';
import { NotFound } from '@feathersjs/errors';
import { Blob } from 'buffer';
import { readdirSync } from 'fs';
import { csvProviderApiDoc } from './docs/csvProviderApiDoc';
export class CsvProviderService extends EventEmitter {
	docs = csvProviderApiDoc;
	async find(params: Params) {
		const fileName = params?.query?.fileName ?? undefined;
		const returnDictionaries = (params?.query?.returnDictionaries ?? false) === 'true';

		const fileNames = fileName === undefined ? readdirSync('backend/files') : [fileName];

		try {
			const data = fileNames.map(async (fileName) => {
				const fileData = readFileSync(`backend/files/${fileName}`, {
					encoding: 'utf8'
				});
				const blob = new Blob([fileData], { type: 'text/csv;charset=utf-8;' });
				const result = Buffer.from(await blob.arrayBuffer());
				return returnDictionaries === true ? { [fileName]: result } : result;
			});
			const dataResolved = await Promise.all(data);
			return dataResolved.length === 1 ? dataResolved[0] : dataResolved;
		} catch (err) {
			const error = err as { code: string };
			console.log(err);
			if (error?.code === 'ENOENT') throw new NotFound('File not found');
			else throw new Error('Something went wrong');
		}
	}
}
