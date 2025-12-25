//----------------Employee Skill -------------------------//
export type EmployeeSkillResponse = {
  skills: EmployeeSkill[];
  pageSize: number;
  pageIndex: number;
  count: number;
};

export type EmployeeSkill = {
  id?: string;
  isMainSkill: boolean;
  skillLevel: EmployeeSkillLevel;
};

export type EmployeeSkillRequest = {
  id?: string;
  employeeId: string;
  skillLevelId: string;
  isMainSkill: boolean;
};

export type EmployeeSkillLevel = {
  id?: string;
  orderNumber: string;
  level: string;
  skillType: EmployeeSkillType;
};

export type EmployeeSkillType = {
  id?: string;
  orderNumber: string;
  name: string;
  parentId?: string;
  skillName: string;
};
//------------------------Skill Type------------------------//

export type SkillTypesResponse = {
  pageSize: number;
  pageIndex: number;
  count: number;
  skillTypes: SkillType[];
};

export type SkillType = {
  id?: string;
  orderNumber: number;
  name: string;
  parentId: string | null;
  skillName: string | null;
  skillNames: SkillType[];
  levels?: SkillLevel[];
};

export type SkillLevel = {
  id?: string;
  orderNumber: number;
  level: string;
};
