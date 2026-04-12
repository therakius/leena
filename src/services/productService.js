import { pg } from "../config/db.js";
import {
    assignProductQuery,
    registerProductQuery,
    getUserProductsQuery,
    updateProductPriceQuery,
    updateProductUnitQuery,
    updateProductStockQuery,
    updateProductDetailsQuery,
} from "../models/register.js";

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
    const savedProducts = [];

    for (const p of productList) {
        const result = await pg.query(assignProductQuery(userId, p.id));

        if (result.rows.length > 0) {
            savedProducts.push(result.rows[0]);
        } else {
            savedProducts.push({ vendedor_id: userId, produto_id: p.id });
        }
    }

    return savedProducts;
}

export async function getUserProducts(userId) {
    const result = await pg.query(getUserProductsQuery(userId));
    return result.rows;
}

export async function updateProductPrice(vendedorProdutoId, price) {
    const result = await pg.query(updateProductPriceQuery(vendedorProdutoId, price));
    return result.rows[0];
}

export async function updateProductUnit(vendedorProdutoId, unit) {
    const result = await pg.query(updateProductUnitQuery(vendedorProdutoId, unit));
    return result.rows[0];
}

export async function updateProductStock(vendedorProdutoId, stock) {
    const result = await pg.query(updateProductStockQuery(vendedorProdutoId, stock));
    return result.rows[0];
}

export async function updateProductDetails(vendedorProdutoId, price, unit, stock) {
    const result = await pg.query(updateProductDetailsQuery(vendedorProdutoId, price, unit, stock));
    return result.rows[0];
}