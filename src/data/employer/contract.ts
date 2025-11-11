/* eslint-disable @typescript-eslint/no-explicit-any */

import { TableFilterState } from "../../redux/store";

export type ContractFormProps = {
  contractNumber?: string;
  id?: string;
  employeeId?: string;
  isRemote?: boolean;
  contractFile?: string;
  name?: string;
  contractType: string;
  workingType: string;
  startDate: Date;
  endDate?: Date;
  status: ContractStatus;
};

export enum ContractStatus {
  PENDING = "Pending",
  ACTIVE = "Active",
  TERMINATED = "Terminated",
  EXPIRED = "Expired",
}

export type Contract = {
  contractNumber: string;
  id: string;
  employeeFullName: string;
  contractFile?: string;
  contractType: string;
  workingType: string;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
};

export type ContractsResponse = TableFilterState & {
  contracts: Contract[];
  count: number;
};

export type ContractResponse = {
  contract: Contract;
};
