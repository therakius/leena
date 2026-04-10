// src/controllers/menuHandler.js
// Handles menu display and menu option processing

import { getUserInfo, getBasicInfoUser } from "../services/userInfoService.js";
import {
  promptPredition,
  createComprehensiveProfile,
  promptFreeQuestion,
} from "../config/messages.js";
import { getNextHolyday } from "../integrations/holidays.js";
import { getNextDayWeather } from "../integrations/weather.js";
import { ask } from "../integrations/ai.js";
import { updateProfileMenu } from "../config/menu.js";
import { setUserState } from "./stateManager.js";

const MENU_TEXT = `
📋 *Menu Principal*

Escolhe uma opção:

1️⃣ Ver dicas de vendas
2️⃣ Atualizar stock dos produtos
3️⃣ Ver meu perfil
4️⃣ Atualizar meu perfil
5️⃣ Fazer pergunta
6️⃣ Ajuda
7️⃣ Sair

_Escreve o número da opção_
`.trim();

export async function sendMenu(sock, jid, message) {
  await sock.sendMessage(jid, { text: MENU_TEXT }, { quoted: message });
}

export async function handleMenuOption(
  sock,
  jid,
  message,
  option,
  userId,
  userPhoneNumber,
) {
  switch (option) {
    case "1":
      await handleSalesPrediction(sock, jid, message, userPhoneNumber);
      break;

    case "2":
      await handleUpdateStock(sock, jid, message, userId, userPhoneNumber);
      return; // Early return since it sets state

    case "3":
      await handleViewProfile(sock, jid, message, userPhoneNumber);
      break;

    case "4":
      await handleUpdateProfile(sock, jid, message, userId, userPhoneNumber);
      return; // Early return since it sets state

    case "5":
      await handleFreeQuestion(sock, jid, message, userId, userPhoneNumber);
      return; // Early return since it sets state

    case "6":
      await handleHelp(sock, jid, message);
      break;

    case "7":
      await handleExit(sock, jid, message, userId);
      break;

    default:
      await handleInvalidOption(sock, jid, message);
      break;
  }
}

async function handleSalesPrediction(sock, jid, message, userPhoneNumber) {
  console.log(`user phone number: ${userPhoneNumber}`);

  await sock.sendMessage(
    jid,
    {
      text: "⏳ A analisar dados... aguarda um instante 📊",
    },
    { quoted: message },
  );

  const userInfo = await getUserInfo(userPhoneNumber);

  const marketLocation = userInfo.vendedor.localizacao;

  const nextDayWeather = await getNextDayWeather(marketLocation);
  const nextHoliday = await getNextHolyday();

  let data = {
    userInfo: userInfo,
    NextDayWeather: nextDayWeather,
    NextHolyday: nextHoliday,
  };

  data = JSON.stringify(data);

  let promptForPredition = [
    promptPredition(data).system,
    promptPredition(data).prompt,
  ];

  const aiResponse = await ask(
    promptForPredition[0],
    promptForPredition[1],
  );

  await sock.sendMessage(
    jid,
    {
      text: `${aiResponse}`,
    },
    { quoted: message },
  );

  await sendMenuPrompt(sock, jid);
}

async function handleViewProfile(sock, jid, message, userPhoneNumber) {
  await sock.sendMessage(
    jid,
    {
      text: "⏳ Por favor aguarda um instante ...",
    },
    { quoted: message },
  );

  let user = await getUserInfo(userPhoneNumber);
  user = JSON.stringify(user);
  const userProfile = await ask(
    createComprehensiveProfile(user).system,
    createComprehensiveProfile(user).prompt,
  );

  await sock.sendMessage(
    jid,
    {
      text: `${userProfile}`,
    },
    { quoted: message },
  );

  await sendMenuPrompt(sock, jid);
}

async function handleUpdateProfile(sock, jid, message, userId, userPhoneNumber) {
  const userUpdateMenu = await getBasicInfoUser(userPhoneNumber);
  const menu = updateProfileMenu(userUpdateMenu);

  setUserState(userId, { step: "UPDATE_PROFILE_MENU" });

  await sock.sendMessage(
    jid,
    {
      text: `${menu}`,
    },
    { quoted: message },
  );
}

async function handleFreeQuestion(sock, jid, message, userId, userPhoneNumber) {
  const userInfo = await getUserInfo(userPhoneNumber);

  setUserState(userId, { 
    step: "ASKING_FREE_QUESTION",
    userInfo: userInfo
  });

  await sock.sendMessage(
    jid,
    {
      text: "❓ Qual é a tua pergunta?\n\n(Posso ajudar com questões sobre vendas, negócios e estratégias comerciais 📊)",
    },
    { quoted: message },
  );
}

async function handleUpdateStock(sock, jid, message, userId, userPhoneNumber) {
  setUserState(userId, { step: "STOCK_MENU" });

  await sock.sendMessage(
    jid,
    {
      text: "⏳ Por favor aguarda um instante...",
    },
    { quoted: message },
  );

  const { handleStockUpdateFlow } = await import("./stockHandler.js");
  await handleStockUpdateFlow(sock, jid, message, "", userId, userPhoneNumber);
}

async function handleHelp(sock, jid, message) {
  await sock.sendMessage(
    jid,
    {
      text: `❓ *Ajuda*\n\n🤖 Sou a *Leena*, a tua assistente de vendas! 😊\n\nPodes usar o menu para:\n• 📈 Ver previsões de vendas\n• 📦 Atualizar stock dos produtos\n• 👤 Ver e atualizar teu perfil\n\nSe tiveres dúvidas, fala comigo! 💬`,
    },
    { quoted: message },
  );

  await sendMenuPrompt(sock, jid);
}

async function handleExit(sock, jid, message, userId) {
  setUserState(userId, { step: "IDLE" });
  await sock.sendMessage(
    jid,
    {
      text: "👋 Até logo! Estarei por aqui quando precisares 😊",
    },
    { quoted: message },
  );

  await sendMenuPrompt(sock, jid);
}

async function handleInvalidOption(sock, jid, message) {
  await sock.sendMessage(
    jid,
    {
      text: "❌ Não entendi.\n👉 Escolhe um número de 1 a 7.",
    },
    { quoted: message },
  );
}

async function sendMenuPrompt(sock, jid) {
  await sock.sendMessage(jid, {
    text: "📋 Escreve *menu* ou *m* para ver  mais opções ...",
  });
}