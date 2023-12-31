import { Request, Response } from 'express';
import { isEmail } from '../../../basic_functions/check-email';
import {
	ErrorMsg,
    InvalidEmail,
    MissingEmail,
} from '../../../shared/errors';

export function validateForgotPwdBody(req: Request, res: Response, next: any) {
    const { email } = req.body;

    if (!email) {
        return res.status(200).json({
            message: ErrorMsg,
            error: MissingEmail,
        });
    }

    if (!isEmail(email)) {
        return res.status(200).json({ message: ErrorMsg, error: InvalidEmail });
    }

    next();
}