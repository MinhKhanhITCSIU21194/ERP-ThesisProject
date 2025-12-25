import { Request, Response } from "express";
export declare class PositionController {
    getAllPositions(req: Request, res: Response): Promise<void>;
    getPositionHierarchy(req: Request, res: Response): Promise<void>;
    getPositionsByLevel(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPositionsBySalaryRange(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPositionById(req: Request, res: Response): Promise<void>;
    getPositionEmployees(req: Request, res: Response): Promise<void>;
    getPositionStats(req: Request, res: Response): Promise<void>;
    createPosition(req: Request, res: Response): Promise<void>;
    updatePosition(req: Request, res: Response): Promise<void>;
    deletePosition(req: Request, res: Response): Promise<void>;
    hardDeletePosition(req: Request, res: Response): Promise<void>;
    updateAllHeadcounts(req: Request, res: Response): Promise<void>;
}
declare const _default: PositionController;
export default _default;
//# sourceMappingURL=position.controller.d.ts.map