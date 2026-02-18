import { Status } from "./status.interface";

export interface AppDownloadLinkDirectus {
    id: number;
    status: Status;
    apk: string;
    date_created?: string;
    date_updated?: string;
};
