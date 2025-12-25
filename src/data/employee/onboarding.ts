import { User, UserStatus } from "../auth/auth";
import { Contract } from "../employer/contract";
import { Department } from "../employer/department";
import { Position } from "../employer/position";

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

export const genders = Object.values(Gender);

export enum MaritalStatus {
  Single = "Single",
  Marriage = "Marriage",
  Divorce = "Divorce",
  Widow = "Widow",
}

export const maritalStatus = Object.values(MaritalStatus);

export type GeneralInfo = {
  fullName: string;
  photo:
    | {
        file: any;
        fileURL: string;
      }
    | string;
  email: string;
  departmentIds: string[];
  recommendedRoleIds: string[];
  positionId: string;
  levelId: string;
  departments?: Department[];
  position?: Position;
  contracts?: Contract[];
  user?: User;
  status: UserStatus;
};

export type DetailInfo = {
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  personalEmail: string;
  phoneNumber: string;
  contactAddress: string;
  permanentAddress: string;
};

export type GovernmentInfo = {
  vneIDNo: string;
  vneIDDate: string;
  vneIDPlace: string;
  vneIDCardBack:
    | {
        file: any;
        fileURL: string;
      }
    | string;
  vneIDCardFront:
    | {
        file: any;
        fileURL: string;
      }
    | string;
  pitNo: string;
  siNo: string;
};

export type BankInfo = {
  bankName: string;
  bankBranch: string;
  bankAccountName: string;
  bankAccountNumber: string;
};

export type EmergencyContact = {
  ecRelationship: string;
  ecName: string;
  ecPhoneNumber: string;
};

export type OthersInfo = {
  fingerprintId: string;
  payslipPassword: string;
  resignDate: string;
  joinDate: string;
  leaveDate: string;
  resignReason: string;
};

export type SalaryInfo = {
  basicSalary: number | string;
  responsibilityAllowance: number | string;
  petrolAllowance: number | string;
  phoneAllowance: number | string;
  lunchAllowance: number | string;
  seniorityBonus: number | string;
  performanceBonus: number | string;
  overtimeIncome: number | string;
  otherBonus: number | string;
  otherIncome: number | string;
  socialInsurance: number | string;
  personalIncomeTax: number | string;
  othersDeduction: number | string;
  netAmount: number | string;
};

export type BenefitInfo = {
  healthCare: number | string;
  healthCheck: number | string;
  parkingFee: number | string;
  birthdayGift: number | string;
  teamFund: number | string;
  midAutumnGift: number | string;
  tetGift: number | string;
  YEP: number | string;
  companyTrip: number | string;
};

export const initBenefit: BenefitInfo = {
  healthCare: 0,
  healthCheck: 0,
  teamFund: 0,
  parkingFee: 0,
  birthdayGift: 0,
  midAutumnGift: 0,
  tetGift: 0,
  YEP: 0,
  companyTrip: 0,
};
export type EmployeeChangeRequest = DetailInfo &
  GovernmentInfo &
  BankInfo &
  EmergencyContact &
  OthersInfo & {
    id?: string;
  };
export type EmployeeChangeResponse = {
  changedInformation: EmployeeChangeResponse;
};

export type OnboardingEmployee = GeneralInfo &
  EmployeeChangeRequest &
  SalaryInfo &
  BenefitInfo & {
    changedInformation: EmployeeChangeRequest;
  };

export type OnboardingResponse = {
  employee: OnboardingEmployee;
};

export type EmployeeCreateRequest = {
  fullName: string;
  email: string;
  photo: string;
  positionId: string;
  departmentIds: string[];
  recommendedRoleIds: string[];
};
