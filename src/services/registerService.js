import { pg } from "../config/db.js";
import { userIsRegisteredQuery, registerUserQuery, registerProductQuery } from "../models/register.js";

export async function userIsRegistered(number){
    const result = await pg.query(userIsRegisteredQuery(number))
    return result.rows[0] || false
}

export async function registerUser(name, number, market, location) {
    const user = await pg.query(registerUserQuery(name, number, market, location));
    return user.rows[0]
}

