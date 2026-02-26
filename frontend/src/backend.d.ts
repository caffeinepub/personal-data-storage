import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface FileMetadata {
    id: string;
    name: string;
    size: bigint;
    mimeType: string;
    uploadedAt: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cleanUp(): Promise<void>;
    getAllFiles(): Promise<Array<FileMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFileMetadata(id: string): Promise<FileMetadata>;
    getPerUserQuota(_user: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listUserFiles(user: Principal): Promise<Array<FileMetadata>>;
    removeFileReference(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveFileReference(id: string, blob: ExternalBlob, name: string, size: bigint, mimeType: string): Promise<void>;
}
