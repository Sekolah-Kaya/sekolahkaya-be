import { NextFunction, Request, Response } from "express";

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    // const authHeader = req.headers['authorization']

    next()
}