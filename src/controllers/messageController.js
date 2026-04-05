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

            await sock.sendMessage(jid, {
                text: "⏳ A analisar dados... aguarda um instante 📊"
            }, {quoted: message})
            
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

            await sock.sendMessage(jid, {
                text:"📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })

            break;

        case "2":
            await sock.sendMessage(jid, {
                text: "📊 *Histórico de Vendas*\n\n🚧 Funcionalidade em breve disponível!"
            }, { quoted: message });

            await sock.sendMessage(jid, {
                text:"📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })

            break;

        case "3":
            await sock.sendMessage(jid, {
                text: "✏️ *Atualizar Histórico de Vendas*\n\n🚧 Funcionalidade em breve disponível!"
            }, { quoted: message });

            await sock.sendMessage(jid, {
                text:"📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })

            break;

        case "4":
            await sock.sendMessage(jid, {
                text: "👤 *Ver Perfil*\n\n🚧 Funcionalidade em breve disponível!"
            }, { quoted: message });

            await sock.sendMessage(jid, {
                text:"📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })

            break;

        case "5":
            await sock.sendMessage(jid, {
                text: "🔧 *Atualizar Perfil*\n\n🚧 Funcionalidade em breve disponível!"
            }, { quoted: message });

            await sock.sendMessage(jid, {
                text:"📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })

            break;

        case "6":
            await sock.sendMessage(jid, {
                text: `❓ *Ajuda*\n\n🤖 Sou a *Leena*, a tua assistente de vendas! 😊\n\nPodes usar o menu para:\n• 📈 Ver previsões\n• 📊 Ver histórico de vendas\n• 👤 Gerir o teu perfil\n\nSe tiveres dúvidas, fala comigo! 💬`
            }, { quoted: message });

            await sock.sendMessage(jid, {
                text:"📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })

            break;

        case "7":
            userState[userId] = { step: "IDLE" };
            await sock.sendMessage(jid, {
                text: "👋 Até logo! Estarei por aqui quando precisares 😊"
            }, { quoted: message });

            await sock.sendMessage(jid, {
                text:"📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })
            break;

        default:
            await sock.sendMessage(jid, {
                text: "❌ Opção inválida.\n👉 Escolhe um número de *1 a 7*."
            }, { quoted: message });
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
            text: "👋 Olá! Eu sou a *Leena* 😊\n🤝 Vou te ajudar a organizar os teus produtos e vendas."
        }, { quoted: message });
    }

    // 🚨 1. Garantir número
    if (!number) {
        await sock.sendMessage(jid, {
            text: "⚠️ Não consegui identificar o teu número 🤔\n📱 Podes enviar manualmente? (ex: 2588XXXXXXX)"
        }, { quoted: message });
        return;
    }

    const normalizedText = text.toLowerCase();

    // 🎯 GLOBAL MENU TRIGGER
    if (normalizedText === "m" || normalizedText === "menu") {

        const registered = await userIsRegistered(number);

        if (!registered) {
            await sock.sendMessage(jid, {
                text: "🛠️ Ainda estamos a configurar o teu perfil 😊\n👉 Responde às perguntas primeiro 👍"
            }, { quoted: message });
            return;
        }

        userState[userId] = { step: "IN_MENU" };
        await sendMenu(sock, jid, message);
        return;
    }

    const registered = await userIsRegistered(number);

    if (!registered) {

        if (!userState[userId]) {
            userState[userId] = { step: "ASK_NAME" };

            await sock.sendMessage(jid, {
                text: '😊 Antes de começarmos, quero te conhecer melhor!\n👉 Como posso te chamar?'
            }, { quoted: message });

            return;
        }

        if (userState[userId].step === "ASK_NAME") {
            userState[userId] = { step: "ASK_MARKET", nome: text };

            await sock.sendMessage(jid, {
                text: `🤝 Prazer em te conhecer, ${text}! 🧑‍🌾\n📍 Onde você costuma vender? (nome do mercado)`
            }, { quoted: message });

            return;
        }

        if (userState[userId].step === "ASK_MARKET") {
            userState[userId] = { ...userState[userId], step: "ASK_PRODUCTS", mercado: text };

            await sock.sendMessage(jid, {
                text: `🏪 Perfeito!\n🛒 Quais produtos você vende?\n✍️ Lista separados por vírgula.\nEx: tomate, cebola, alho`
            }, { quoted: message });

            return;
        }

        if (userState[userId].step === "ASK_PRODUCTS") {
            const produtos = text.split(',').map(p => p.trim());

            const userData = { ...userState[userId], produtos, number };

            const user = await registerUser(userData.nome, userData.number, userData.mercado);
            const savedProducts = await registerProduct(userData.produtos)
            const assignProductToUser = await assignProductUser(user.id, savedProducts)

            delete userState[userId];

            await sock.sendMessage(jid, {
                text: `🎉 Cadastro concluído!\n\n👤 Nome: ${userData.nome}\n🏪 Mercado: ${userData.mercado}\n🛒 Produtos: ${produtos.join(', ')}\n\n👍 Sempre que precisares, estou aqui!`
            }, { quoted: message });

            await sock.sendMessage(jid, {
                text: "📋 Escreve *menu* ou *m* para ver  mais opções ..."
            })

            return;
        }
    }

    if (registered) {

        const userNumber = registered.telefone;

        if (!userState[userId] || userState[userId].step === "IDLE") {
            userState[userId] = { step: "AWAITING_MENU_TRIGGER" };

            await sock.sendMessage(jid, {
                text: "📋 Escreve *menu* ou *m* para ver  mais opções ..."
            }, { quoted: message });

            return;
        }

        if (userState[userId].step === "IN_MENU") {
            await handleMenuOption(sock, jid, message, text, userId, userNumber);
            return;
        }

        if (userState[userId].step === "AWAITING_MENU_TRIGGER") {
            await sock.sendMessage(jid, {
                text: "📋 Escreve *menu* ou *m* para ver  mais opções ..."
            }, { quoted: message });
            return;
        }
    }
}