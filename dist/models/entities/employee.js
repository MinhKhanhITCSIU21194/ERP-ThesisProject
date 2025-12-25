"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = exports.Gender = exports.MaritalStatus = exports.EmploymentStatus = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const position_1 = require("./position");
const employee_department_1 = require("./employee-department");
const contract_1 = require("./contract");
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["ACTIVE"] = "ACTIVE";
    EmploymentStatus["INACTIVE"] = "INACTIVE";
    EmploymentStatus["ON_LEAVE"] = "ON_LEAVE";
    EmploymentStatus["TERMINATED"] = "TERMINATED";
    EmploymentStatus["RESIGNED"] = "RESIGNED";
    EmploymentStatus["RETIRED"] = "RETIRED";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "SINGLE";
    MaritalStatus["MARRIED"] = "MARRIED";
    MaritalStatus["DIVORCED"] = "DIVORCED";
    MaritalStatus["WIDOWED"] = "WIDOWED";
    MaritalStatus["SEPARATED"] = "SEPARATED";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
    Gender["PREFER_NOT_TO_SAY"] = "PREFER_NOT_TO_SAY";
})(Gender || (exports.Gender = Gender = {}));
let Employee = class Employee {
    get fullName() {
        return this.middleName
            ? `${this.firstName} ${this.middleName} ${this.lastName}`
            : `${this.firstName} ${this.lastName}`;
    }
    get age() {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    get yearsOfService() {
        const today = new Date();
        const hire = new Date(this.hireDate);
        let years = today.getFullYear() - hire.getFullYear();
        const monthDiff = today.getMonth() - hire.getMonth();
        if (monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < hire.getDate())) {
            years--;
        }
        return years;
    }
    isActive() {
        return this.employmentStatus === EmploymentStatus.ACTIVE;
    }
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Employee.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_1.User)
], Employee.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Employee.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Employee.prototype, "employeeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "middleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Employee.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Gender,
        default: Gender.PREFER_NOT_TO_SAY,
    }),
    __metadata("design:type", String)
], Employee.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: MaritalStatus,
        default: MaritalStatus.SINGLE,
    }),
    __metadata("design:type", String)
], Employee.prototype, "maritalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "nationality", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Employee.prototype, "nationalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "passportNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Employee.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactRelationship", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "currentAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "permanentAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Employee.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "confirmationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Employee.prototype, "terminationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: EmploymentStatus,
        default: EmploymentStatus.ACTIVE,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Employee.prototype, "employmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_department_1.EmployeeDepartment, (employeeDepartment) => employeeDepartment.employee),
    __metadata("design:type", Array)
], Employee.prototype, "departments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => contract_1.Contract, (contract) => contract.employee),
    __metadata("design:type", Array)
], Employee.prototype, "contracts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Employee.prototype, "positionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => position_1.Position, (position) => position.employees, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    (0, typeorm_1.JoinColumn)({ name: "positionId" }),
    __metadata("design:type", position_1.Position)
], Employee.prototype, "positionEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "workLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Employee.prototype, "reportingManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 40 }),
    __metadata("design:type", Number)
], Employee.prototype, "weeklyWorkHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Employee.prototype, "salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, default: "USD" }),
    __metadata("design:type", String)
], Employee.prototype, "salaryCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "MONTHLY" }),
    __metadata("design:type", String)
], Employee.prototype, "salaryFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankAccountHolderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankBranchCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bloodGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "medicalConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "profilePicture", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "qualifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "deletedAt", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)("employees")
], Employee);
//# sourceMappingURL=employee.js.map