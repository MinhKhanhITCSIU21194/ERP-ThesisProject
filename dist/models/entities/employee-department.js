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
exports.EmployeeDepartment = void 0;
const typeorm_1 = require("typeorm");
const employee_1 = require("./employee");
const department_1 = require("./department");
let EmployeeDepartment = class EmployeeDepartment {
    isCurrentlyActive() {
        const now = new Date();
        const isWithinDateRange = (!this.startDate || new Date(this.startDate) <= now) &&
            (!this.endDate || new Date(this.endDate) >= now);
        return this.isActive && isWithinDateRange;
    }
};
exports.EmployeeDepartment = EmployeeDepartment;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], EmployeeDepartment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EmployeeDepartment.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EmployeeDepartment.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, (employee) => employee.departments, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "employeeId", referencedColumnName: "employeeId" }),
    __metadata("design:type", employee_1.Employee)
], EmployeeDepartment.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_1.Department, (department) => department.employees, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "departmentId", referencedColumnName: "id" }),
    __metadata("design:type", department_1.Department)
], EmployeeDepartment.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], EmployeeDepartment.prototype, "isManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], EmployeeDepartment.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], EmployeeDepartment.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], EmployeeDepartment.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeDepartment.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], EmployeeDepartment.prototype, "responsibilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], EmployeeDepartment.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeDepartment.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeDepartment.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDepartment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDepartment.prototype, "updatedAt", void 0);
exports.EmployeeDepartment = EmployeeDepartment = __decorate([
    (0, typeorm_1.Entity)("employees_departments")
], EmployeeDepartment);
//# sourceMappingURL=employee-department.js.map