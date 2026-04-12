
export function registerUserQuery(name, number, market, location){
    return {
        text: 'insert into public.vendedores (nome, telefone, mercado, localizacao) values ($1, $2, $3, $4) returning id',
        values: [name, number, market, location]
    }
}


export function userIsRegisteredQuery(number){
    return {
        text: 'select * from public.vendedores as v where v.telefone = $1',
        values: [number]
    }
}

export function registerProductQuery(product) {
    return {
        text: `
        INSERT INTO public.produtos (nome)
        VALUES ($1)
        ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
        RETURNING id, nome
        ;
    `,
    values: [product]
    }
}

export function assignProductQuery(userId, productId) {
    return {
        text: `
        INSERT INTO public.vendedor_produtos (vendedor_id, produto_id)
        VALUES ($1, $2)
        ON CONFLICT (vendedor_id, produto_id) DO NOTHING
        RETURNING vendedor_id, produto_id
        ;
    `,
    values: [userId, productId]
    }
}

export function getUserProductsQuery(phoneNumber) {
    return {
        text: `
        SELECT vp.id, p.id as produto_id, p.nome, vp.preco_medio, vp.unidade_de_medida, vp.stock_atual
        FROM public.vendedor_produtos as vp
        JOIN public.produtos as p ON p.id = vp.produto_id
        JOIN public.vendedores as v ON v.id = vp.vendedor_id
        WHERE v.telefone = $1
        ORDER BY p.nome
        ;
        `,
        values: [phoneNumber]
    }
}

export function updateProductPriceQuery(vendedorProdutoId, price) {
    return {
        text: `
        UPDATE public.vendedor_produtos
        SET preco_medio = $2, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, preco_medio, atualizado_em
        ;
        `,
        values: [vendedorProdutoId, price]
    }
}

export function updateProductUnitQuery(vendedorProdutoId, unit) {
    return {
        text: `
        UPDATE public.vendedor_produtos
        SET unidade_de_medida = $2, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, unidade_de_medida, atualizado_em
        ;
        `,
        values: [vendedorProdutoId, unit]
    }
}

export function updateProductStockQuery(vendedorProdutoId, stock) {
    return {
        text: `
        UPDATE public.vendedor_produtos
        SET stock_atual = $2, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, stock_atual, atualizado_em
        ;
        `,
        values: [vendedorProdutoId, stock]
    }
}

export function updateProductDetailsQuery(vendedorProdutoId, price, unit, stock) {
    return {
        text: `
        UPDATE public.vendedor_produtos
        SET preco_medio = COALESCE($2, preco_medio),
            unidade_de_medida = COALESCE(NULLIF($3, ''), unidade_de_medida),
            stock_atual = COALESCE($4, stock_atual),
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, preco_medio, unidade_de_medida, stock_atual, atualizado_em
        ;
        `,
        values: [vendedorProdutoId, price, unit, stock]
    }
}