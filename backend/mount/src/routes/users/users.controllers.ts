import { Database } from "../../database/db"
import { Request, Response } from 'express';
import { Multer } from 'multer';
import { checkConnected } from "../auth/middlewares/check-connection.middleware";
import { deleteImg, dowloadImg, getListByTypeAndById, getMe, getUserById, imageUpload, setNewProfileImg, updateSettings, uploadImg, verifImgUser } from "./users.service";
import { validateSignUpBody } from "../auth/middlewares/signup.middleware";
import { validateSettings } from "./middlewares/check-settings.middleware";
import { ErrorMsg, PhotoNbLimit } from "../../shared/errors";
import { imageFileFilter } from "./middlewares/photo-middleware";
import { validateUserIdFormat } from "./middlewares/check-userId.midleware";
import { likeUser, reportUser, unlikeUser } from "./users.likes.service";
import { blockUser, unblockUser } from "./users.block.service";
import { getNbNotifs, getNotifs } from "./users.notifications.service";
import { validateGeoBody } from "./middlewares/check-geo.middleware";
import { geolocUser } from "./users.geoloc.service";
import { validateGeolocModifyBody } from "./middlewares/check-geo-modifu.middleware";

const express = require('express')
const router = express.Router();
const multer = require('multer');

//DB
const db = new Database;
db.connectDb();

//routes
router.get('/me', checkConnected, (req: Request, res: Response) => {
	return getMe(db, req, res);
})

router.get('/nbnotif', checkConnected, (req: Request, res: Response) => {
	return getNbNotifs(db, req, res);
})

router.get('/notif', checkConnected, (req: Request, res: Response) => {
	return getNotifs(db, req, res);
})

router.get('/:id', checkConnected, validateUserIdFormat, (req: Request, res: Response) => {
	return getUserById(db, req, res);
})

router.post('/updatesettings', checkConnected, validateSignUpBody, validateSettings, validateGeolocModifyBody, (req: Request, res: Response) => {
	return updateSettings(db, req, res);
})

router.post('/image', checkConnected, async (req: Request, res: Response) => { 
	const retour = await verifImgUser(db, req, res); 
	if (!retour)
		return res.status(200).json({ message: ErrorMsg, error: PhotoNbLimit });
	imageUpload.single('image')(req, res, (err: any) => {
		if (err) {
			return res.status(200).json({ message: ErrorMsg, error: err.message });
		}
		return uploadImg(db, req, res);
	  });
});

router.get('/like/:id', checkConnected, validateUserIdFormat, (req: Request, res: Response) => {
	return likeUser(db, req, res); 
});

router.get('/unlike/:id', checkConnected, validateUserIdFormat, (req: Request, res: Response) => {
	return unlikeUser(db, req, res); 
});

router.get('/block/:id', checkConnected, validateUserIdFormat, (req: Request, res: Response) => {
	return blockUser(db, req, res); 
});

router.get('/unblock/:id', checkConnected, validateUserIdFormat, (req: Request, res: Response) => {
	return unblockUser(db, req, res); 
});

router.get('/report/:id', checkConnected, validateUserIdFormat, (req: Request, res: Response) => {
	return reportUser(db, req, res); 
});

router.get('/image/:filename', checkConnected, imageFileFilter, (req: Request, res: Response) => {
	return dowloadImg(db, req, res); 
});

router.get('/setimage/:filename', checkConnected, imageFileFilter, (req: Request, res: Response) => {
	return setNewProfileImg(db, req, res); 
});

router.delete('/image/:filename', checkConnected, imageFileFilter, (req: Request, res: Response) => {
	return deleteImg(db, req, res); 
});

router.post('/geoloc', checkConnected, validateGeoBody, (req: Request, res: Response) => {
	return geolocUser(db, req, res);
})

//check viewed/viewed_by/likes/liked_by
router.get('/:option/:id',  validateUserIdFormat, (req: Request, res: Response) => {
	return getListByTypeAndById(db, req, res);
})

module.exports = router
