"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPermission = exports.initPermission = void 0;
exports.initPermission = {
    permission: "",
    canView: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canSetPermission: false,
    canSubmit: false,
    canApprove: false,
    canAssign: false,
    canViewSalary: false,
    canEditSalary: false,
    canCancel: false,
    canExport: false,
    canImport: false,
    canReject: false,
    canReport: false,
    canViewBenefit: false,
    canViewBelongTo: false,
    canViewOwner: false,
    canViewPartial: false,
    canPermanentlyDelete: false,
};
var UserPermission;
(function (UserPermission) {
    UserPermission["USER_MANAGEMENT"] = "USER_MANAGEMENT";
    UserPermission["ROLE_MANAGEMENT"] = "ROLE_MANAGEMENT";
    UserPermission["EMPLOYEE_MANAGEMENT"] = "EMPLOYEE_MANAGEMENT";
    UserPermission["CONTRACT_MANAGEMENT"] = "CONTRACT_MANAGEMENT";
    UserPermission["POSITION_MANAGEMENT"] = "POSITION_MANAGEMENT";
    UserPermission["DEPARTMENT_MANAGEMENT"] = "DEPARTMENT_MANAGEMENT";
    UserPermission["EDUCATION_MANAGEMENT"] = "EDUCATION_MANAGEMENT";
    UserPermission["DEGREE_MANAGEMENT"] = "DEGREE_MANAGEMENT";
    UserPermission["SKILL_TYPE_MANAGEMENT"] = "SKILL_TYPE_MANAGEMENT";
    UserPermission["SKILL_MANAGEMENT"] = "SKILL_MANAGEMENT";
    UserPermission["LEAVE_MANAGEMENT"] = "LEAVE_MANAGEMENT";
    UserPermission["LEAVE_TYPE_MANAGEMENT"] = "LEAVE_TYPE_MANAGEMENT";
    UserPermission["ANNUAL_LEAVE_MANAGEMENT"] = "ANNUAL_LEAVE_MANAGEMENT";
    UserPermission["HOLIDAY_MANAGEMENT"] = "HOLIDAY_MANAGEMENT";
    UserPermission["TIME_SHEET_MANAGEMENT"] = "TIME_SHEET_MANAGEMENT";
    UserPermission["GROUP_NOTIFICATION_MANAGEMENT"] = "GROUP_NOTIFICATION_MANAGEMENT";
    UserPermission["MARKET_MANAGEMENT"] = "MARKET_MANAGEMENT";
    UserPermission["PROJECT_MANAGEMENT"] = "PROJECT_MANAGEMENT";
})(UserPermission || (exports.UserPermission = UserPermission = {}));
//# sourceMappingURL=role.types.js.map