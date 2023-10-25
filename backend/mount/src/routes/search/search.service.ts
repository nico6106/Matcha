import { GPSCoordinates, TableUser, TableUsersName } from "../../database/data";
import { Database } from "../../database/db";
import { Request, Response } from "express";
import { getUserFromRequest } from "../auth/auth.service";
import { ErrorMsg, NotConnected, SuccessMsg } from "../../shared/errors";
import { haversineDistance } from "./distance.service";
import { computeAgeUser } from "../users/users.service";
import { MatchingResponse, UserInfoMatching } from "../../shared/search";

type MatchingUsers = {
	user: TableUser;
	distance: number;
	nbCommonTags: number;
	commonTags: string[];
	normDist: number;
	normTags: number;
	normFame: number;
	autoRank: number;
}

//return list of users: id, name, picture, distance, age, nb commons tags, fame rating
export async function browsingProfiles(db: Database, req: Request, res: Response) {
	const meUser: TableUser | null = await getUserFromRequest(db, req);
	if (!meUser)
		return res.status(200).json({ message: ErrorMsg, error: NotConnected });

	//get all users
	const allUsers: TableUser[] | null = await db.selectAllElemFromTable(TableUsersName);
	if (!allUsers)
		return res.status(200).json({ message: ErrorMsg, error: "servor error" });
	
	//filter current user from results
	const allUsersExceptMe: TableUser[] | null = allUsers.filter(elem => elem.id !== meUser.id);

	//filter by sexual preference
	const matchesBySexPref : TableUser[] = allUsersExceptMe.filter(elem => 
		meUser.preference === 'bisexual' || meUser.preference === elem.gender
		);
	
	const allDistances: number[] = [];
	const allNbTags: number[] = [];
	const allFame: number[] = [];

	const coordCurrUser: GPSCoordinates = {
		latitude: meUser.position.latitude ? meUser.position.latitude : 0,
		longitude: meUser.position.longitude ? meUser.position.longitude : 0,
	}

	//compute raw data for analysis
	const usersMatching: MatchingUsers[] = computeRawDataForAnalysis(meUser, matchesBySexPref, coordCurrUser, allDistances, allNbTags, allFame);

	//normalize
	normalizeResults(usersMatching, allDistances, allNbTags, allFame);

	//log
	showResults(usersMatching);

	const response: MatchingResponse[] = createResponse(usersMatching);
	
	//compute distance from other users and 
	return res.status(200).json({ message: SuccessMsg, data_search: response });
}

function createResponse(usersMatching: MatchingUsers[]): MatchingResponse[] {
	const response: MatchingResponse[] = [];

	for (const elem of usersMatching) {
		const tmpUser: UserInfoMatching = {
			id: elem.user.id,
			first_name: elem.user.first_name,
			last_name: elem.user.last_name,
			age: computeAgeUser(elem.user.date_birth),
			gender: elem.user.gender,
			profile_picture: elem.user.profile_picture,
		};
		const tmpElem: MatchingResponse = {
			user: tmpUser,
			distance: elem.distance,
			commonTags: elem.commonTags,
			normDist: elem.normDist,
			normTags: elem.normTags,
			normFame: elem.normFame,
			autoRank: elem.autoRank,
		}
		response.push(tmpElem);
	}
	return response;
}

function computeRawDataForAnalysis(meUser: TableUser,
	matchesBySexPref : TableUser[],
	coordCurrUser: GPSCoordinates,
	allDistances: number[],
	allNbTags: number[],
	allFame: number[]): MatchingUsers[]
	{
	const usersMatching: MatchingUsers[] = [];

	for (const elem of matchesBySexPref) {
		//compute nb of common tags
		const commonTags: string[] = computeCommonTags(meUser.interests, elem.interests);
		allNbTags.push(commonTags.length);

		//compute distance
		const coordUser1: GPSCoordinates = {
			latitude: elem.position.latitude ? elem.position.latitude : 0,
			longitude: elem.position.longitude ? elem.position.longitude : 0,
		}
		const distance: number = haversineDistance(coordCurrUser.latitude, coordCurrUser.longitude, coordUser1.latitude, coordUser1.longitude);
		allDistances.push(distance);

		allFame.push(elem.fame_rating);
		console.log('comparison with username='+elem.username+'('+elem.id+') : distance='+distance+', commonTags='+commonTags);
		
		//create obj and push it to list
		const elemUserMatching: MatchingUsers = {
			user: elem,
			distance: distance,
			nbCommonTags: commonTags.length,
			commonTags: commonTags,
			normDist: 0,
			normTags: 0,
			normFame: 0,
			autoRank: 0,
		}
		usersMatching.push(elemUserMatching);
	}
	return usersMatching;
}

function computeCommonTags(tagsUser1: string[], tagsUser2: string[]): string[] {
	const commonTags: string[] = [];
	for (const elem of tagsUser1) {
		if (tagsUser2.includes(elem))
			commonTags.push(elem)
	}
	return commonTags;
}

function normalizeResults(usersMatching: MatchingUsers[], allDistances: number[], allNbTags: number[], allFame: number[]) {
	const info = {
		distMin: Math.min(...allDistances),
		distMax: Math.max(...allDistances),
		tagsMin: Math.min(...allNbTags),
		tagsMax: Math.max(...allNbTags),
		fameMin: Math.min(...allFame),
		fameMax: Math.max(...allFame),
	}
	for (let i = 0; i < usersMatching.length; i++) {
		//normalize distance	
		if (info.distMax - info.distMin !== 0) {
			usersMatching[i].normDist = (usersMatching[i].distance - info.distMin) / (info.distMax - info.distMin);
			usersMatching[i].normDist = Math.abs(1 - usersMatching[i].normDist);
		}
		
		//normalize tags
		if (info.tagsMax - info.tagsMin !== 0)
			usersMatching[i].normTags = (usersMatching[i].nbCommonTags - info.tagsMin) / (info.tagsMax - info.tagsMin);
	
		//normalize fame rating
		if (info.fameMax - info.fameMin !== 0)
			usersMatching[i].normFame = (usersMatching[i].user.fame_rating - info.fameMin) / (info.fameMax - info.fameMin);

		//weight: distance: 50, tags: 35, fame: 15
		usersMatching[i].autoRank = 0.6 * usersMatching[i].normDist 
			+ 0.30 * usersMatching[i].normTags
			+ 0.10 * usersMatching[i].normFame;
	}
}

function showResults(usersMatching: MatchingUsers[]) {
	for (let i = 0; i < usersMatching.length; i++) {
		console.log('username='+usersMatching[i].user.username+'('+usersMatching[i].user.id+')'
			+': gender='+usersMatching[i].user.gender
			+', normDist='+usersMatching[i].normDist
			+', normTags='+usersMatching[i].normTags
			+', normFame='+usersMatching[i].normFame
			+'==> rank='+usersMatching[i].autoRank
		);
	}
}
