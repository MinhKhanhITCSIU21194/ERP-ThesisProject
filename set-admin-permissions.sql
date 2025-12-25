-- Set all permission flags to true for Admin role
-- This script updates all existing role_permissions records for the Admin role

UPDATE role_permissions
SET 
    "canView" = true,
    "canRead" = true,
    "canCreate" = true,
    "canUpdate" = true,
    "canDelete" = true,
    "canPermanentlyDelete" = true,
    "canSetPermission" = true,
    "canImport" = true,
    "canExport" = true,
    "canSubmit" = true,
    "canCancel" = true,
    "canApprove" = true,
    "canReject" = true,
    "canAssign" = true,
    "canViewSalary" = true,
    "canEditSalary" = true,
    "canViewBenefit" = true,
    "canReport" = true,
    "canViewPartial" = true,
    "canViewBelongTo" = true,
    "canViewOwner" = true,
    "updatedAt" = NOW()
WHERE "roleId" = (SELECT id FROM roles WHERE name = 'Admin');

-- Verify the update
SELECT 
    r.name as role_name,
    p.name as permission_name,
    rp."canView",
    rp."canRead",
    rp."canCreate",
    rp."canUpdate",
    rp."canDelete",
    rp."canPermanentlyDelete",
    rp."canSetPermission",
    rp."canImport",
    rp."canExport",
    rp."canSubmit",
    rp."canCancel",
    rp."canApprove",
    rp."canReject",
    rp."canAssign",
    rp."canViewSalary",
    rp."canEditSalary",
    rp."canViewBenefit",
    rp."canReport",
    rp."canViewPartial",
    rp."canViewBelongTo",
    rp."canViewOwner"
FROM role_permissions rp
JOIN roles r ON rp."roleId" = r.id
JOIN permissions p ON rp."permissionId" = p.id
WHERE r.name = 'Admin'
ORDER BY p.name;
