import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { EmployeeService } from "../services/employee.service";
import { AuthService } from "../services/auth.service";

export class EmployeeSetupController {
  private employeeService: EmployeeService;
  private authService: AuthService;

  constructor() {
    this.employeeService = new EmployeeService();
    this.authService = new AuthService();
  }

  /**
   * Validate setup token
   * GET /api/employee-setup/validate/:token
   */
  validateSetupToken = async (req: AuthRequest, res: Response) => {
    try {
      const { token } = req.params;

      const validation = await this.employeeService.validateSetupToken(token);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      // Return employee info (without sensitive data)
      res.status(200).json({
        success: true,
        data: {
          employeeId: validation.employee?.employeeId,
          firstName: validation.employee?.firstName,
          lastName: validation.employee?.lastName,
          email: validation.employee?.email,
          employeeCode: validation.employee?.employeeCode,
        },
      });
    } catch (error: any) {
      console.error("Error validating setup token:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate token",
        error: error.message,
      });
    }
  };

  /**
   * Set password for new employee
   * POST /api/employee-setup/set-password
   * Body: { token, password }
   */
  setPassword = async (req: AuthRequest, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Token and password are required",
        });
      }

      // Validate token first
      const validation = await this.employeeService.validateSetupToken(token);
      if (!validation.valid || !validation.employee) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      // Set password and get auth tokens
      const result = await this.authService.setEmployeePassword(
        validation.employee.email,
        password,
        {
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip,
        }
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: "Password set successfully",
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (error: any) {
      console.error("Error setting password:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set password",
        error: error.message,
      });
    }
  };

  /**
   * Complete employee setup - update general information
   * PUT /api/employee-setup/complete
   * Requires authentication (user must have set password first)
   * Body: { token, ...employeeData }
   */
  completeSetup = async (req: AuthRequest, res: Response) => {
    try {
      const { token, ...employeeData } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Setup token is required",
        });
      }

      // Verify user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Complete setup
      const employee = await this.employeeService.completeEmployeeSetup(
        token,
        employeeData
      );

      res.status(200).json({
        success: true,
        message: "Setup completed successfully",
        data: employee,
      });
    } catch (error: any) {
      console.error("Error completing setup:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to complete setup",
      });
    }
  };
}
