"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entities = exports.NotificationType = exports.Notification = exports.Session = exports.Role = exports.User = void 0;
var user_1 = require("./entities/user");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_1.User; } });
var role_1 = require("./entities/role");
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return role_1.Role; } });
var session_1 = require("./entities/session");
Object.defineProperty(exports, "Session", { enumerable: true, get: function () { return session_1.Session; } });
var notification_1 = require("./entities/notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return notification_1.Notification; } });
Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function () { return notification_1.NotificationType; } });
const user_2 = require("./entities/user");
const role_2 = require("./entities/role");
const session_2 = require("./entities/session");
const notification_2 = require("./entities/notification");
exports.entities = [user_2.User, role_2.Role, session_2.Session, notification_2.Notification];
//# sourceMappingURL=index.js.map