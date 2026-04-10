export function getUserInfoQuery(number){
    return {
        text: `
            select json_build_object(

            'vendedor', json_build_object(
                'nome', v.nome,
                'telefone', v.telefone,
                'mercado', v.mercado,
                'localizacao', v.localizacao
            ),

            'produtos_vendidos', json_agg(
                json_build_object(
                    'nome_do_produto', p.nome,
                    'preco_medio', vp.preco_medio,
                    'stock_corrente', vp.stock_atual
                )
            ),
            'data_de_adesao', v.criado_em::date,
            'ultima_atualizacao', v.atualizado_em::date
            
            ) as data
            from public.vendedores as v
            left join public.vendedor_produtos as vp on vp.vendedor_id = v.id
            left join public.produtos as p on p.id = vp.produto_id
            WHERE v.telefone ILIKE '%' || $1 || '%'
            group by v.nome, v.telefone, v.mercado, v.localizacao, v.criado_em, v.atualizado_em;
    
    `,
        values: [number]
    }

    
}

export function getUserBasicInfoQuery(number){
    return {
        text: `
            select id, nome, mercado 
            from public.vendedores as v
            where v.telefone ilike '%' || $1 || '%';
        `,
        values: [number] 
    }
}

export function updateUserNameQuery(phoneNumber, newName) {
    return {
        text: `
            UPDATE public.vendedores
            SET nome = $2, atualizado_em = NOW()
            WHERE telefone ILIKE '%' || $1 || '%';
        `,
        values: [phoneNumber, newName]
    }
}

export function updateUserMarketQuery(phoneNumber, newMarket) {
    return {
        text: `
            UPDATE public.vendedores
            SET mercado = $2, atualizado_em = NOW()
            WHERE telefone ILIKE '%' || $1 || '%';
        `,
        values: [phoneNumber, newMarket]
    }
}

export function updateUserLocationQuery(phoneNumber, newLocation) {
    return {
        text: `
            UPDATE public.vendedores
            SET localizacao = $2, atualizado_em = NOW()
            WHERE telefone ILIKE '%' || $1 || '%';
        `,
        values: [phoneNumber, newLocation]
    }
}