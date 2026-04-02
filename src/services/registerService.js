import { pg } from "../config/db.js";
import { userIsRegisteredQuery, registerUserQuery, registerProductQuery,  } from "../models/register.js";


export async function userIsRegistered(number){
    const result = await pg.query(userIsRegisteredQuery(number))

    console.log(result.rows[0])

    return result.rows[0]?.nome || false
}

export async function registerUser(name, number, market) {
    const user = await pg.query(registerUserQuery(name, number, market));
    console.log(`User ${name} registered`);

    return user.rows[0]
}

