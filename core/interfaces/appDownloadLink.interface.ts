import { Status } from "./status.interface";

export interface AppDownloadLinkDirectus {
    id: number;
    status: Status;
    url: string;
    date_created?: string;
    date_updated?: string;
};
