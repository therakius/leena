// src/controllers/messageController.js
import { getSenderNumber } from "../../utils.js";
import { userIsRegistered, registerUser } from "../services/registerService.js";
import { registerProduct, assignProductUser} from "../services/productService.js";
import { getUserInfo } from "../services/userInfoService.js";
import { promptPredition,promptLocationByMarket } from "../config/messages.js";
import { getNextHolyday } from "../integrations/holidays.js";
import { getNextDayWeather } from "../integrations/weather.js";
import {ask} from "../integrations/ai.js"

const userState = {};
const greetedUsers = {};

const MENU_TEXT = `
📋 *Menu Principal*

O que desejas fazer?

1️⃣ Previsão de vendas
2️⃣ Ver histórico de vendas
3️⃣ Atualizar histórico de vendas
4️⃣ Ver perfil
5️⃣ Atualizar perfil
6️⃣ Ajuda
7️⃣ Sair

_Responde com o número da opção desejada._
`.trim();

async function sendMenu(sock, jid, message) {
    await sock.sendMessage(jid, { text: MENU_TEXT }, { quoted: message });
}

async function handleMenuOption(sock, jid, message, option, userId, userPhoneNumber) {
    switch (option) {
        case "1":
            console.log(`user phone number: ${userPhoneNumber}`)

            const userInfo = await getUserInfo(userPhoneNumber)
            const marketLocationPrompt = [promptLocationByMarket(userInfo.mercado).system, promptLocationByMarket(userInfo.mercado).prompt]

            let marketCity = await ask(marketLocationPrompt[0], marketLocationPrompt[1])

            marketCity = JSON.parse(marketCity)


            const nextDayWeather = await getNextDayWeather(marketCity.location)

            const nextHoliday = await getNextHolyday()

            let data = {
                "userInfo": userInfo,
                "NextDayWeather": nextDayWeather,
                "NextHolyday": nextHoliday
            }

            data = JSON.stringify(data)

            let promptForPredition = [promptPredition(data).system, promptPredition(data).prompt]


            const aiResponse = await ask(promptForPredition[0], promptForPredition[1])

            await sock.sendMessage(jid, {
                text: `📈 *Previsão e recomendação de Vendas*\n\n${aiResponse}`
            }, { quoted: message });
            await sendMenu(sock, jid, message);
            break;

        case "2":
            await sock.sendMessage(jid, {
                text: "📊 *Histórico de Vendas*\n\nFuncionalidade em breve disponível! 🚧"
            }, { quoted: message });
            await sendMenu(sock, jid, message);
            break;

        case "3":
            await sock.sendMessage(jid, {
                text: "✏️ *Atualizar Histórico de Vendas*\n\nFuncionalidade em breve disponível! 🚧"
            }, { quoted: message });
            await sendMenu(sock, jid, message);
            break;

        case "4":
            await sock.sendMessage(jid, {
                text: "👤 *Ver Perfil*\n\nFuncionalidade em breve disponível! 🚧"
            }, { quoted: message });
            await sendMenu(sock, jid, message);
            break;

        case "5":
            await sock.sendMessage(jid, {
                text: "🔧 *Atualizar Perfil*\n\nFuncionalidade em breve disponível! 🚧"
            }, { quoted: message });
            await sendMenu(sock, jid, message);
            break;

        case "6":
            await sock.sendMessage(jid, {
                text: `❓ *Ajuda*\n\nSou a *Leena*, a tua assistente de vendas! 😊\n\nPodes usar o menu para:\n• Ver previsões e histórico de vendas\n• Gerir o teu perfil\n\nSe tiveres dúvidas, fala comigo! 💬`
            }, { quoted: message });
            await sendMenu(sock, jid, message);
            break;

        case "7":
            userState[userId] = { step: "IDLE" };
            await sock.sendMessage(jid, {
                text: "👋 Até logo! Quando precisares, estou aqui 😊"
            }, { quoted: message });
            break;

        default:
            await sock.sendMessage(jid, {
                text: "❌ Opção inválida. Por favor, escolhe um número de *1 a 7*."
            }, { quoted: message });
            await sendMenu(sock, jid, message);
            break;
    }
}

