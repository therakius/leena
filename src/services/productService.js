import { pg } from "../config/db.js";
import { assignProductQuery, registerProductQuery } from "../models/register.js";

export async function registerProduct(productList) {
    const savedProducts = [];

    for (const p of productList) {
        const result = await pg.query(registerProductQuery(p));
        if (result.rows.length > 0) {
            savedProducts.push(result.rows[0]);
        }
    }

    console.log(savedProducts)
    return savedProducts;
}

export async function assignProductUser(userId, productList) {
    let savedProducts = []
    for (const p of productList) {

        console.log(assignProductQuery(userId, p.id))

        const result = await pg.query(assignProductQuery(userId, p.id))
        console.log(result.rows[0])
        savedProducts.push(result.rows[0])
    }

    return savedProducts
}