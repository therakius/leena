
import dotenv from 'dotenv'
dotenv.config()

export function promptLocationByMarket(market){
    return {
        system: `voce é um especialista em mercados de mocambique. mais precisamente mem dizer onde mercados expecificos localizam-se. ao ser perguntado, voce so responde com a localisacao, com json valido. exemplo: {"location": "cidade"}`,
        prompt: `onde se localiza o mercado de ${market}
        responda sempre com json valido, no formato:
        {"location": "cidade"}

        `}
}

export function promptPredition(data){
        return {
        system: `Você é um assistente de vendas para mercados informais de Moçambique, voce sabe que existe um grande fluxo de pessoas nesses mercados. voce tambem sabe que as vendas sao diarias, nao semanais. considere que em mercados informais, alguns comerciantes vendem no chao, e alguns produtos podem estragar-se ate no final do dia por caus do calor, ou que pode chover e isso influenciara na movimentacao de pessoas no mercado. quando ha chuva, ha pouco movimento. quando ha muito calor, ha tambem movimentacao reduzida.

        PROIBIDO: títulos, subtítulos, marcadores, análises, introduções, conclusões, asteriscos, numeração.

        Responda APENAS neste formato, sem desvios:

        [resumo de clima (inclua temeratura em °C, se ha proabilidade de chuva, etc) e contexto (frase curta)]

        sugestao pra compra e revenda amanha:
        - [produto]: [quantidade] [unidade]
        - [produto]: [quantidade] [unidade]
        - (inclua sugestoes de todos os produtos vendidos pelo cliente)

        Motivo: [1 frase curta considerando clima e contexto]
        PS: use emojis e palavras em negrito para ficar mais natural. Ao destacar, lembre-se que as mensagens sao pra ser enviadas por whatsapp, entao duplo * para destacar nao funciona. considere isso para outros aspectos tambem.
        `,

        prompt: `
        ${data}

        ---

        Ao responder, nao use markdown, nao use identificadores tecnicos (como por exemplo id do produto, id do vendedor).
        A sua resposta sera repartilhada para o whatsap do vendedor. se analisares e pensares que precisaras de destacar certas palavras, use a sintaxe do whartsapp.

        inclua titulos (usando *), listas (usando *) e emojis, para melhor compreesao. destaque os dados importantes, e de sugestoes detalhadas, considerando todos os dados fornecidos.
        
        `
        }
}

export function extractNameFromTextPrompt(text){
        return {
                system: "voce é uma IA especializada em extrair nomes proprios de textos fornecidos a ti por prompts",
                prompt: `
                texto: ${text}

                ---

                extraia o nome proprio desse texto, e coloque-o num json valido com a chave 'name'.
                se o texto possui varios nomes, use somente o primeiro.

                nao expliques nada, somente responda com o json.
                so responda com json, nao inclua ele na resposta usando sintaxe do markdown
                `
        }
}

export function extractMarketFromTextPrompt(text){

        return {
                system: "voce é uma IA especializada em extrair nomes de mercados de textos fornecidos a ti por prompts",
                prompt: `
                texto: ${text}

                ---
                extraia o nome proprio desse texto, e coloque-o num json valido com a chave 'market'.
                se o texto possui varios nomes, use somente o primeiro.

                nao expliques nada, somente responda com o json.
                so responda com json, nao inclua ele na resposta usando sintaxe do markdown

                `
        }
}


export function createComprehensiveProfile(data){
        return {
                system: "voce é expecialista em textrair dados de comerciantes de um json, e montar um perfil em forma de texto compreensivel",
                prompt: `
                ${data}

                ---

                use esses dados para criar um perfil para esse usuario, e retorne-o em forma de texto, com emojis e textos em destaque. foque em todas as informacoes dadoas. para valores null, usa "*Não especificado*". (somente peça que o usuario atualize os dados nas observacoes)

                os dados sao atualizados atraves do menu: a opcao é numero 5. Atualizar perfil.

                lembre-se de que o resultado dado por ti sera reencaminhado ao usuario final, diretamente no whatsapp. entao, use sintaxe do whatsapp para formatar texto.

                --
                coloque as datas no formato dd/mm/yyyy
                somente isso, nao inclua mais nada

                estrutura recomendada:

                *Perfil do Vendedor*📊
                Nome: nome_do_vendedor
                Telefone: numero de telefone
                Mercado: nome do mercado
                Localização: localização
                Data de adesão: data
                Última atualização: data

                *Produtos Vendidos*🛍️
                
                *Produto 1*: 
                - Preço médio - preço 
                - Stock corrente - stock
                
                *Cebola*: 
                - Preço médio - preço
                - Stock corrente - stock
                
                *Pimenta*: 
                - Preço médio - stock 
                - Stock corrente - stock

                _Observações:_
                * oservacao 1
                * observacao 2

                ----
                se for necessario que o usuario entre em contacto com o suporte, o contacto é ${process.env.SUPPORT_CONTACT}.
                lembre-se de usar emojis coerentes com as informacoes fornecidas.
                `     
        }
}