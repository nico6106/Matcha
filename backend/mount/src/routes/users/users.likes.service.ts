import { TableUser, TableUsersName } from "../../database/data";
import { Database } from "../../database/db";
import { Request, Response } from "express";
import { getUserFromRequest } from "../auth/auth.service";
import { CannotLikeOtherPhotoEmpty, CannotLikeYourPhotoEmpty, ErrorMsg, NotConnected, ProfileAlreadyLiked, ProfileNotLiked, SuccessMsg, UnknownUsername } from "../../shared/errors";
import { UserLinkFromDB, addElemToJSONData } from "./users.service";
import { computeFame } from "./users.fame.service";
import { handleNotificationCreation } from "./users.notifications.service";
import { createChatUsers } from "../chat/chat.service";

export async function likeUser(db: Database, req: Request, res: Response) {
	const { id } = req.params;
	const idNb = parseInt(id);
	const meUser: TableUser | null = await getUserFromRequest(db, req);
	const now = Date.now();
	if (!meUser)
		return res.status(200).json({ message: ErrorMsg, error: NotConnected });

	const users: TableUser[] | null = await db.selectOneElemFromTable(
        TableUsersName,
        'id',
        idNb,
    );
    if (!(users && users.length === 1)) 
		return res.status(200).json({ message: ErrorMsg, error: UnknownUsername });

	if (meUser.id !== users[0].id) {
		// console.log(meUser.id+' likes '+users[0].id);
		if (checkAlreadyLiked(meUser.likes, users[0].id))
			return res.status(200).json({ message: ErrorMsg, error: ProfileAlreadyLiked });

		if (users[0].pictures.length === 0)
			return res.status(200).json({ message: ErrorMsg, error: CannotLikeOtherPhotoEmpty });
		if (meUser.pictures.length === 0)
			return res.status(200).json({ message: ErrorMsg, error: CannotLikeYourPhotoEmpty });

		await addElemToJSONData(db, meUser.likes, {id: users[0].id, date: now}, meUser.id, 'likes');
		await addElemToJSONData(db, users[0].liked_by, {id: meUser.id, date: now}, users[0].id, 'liked_by');

		//compute fame evol
		await computeFame(db, 'liked', users[0]);

		//check match
		if (users[0].likes.findIndex((elem) => elem.id === meUser.id) !== -1) {
			if (!meUser.matches.includes(users[0].id)) 
				await db.AmendElemsFromTable(TableUsersName, 'id', meUser.id, ['matches'], [[...meUser.matches, users[0].id]]);
			if (!users[0].matches.includes(meUser.id))
				await db.AmendElemsFromTable(TableUsersName, 'id', users[0].id, ['matches'], [[...users[0].matches, meUser.id]]);

			//handle notif in case it's a match
			await handleNotificationCreation(db, res, 'match', users[0], meUser.id);

			//create chat between 2 users:
			await createChatUsers(db, meUser.id, users[0].id);
		}
		else
			//handle notif in case only a like
			await handleNotificationCreation(db, res, 'like', users[0], meUser.id);
	}
	return res.status(200).json({ message: SuccessMsg });
}

export function checkAlreadyLiked(data: UserLinkFromDB[], userId: number): boolean {
	if (data.length === 0)
		return false;
	for (let i = 0; i < data.length; i++) {
		if (data[i].id === userId) 
			return true;
	}
	return false;
}

export async function unlikeUser(db: Database, req: Request, res: Response) {
	const { id } = req.params;
	const idNb = parseInt(id);
	const meUser: TableUser | null = await getUserFromRequest(db, req);
	const now = Date.now();
	if (!meUser)
		return res.status(200).json({ message: ErrorMsg, error: NotConnected });

	const users: TableUser[] | null = await db.selectOneElemFromTable(
        TableUsersName,
        'id',
        idNb,
    );
    if (!(users && users.length === 1)) 
		return res.status(200).json({ message: ErrorMsg, error: UnknownUsername });

	if (meUser.id !== users[0].id) {
		// console.log(meUser.id+' unlikes '+users[0].id);

		if (checkAlreadyLiked(meUser.likes, users[0].id) === false)
			return res.status(200).json({ message: ErrorMsg, error: ProfileNotLiked });

		await deleteElemToJSONData(db, meUser.likes, users[0].id, meUser.id, 'likes');
		await deleteElemToJSONData(db, users[0].liked_by, meUser.id, users[0].id, 'liked_by');

		//compute fame evol
		await computeFame(db, 'unliked', users[0]);

		//handle unmatch
		if (meUser.matches.includes(users[0].id)) {
			const newListMacthesMe: number[] = meUser.matches.filter((elem) => elem !== users[0].id);
			await db.AmendElemsFromTable(TableUsersName, 'id', meUser.id, ['matches'], [newListMacthesMe]);

			//handle notif in case only a like
			await handleNotificationCreation(db, res, 'unlike', users[0], meUser.id);
		}
		if (users[0].matches.includes(meUser.id)) {
			const newListMacthesHim: number[] = users[0].matches.filter((elem) => elem !== meUser.id);
			await db.AmendElemsFromTable(TableUsersName, 'id', users[0].id, ['matches'], [newListMacthesHim]);
		}
	}
	return res.status(200).json({ message: SuccessMsg });
}

export async function deleteElemToJSONData(db: Database, data: UserLinkFromDB[], userToDelete: number, userId: number, field: string) {
	const newViewed: UserLinkFromDB[] = data.filter((elem) => elem.id !== userToDelete);
	const newViewedJson = JSON.stringify(newViewed)
	await db.AmendElemsFromTable(
		TableUsersName,
		'id',
		userId,
		[field],
		[newViewedJson],
	);
}

export async function reportUser(db: Database, req: Request, res: Response) {
	const { id } = req.params;
	const idNb = parseInt(id);
	const meUser: TableUser | null = await getUserFromRequest(db, req);
	const now = Date.now();
	if (!meUser)
		return res.status(200).json({ message: ErrorMsg, error: NotConnected });

	const users: TableUser[] | null = await db.selectOneElemFromTable(
        TableUsersName,
        'id',
        idNb,
    );
    if (!(users && users.length === 1)) 
		return res.status(200).json({ message: ErrorMsg, error: UnknownUsername });

	if (meUser.id !== users[0].id) {
		// console.log(meUser.id+' report user '+users[0].id);
		if (checkAlreadyLiked(users[0].fake_account, meUser.id))
			return res.status(200).json({ message: ErrorMsg, error: 'profile already reported' });
		
		await addElemToJSONData(db, users[0].fake_account, {id: meUser.id, date: now}, users[0].id, 'fake_account');

		//compute fame evol
		await computeFame(db, 'fake', users[0]);
	}
	return res.status(200).json({ message: SuccessMsg });
}