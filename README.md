# Leena

Leena é uma assistente de vendas criada para apoiar comerciantes de mercados informais na decisão de compra para revenda. O foco é tornar decisões rápidas e assertivas, reduzindo desperdício e aumentando a margem.

## O que a Leena faz

- Analisa fatores ambientais e sociais (clima, sazonalidade local, datas comemorativas, perfil do bairro). 
- Coleta dados com autorização do usuário: tipo de negócio, mix de produtos, histórico de vendas, estoque atual e feedback do cliente.
- Gera recomendações personalizadas sobre o que comprar, quais itens evitar e em quais quantidades comprar.
- Avalia a demanda semanal (como dias de maior procura para cada produto) e o ciclo anual (feriados próximos, temporadas regionais).

## Valor para o usuário

- Reduz perdas com estoque parado e produtos perecíveis.
- Aumenta giro de estoque com reposição mais alinhada à demanda.
- Diminui compras impulsivas e exageradas.
- Permite planejamento com antecedência usando previsões simples e alertas de risco.

## Público-alvo

- Camelôs e vendedores de barraca
- Lojistas de mercearias e minimercados
- Pequenos comerciantes de bairros que não usam sistema ERP
- Empreendedores que precisam de auxílio para gestão de estoque e preço

## Entradas e integrações

- Vendas diárias (manual ou importação de planilhas)
- Estoque e controles simples (lista de produtos com qtd e validade)
- Interação via WhatsApp (usuário envia dados e consulta; Leena responde com mensagens e notificações personalizadas)

## Modelo AI e fontes de dados externas

- Powered by AI: uso de modelo de IA para analisar dados e sugerir decisões adaptativas
- APIs externas: clima, datas comemorativas e possivelmente dados de atividade humana local
- Dados do cliente: estoque, vendas, mix de produtos e histórico diário

## Como funciona (visão técnica)

1. Recebe histórico de vendas, mix de produtos e informações de negócio.
2. Normaliza e compara com padrões de procura por semana/mês.
3. Aplica regras de negócio regionais e modelos leves de previsão (janela móvel 7/14/30 dias).
4. Identifica produtos com demanda crescente, estável ou decrescente.
5. Gera alertas de oportunidades e risco (promoções sazonais, feriados, excesso de estoque).

## Tech Stack

- **Backend**: JavaScript com Node.js e Express
- **Banco de dados**: PostgreSQL
- **Controle de versão**: Git e GitHub

## Privacidade e segurança

- Controle total dos dados pelo usuário.
- Todos os dados são armazenados no servidor, na base de dados PostgreSQL, com criptografia.
- Compartilhamento somente com consentimento explícito.

## Exemplos de uso

- "Me mostre produtos com alta demanda para domingo próximo." 
- "Qual produto eu devo repor mais rápido esta semana?" 
- "Quais itens tenho estoque excessivo que devo reduzir nos próximos 15 dias?"

## Caso de Uso Simples: Planejamento de Compra Semanal

**Cenário**: Um camelô de frutas precisa decidir o que comprar para a semana, considerando estoque atual e vendas recentes.

1. **Usuário envia via WhatsApp**: "Atualizar estoque: maçã 50kg, banana 30kg, leite 20l."
2. **Leena confirma e solicita mais dados**: "Recebido! éMe diga as vendas de ontem para análise."
3. **Usuário responde**: "Vendas ontem: maçã 20kg, banana 15kg, leite 10l."
4. **Leena processa com IA**: Analisa dados internos, clima (chuva prevista) e feriado próximo (aumenta demanda por frutas).
5. **Leena responde com recomendação**: "Recomendação: Compre mais maçã (alta demanda por feriado), reduza leite (estoque excessivo). Sugestões: maçã +30kg, banana +10kg, leite 0. Alerta: Chuva pode reduzir vendas de leite."

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).


