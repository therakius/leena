export function updateProfileMenu(data){
    return `
    👤 Seu perfil

    Nome: ${data.nome}
    Mercado: ${data.mercado}
    Localizaçao: ${data.localizacao}

    O que deseja atualizar?

    1️⃣ Nome
    2️⃣ Mercado
    3️⃣ Localizacao
    4️⃣ Voltar

    _Responde com o número da opção desejada._
    `.trim()
}