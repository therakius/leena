import { pg } from "../config/db.js";
import { getUserInfoQuery, getUserBasicInfoQuery, updateUserNameQuery, updateUserMarketQuery, updateUserLocationQuery } from "../models/userInfo.js";

export async function getUserInfo(phoneNumber) {
    const result = await pg.query(getUserInfoQuery(phoneNumber).text, getUserInfoQuery(phoneNumber).values)
    return result.rows[0]?.data
}

export async function getBasicInfoUser(phoneNumber) {
    const result = await pg.query(getUserBasicInfoQuery(phoneNumber).text, getUserBasicInfoQuery(phoneNumber).values)
    return result.rows[0]
}

export async function updateUserName(phoneNumber, newName) {
    await pg.query(updateUserNameQuery(phoneNumber, newName).text, updateUserNameQuery(phoneNumber, newName).values);
}

export async function updateUserMarket(phoneNumber, newMarket) {
    await pg.query(updateUserMarketQuery(phoneNumber, newMarket).text, updateUserMarketQuery(phoneNumber, newMarket).values);
}

export async function updateUserLocation(phoneNumber, newLocation) {
    await pg.query(updateUserLocationQuery(phoneNumber, newLocation).text, updateUserLocationQuery(phoneNumber, newLocation).values);
}

