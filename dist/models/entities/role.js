"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const typeorm_1 = require("typeorm");
let Role = class Role {
  hasPermission(resource, action) {
    if (this.permissions.all === true) {
      return true;
    }
    return (
      this.permissions[resource] && this.permissions[resource][action] === true
    );
  }
  canManage(resource) {
    return (
      this.hasPermission(resource, "create") &&
      this.hasPermission(resource, "read") &&
      this.hasPermission(resource, "update") &&
      this.hasPermission(resource, "delete")
    );
  }
};
exports.Role = Role;
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)(), __metadata("design:type", Number)],
  Role.prototype,
  "roleId",
  void 0
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: "varchar", length: 50, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String),
  ],
  Role.prototype,
  "name",
  void 0
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: "jsonb", default: {} }),
    __metadata("design:type", Object),
  ],
  Role.prototype,
  "permissions",
  void 0
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String),
  ],
  Role.prototype,
  "description",
  void 0
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean),
  ],
  Role.prototype,
  "isActive",
  void 0
);
__decorate(
  [(0, typeorm_1.CreateDateColumn)(), __metadata("design:type", Date)],
  Role.prototype,
  "createdAt",
  void 0
);
__decorate(
  [(0, typeorm_1.UpdateDateColumn)(), __metadata("design:type", Date)],
  Role.prototype,
  "updatedAt",
  void 0
);
__decorate(
  [(0, typeorm_1.OneToMany)("User", "role"), __metadata("design:type", Array)],
  Role.prototype,
  "users",
  void 0
);
exports.Role = Role = __decorate([(0, typeorm_1.Entity)("roles")], Role);
//# sourceMappingURL=role.js.map
