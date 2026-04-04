export function getUserInfoQuery(number){
    return {
        text: `
            SELECT json_build_object(
            'vendedor_id', v.id,
            'mercado', v.mercado,
            'produtos', json_agg(
                json_build_object(
                    'produto_id', p.id,
                    'nome', p.nome,
                    'categoria', p.categoria,
                    'preco_medio', vp.preco_medio
                )
            )
        ) AS data
        FROM vendedores v
        INNER JOIN vendedor_produtos vp ON v.id = vp.vendedor_id
        INNER JOIN produtos p ON p.id = vp.produto_id
        WHERE v.telefone ILIKE '%' || $1 || '%'
        GROUP BY v.id, v.mercado;
        `,
        values: [number]
    }

    
}