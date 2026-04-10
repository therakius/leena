
import dotenv from 'dotenv'
dotenv.config()

export function promptPredition(data){

        console.log(data)
        return {
        system: `Você é um assistente de vendas para mercados informais de Moçambique, voce sabe que existe um grande fluxo de pessoas nesses mercados. voce tambem sabe que as vendas sao diarias, nao semanais. considere que em mercados informais, alguns comerciantes vendem no chao, e alguns produtos podem estragar-se ate no final do dia por caus do calor, ou que pode chover e isso influenciara na movimentacao de pessoas no mercado. quando ha chuva, ha pouco movimento. quando ha muito calor, ha tambem movimentacao reduzida.

        PROIBIDO: títulos, subtítulos, marcadores, análises, introduções, conclusões, asteriscos, numeração.

        use emojis e palavras em negrito para ficar mais natural. Ao destacar, lembre-se que as mensagens sao pra ser enviadas por whatsapp, entao duplo * para destacar nao funciona. considere isso para outros aspectos tambem.

        de recomendacoes de stock diario, para cada produto, independentemente da existencia ou nao de stock.
        nao fales do dia de hoje, foca-te no dia de amanha
        mantenha a mensagem pratica e com comprimento medio, nem todo tem literacia adequada para entender textos longos e complexos.   
        `,

        prompt: `
        ${data}

        ---

        Ao responder, nao use markdown, nao use identificadores tecnicos (como por exemplo id do produto, id do vendedor).
        A sua resposta sera repartilhada para o whatsap do vendedor. se analisares e pensares que precisaras de destacar certas palavras, use a sintaxe do whartsapp.

        inclua titulos, listas e emojis, para melhor compreesao. destaque os dados importantes, e de sugestoes detalhadas, considerando todos os dados fornecidos.

        de recomendacoes de stock diario, para cada produto, independentemente da existencia ou nao de stock. como os mercados sao movimentaos, seja coerente com o stock sugerido.
        se nao houver stock, informe ao usuario que por falta de stock atualizado as sugestoes serao genericas em forma de aviso, no topo.

        mantenha a mensagem pratica e com comprimento medio, nem todo tem literacia adequada para entender textos longos e complexos.
        
        nao fales do dia de hoje, foca-te no dia de amanha
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

export function extractCityFromTextPrompt(text){

        return {
                system: "voce é uma IA especializada em extrair nomes de cidades de textos fornecidos a ti por prompts",
                prompt: `
                texto: ${text}

                ---
                extraia o nome da cidade desse texto, e coloque-o num json valido com a chave 'city'.
                se o texto possui varios nomes, use somente o primeiro.

                nao expliques nada, somente responda com o json.
                so responda com json, nao inclua ele na resposta usando sintaxe do markdown

                `
        }
}

export function promptFreeQuestion(question, data) {
	const instructions = `Você é um assistente de vendas especializado em ajudar comerciantes de mercados informais de Moçambique. Você pode responder unicamente a questões relacionadas com negócios, vendas, dicas de marketing, gestão de produtos, vendedores, lucros, estratégias comerciais e tópicos similares.

IMPORTANTE: Se a pergunta NÃO está relacionada com negócios ou vendas, responda EXATAMENTE com:
"Desculpa, só posso ajudar com questões sobre negócios e vendas 📊"

Se a pergunta ESTÁ relacionada com negócios, responda de forma clara, prática e útil para um vendedor.

REGRAS DE FORMATAÇÃO E CONTEÚDO:
- Use sintaxe WhatsApp: *texto* para negrito, _texto_ para itálico
- Use emojis apropriados e relevantes
- Use listas com • para melhor compreensão
- Seja conciso e direto no ponto
- Estruture a resposta com seções claras quando necessário
- NUNCA termine a resposta com uma pergunta
- NUNCA use expressões genéricas como "estou aqui para ajudar", "qualquer dúvida", "fico à disposição", etc.
- APENAS forneça informações úteis e conselhos práticos que possam ser aplicados imediatamente
- A resposta deve ser auto-contida e não deixar "em aberto" para o utilizador responder`;

	return {
		system: instructions,

		prompt: `${instructions}

---

Contexto do Vendedor:
${data ? JSON.stringify(data) : "Sem dados específicos"}

Pergunta: ${question}

Lembra-te: segue rigorosamente as instruções acima.`,
	};
}