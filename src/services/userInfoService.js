import { pg } from "../config/db.js";
import { getUserInfoQuery } from "../models/userInfo.js";

export async function getUserInfo(phoneNumber) {
    const result = await pg.query(getUserInfoQuery(phoneNumber).text, getUserInfoQuery(phoneNumber).values)
    return result.rows[0]?.data
}

