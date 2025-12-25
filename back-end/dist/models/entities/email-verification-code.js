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
exports.EmailVerification = exports.VerificationType = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
var VerificationType;
(function (VerificationType) {
    VerificationType["EMAIL_VERIFICATION"] = "email_verification";
    VerificationType["PASSWORD_RESET"] = "password_reset";
    VerificationType["TWO_FACTOR"] = "two_factor";
})(VerificationType || (exports.VerificationType = VerificationType = {}));
let EmailVerification = class EmailVerification {
    isValid() {
        return !this.isUsed && this.expiresAt > new Date();
    }
    isExpired() {
        return this.expiresAt <= new Date();
    }
    canAttempt() {
        return this.attemptCount < 5;
    }
    incrementAttempt() {
        this.attemptCount += 1;
    }
    markAsUsed() {
        this.isUsed = true;
        this.usedAt = new Date();
    }
    getExpiryMinutes() {
        const now = new Date();
        const expiry = new Date(this.expiresAt);
        return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60)));
    }
    getDisplayType() {
        switch (this.verificationType) {
            case VerificationType.EMAIL_VERIFICATION:
                return "Email Verification";
            case VerificationType.PASSWORD_RESET:
                return "Password Reset";
            case VerificationType.TWO_FACTOR:
                return "Two-Factor Authentication";
            default:
                return "Verification";
        }
    }
};
exports.EmailVerification = EmailVerification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailVerification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EmailVerification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 6 }),
    __metadata("design:type", String)
], EmailVerification.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EmailVerification.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: VerificationType,
        default: VerificationType.EMAIL_VERIFICATION,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EmailVerification.prototype, "verificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], EmailVerification.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], EmailVerification.prototype, "isUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], EmailVerification.prototype, "attemptCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 45, nullable: true }),
    __metadata("design:type", String)
], EmailVerification.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], EmailVerification.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmailVerification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], EmailVerification.prototype, "usedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_1.User)
], EmailVerification.prototype, "user", void 0);
exports.EmailVerification = EmailVerification = __decorate([
    (0, typeorm_1.Entity)("email_verifications"),
    (0, typeorm_1.Check)(`"verificationType" IN ('email_verification', 'password_reset', 'two_factor')`),
    (0, typeorm_1.Check)(`"code" ~ '^[0-9]{6}$'`)
], EmailVerification);
//# sourceMappingURL=email-verification-code.js.map