export async function handleMessage(sock, message) {
    if (!message.message) return;
    if (message.key.fromMe) return;

    const text = (
        message.message.conversation
        || message.message.extendedTextMessage?.text
        || ''
    ).trim();

    if (!text) return;

    const jid = message.key.remoteJid;
    const number = getSenderNumber(message);
    const userId = number || jid;

    // 👋 Saudação inicial
    if (!greetedUsers[userId]) {
        greetedUsers[userId] = true;

        await sock.sendMessage(jid, {
            text: "Olá! 👋 Eu sou a *Leena* 😊\nVou te ajudar a organizar os teus produtos e vendas."
        }, { quoted: message });
    }

    // 🚨 1. Garantir número
    if (!number) {
        await sock.sendMessage(jid, {
            text: "Hmm… não consegui identificar o teu número 🤔\nPodes enviar manualmente? (ex: 2588XXXXXXX)"
        }, { quoted: message });
        return;
    }

    // 🔍 2. Verificar registro
    const registered = await userIsRegistered(number);

    // ======================================================
    // 🚀 ONBOARDING (só entra aqui se NÃO estiver registrado)
    // ======================================================
    if (!registered) {

        if (!userState[userId]) {
            userState[userId] = { step: "ASK_NAME" };

            await sock.sendMessage(jid, {
                text: 'Antes de começarmos, quero te conhecer melhor 😊\nComo posso te chamar?'
            }, { quoted: message });

            return;
        }

        if (userState[userId].step === "ASK_NAME") {
            userState[userId] = { step: "ASK_MARKET", nome: text };

            await sock.sendMessage(jid, {
                text: `Prazer em te conhecer, ${text}! 🧑‍🌾\nOnde você costuma vender? (nome do mercado)`
            }, { quoted: message });

            return;
        }

        if (userState[userId].step === "ASK_MARKET") {
            userState[userId] = { ...userState[userId], step: "ASK_PRODUCTS", mercado: text };

            await sock.sendMessage(jid, {
                text: `Perfeito! 🏪\nE quais produtos você vende?\nPodes listar separados por vírgula.\nEx: tomate, cebola, alho`
            }, { quoted: message });

            return;
        }

        if (userState[userId].step === "ASK_PRODUCTS") {
            const produtos = text.split(',').map(p => p.trim());

            const userData = { ...userState[userId], produtos, number };


            const user = await registerUser(userData.nome, userData.number, userData.mercado);

            const savedProducts =await registerProduct(userData.produtos)

            const assignProductToUser = await assignProductUser(user.id, savedProducts)



            delete userState[userId];

            await sock.sendMessage(jid, {
                text: `🎉 Tudo pronto!\n\nAqui está o teu cadastro:\n\n👤 Nome: ${userData.nome}\n🏪 Mercado: ${userData.mercado}\n🛒 Produtos: ${produtos.join(', ')}\n\nSempre que precisares, estou aqui para ajudar 👍`
            }, { quoted: message });

            // 📋 Show menu right after registration
            await sendMenu(sock, jid, message);

            return;
        }
    }

    // ======================================================
    // 📋 MENU (utilizador já registado)
    // ======================================================
    if (registered) {

        const userNumber = registered.telefone;

        // If user was idle or returning, show menu on first contact
        if (!userState[userId] || userState[userId].step === "IDLE") {
            userState[userId] = { step: "IN_MENU" };
            await sendMenu(sock, jid, message);
            return;
        }

        // Handle menu option selection
        if (userState[userId].step === "IN_MENU") {
            await handleMenuOption(sock, jid, message, text, userId, userNumber);
            return;
        }
    }
}