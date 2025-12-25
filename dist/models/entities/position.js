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
exports.Position = exports.PositionLevel = void 0;
const typeorm_1 = require("typeorm");
const employee_1 = require("./employee");
var PositionLevel;
(function (PositionLevel) {
    PositionLevel["INTERN"] = "INTERN";
    PositionLevel["JUNIOR"] = "JUNIOR";
    PositionLevel["INTERMEDIATE"] = "INTERMEDIATE";
    PositionLevel["SENIOR"] = "SENIOR";
    PositionLevel["LEAD"] = "LEAD";
    PositionLevel["PRINCIPAL"] = "PRINCIPAL";
    PositionLevel["MANAGER"] = "MANAGER";
    PositionLevel["SENIOR_MANAGER"] = "SENIOR_MANAGER";
    PositionLevel["DIRECTOR"] = "DIRECTOR";
    PositionLevel["SENIOR_DIRECTOR"] = "SENIOR_DIRECTOR";
    PositionLevel["VP"] = "VP";
    PositionLevel["SVP"] = "SVP";
    PositionLevel["C_LEVEL"] = "C_LEVEL";
})(PositionLevel || (exports.PositionLevel = PositionLevel = {}));
let Position = class Position {
    getSalaryRange() {
        if (this.minSalary && this.maxSalary) {
            return `${this.salaryCurrency} ${this.minSalary.toLocaleString()} - ${this.maxSalary.toLocaleString()}`;
        }
        return "Not specified";
    }
};
exports.Position = Position;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Position.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Position.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: PositionLevel,
        nullable: true,
    }),
    __metadata("design:type", String)
], Position.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_1.Employee, (employee) => employee.positionEntity),
    __metadata("design:type", Array)
], Position.prototype, "employees", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Position.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Position, (position) => position.subPositions, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    (0, typeorm_1.JoinColumn)({ name: "parentId" }),
    __metadata("design:type", Position)
], Position.prototype, "parentPosition", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Position, (position) => position.parentPosition),
    __metadata("design:type", Array)
], Position.prototype, "subPositions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Position.prototype, "minSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Position.prototype, "maxSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, default: "USD" }),
    __metadata("design:type", String)
], Position.prototype, "salaryCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Position.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "responsibilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Position.prototype, "headcount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Position.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Position.prototype, "updatedAt", void 0);
exports.Position = Position = __decorate([
    (0, typeorm_1.Entity)("positions")
], Position);
//# sourceMappingURL=position.js.map