export interface License {
  id: string;
  key: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DISABLED";
  maxDevices: number;
  activatedDevices: number;
  expiresAt: Date | null;
  createdAt: Date;
  macIds: string[];
  updatedAt: Date;
  lastActiveAt: Date | null;
  nowActiveDevices: number;
}
export interface LicenseSendData {
  licenseKey: string;
  macId: string;
}
