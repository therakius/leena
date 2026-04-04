
export function registerUserQuery(name, number, market){
    return {
        text: 'insert into public.vendedores (nome, telefone, mercado) values ($1, $2, $3) returning id',
        values: [name, number,market]
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
        ON CONFLICT (nome) DO NOTHING
        returning id, nome
        ;
    `,
    values: [product]
    }
}

export function assignProductQuery(userId, products) {
    return {
        text: 'INSERT INTO public.vendedor_produtos (vendedor_id, produto_id) VALUES($1, $2)',
        values: [userId, products]
    }
}