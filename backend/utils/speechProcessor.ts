import errors from "@feathersjs/errors";
import axios from "axios";
import * as CSV from "csv-string";
import type { EvaluationResponse } from "../types/evaluation.js";

const getCsvDataFromUrl = async (
  url: string,
  throwError: boolean
): Promise<string[][]> => {
  try {
    const data = (await axios.get(url, { responseType: "json" })).data.data as number[];
    const bytesString = String.fromCharCode(...data);
    const arr = CSV.parse(bytesString);
    if (arr[0].length !== 4){
      if(throwError){
        throw new errors.BadRequest("The length of the provided csv file does not match the specifications");
      }
      return [] as string[][]; // should not process any data if the format is incorrect
    } 

    return arr;
  } catch (err) {
    if (throwError)
      throw new errors.BadRequest(
        "The provided URL is not a valid CSV file or the structure does not match the specifications"
      );
    return [] as string[][];
  }
};

export class SpeechProcessor {
  url: string;
  throwError: boolean;
  speeches: string[][] = [];
  year: string | number;

  constructor(
    url: string,
    throwError: boolean,
    year: string | number
  ) {
    this.url = url;
    this.throwError = throwError;
    this.year = year;
  }

  async loadSpeeches(url: string, throwError: boolean) {
    this.speeches = await getCsvDataFromUrl(url, throwError);
    this.speeches.shift(); // remove header
  }

  getSpeakerWithMostSpeechesInYear(
    speeches: string[][],
    year: string | number
  ) {
    const speechesBySpeaker = speeches.reduce((acc, speech) => {
      const speaker = speech[0];
      if (!acc[speaker]) acc[speaker] = 0;
      if (speech[2].includes(year.toString())) acc[speaker]++;
      return acc;
    }, {} as Record<string, number>);

    const speakerWithMostSpeeches = Object.entries(speechesBySpeaker).reduce(
      (acc, [speaker, speechCount]) => {
        if (speechCount == acc.speechCount) {
          acc = { speaker: null, speechCount };
        }
        if (speechCount > acc.speechCount) acc = { speaker, speechCount };
        return acc;
      },
      { speaker: null as string | null, speechCount: 0 }
    );

    return speakerWithMostSpeeches.speaker;
  }

  getSpeakerWithMostSecurityMentions(speeches: string[][]) {
    const speechesBySpeaker = speeches.reduce((acc, speech) => {
      const speaker = speech[0];
      if (!acc[speaker]) acc[speaker] = 0;
      if (speech[1].includes("Internal Security")) acc[speaker]++;
      return acc;
    }, {} as Record<string, number>);

    const speakerWithMostSecurityMentions = Object.entries(
      speechesBySpeaker
    ).reduce(
      (acc, [speaker, speechCount]) => {
        if (speechCount == acc.speechCount) {
          acc = { speaker: null, speechCount };
        }
        if (speechCount > acc.speechCount) {
          acc = { speaker, speechCount };
        }
        return acc;
      },
      { speaker: null as string | null, speechCount: 0 }
    );

    return speakerWithMostSecurityMentions.speaker;
  }

  getSpeakerWithLeastWords(speeches: string[][]) {
    const speechesBySpeaker = speeches.reduce((acc, speech) => {
      const speaker = speech[0];
      if (!acc[speaker]) acc[speaker] = 0;
      acc[speaker] += Number(speech[3]);
      return acc;
    }, {} as Record<string, number>);

    const speakerWithLeastWords = Object.entries(speechesBySpeaker).reduce(
      (acc, [speaker, speechCount]) => {
        if (speechCount == acc.speechCount) {
          acc = { speaker: null, speechCount };
        }
        if (speechCount < acc.speechCount) acc = { speaker, speechCount };
        return acc;
      },
      { speaker: null as string | null, speechCount: Number.MAX_SAFE_INTEGER }
    );

    return speakerWithLeastWords.speaker;
  }

  async getEvaluationResult() {
    await this.loadSpeeches(this.url, this.throwError);
    const result: EvaluationResponse = {
      mostSpeeches: this.getSpeakerWithMostSpeechesInYear(
        this.speeches,
        this.year
      ),
      mostSecurity: this.getSpeakerWithMostSecurityMentions(this.speeches),
      leastWordy: this.getSpeakerWithLeastWords(this.speeches),
    };
    return result;
  }
}
