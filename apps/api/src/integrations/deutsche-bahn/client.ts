import axios, { AxiosInstance } from "axios";
import { XMLParser } from "fast-xml-parser";

import { env } from "../../config/env";
import {
  MultipleStationData,
  Timetable,
} from "./types";

export class DeutscheBahnClient {
  private readonly client: AxiosInstance;
  private readonly parser: XMLParser;

  constructor() {
    this.client = axios.create({
      baseURL: env.dbApiBaseUrl,
      timeout: 10000,
      headers: {
        "DB-Client-Id": env.dbClientId,
        "DB-Api-Key": env.dbApiKey,
        Accept: "application/xml",
      },
    });

    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: true,
      trimValues: true,
    });
  }

  private parseXml<T>(xml: string): T {
    return this.parser.parse(xml) as T;
  }

  async searchStations(pattern: string): Promise<MultipleStationData> {
    const response = await this.client.get(`/station/${pattern}`, {
      responseType: "text",
    });

    return this.parseXml<MultipleStationData>(response.data);
  }

  async getPlan(
    evaNo: string,
    date: string,
    hour: string
  ): Promise<Timetable> {
    const response = await this.client.get(
      `/plan/${evaNo}/${date}/${hour}`,
      {
        responseType: "text",
      }
    );

    return this.parseXml<Timetable>(response.data);
  }

  async getFullChanges(evaNo: string): Promise<Timetable> {
    const response = await this.client.get(`/fchg/${evaNo}`, {
      responseType: "text",
    });

    return this.parseXml<Timetable>(response.data);
  }

  async getRecentChanges(evaNo: string): Promise<Timetable> {
    const response = await this.client.get(`/rchg/${evaNo}`, {
      responseType: "text",
    });

    return this.parseXml<Timetable>(response.data);
  }
}

export const deutscheBahnClient = new DeutscheBahnClient();