// src/controllers/messageController.js
// Main message controller that orchestrates all message handling

import { getSenderNumber } from "../../utils.js";
import { userIsRegistered } from "../services/registerService.js";
import { getUserState, setUserState, isUserGreeted, markUserAsGreeted } from "./stateManager.js";
import { handleRegistrationFlow } from "./registrationHandler.js";
import { sendMenu, handleMenuOption } from "./menuHandler.js";
import { handleProfileUpdateFlow } from "./profileHandler.js";
import { handleStockUpdateFlow } from "./stockHandler.js";
import { promptFreeQuestion } from "../config/messages.js";
import { ask } from "../integrations/ai.js";

export async function handleMessage(sock, message) {
  if (!message.message) return;
  if (message.key.fromMe) return;

  const text = (
    message.message.conversation ||
    message.message.extendedTextMessage?.text ||
    ""
  ).trim();

  if (!text) return;

  const jid = message.key.remoteJid;
  const number = getSenderNumber(message);
  const userId = number || jid;

  // 👋 Initial greeting
  if (!isUserGreeted(userId)) {
    markUserAsGreeted(userId);

    await sock.sendMessage(
      jid,
      {
        text: "👋 Olá! Eu sou a *Leena* 😊\n🤝 Vou te ajudar com vendas e produtos.",
      },
      { quoted: message },
    );
  }

  // 🚨 1. Ensure we have a number
  if (!number) {
    await sock.sendMessage(
      jid,
      {
        text: "⚠️ Não encontrei seu número 🤔\n📱 Manda seu número? (exemplo: 2588XXXXXXX)",
      },
      { quoted: message },
    );
    return;
  }

  const normalizedText = text.toLowerCase();

  // 🎯 GLOBAL MENU TRIGGER
  if (normalizedText === "m" || normalizedText === "menu") {
    const registered = await userIsRegistered(number);

    if (!registered) {
      await sock.sendMessage(
        jid,
        {
          text: "🛠️ Primeiro vamos configurar seu perfil 😊\n👉 Responde as perguntas primeiro 👍",
        },
        { quoted: message },
      );
      return;
    }

    setUserState(userId, { step: "IN_MENU" });
    await sendMenu(sock, jid, message);
    return;
  }

  const registered = await userIsRegistered(number);

  if (!registered) {
    // Handle registration flow
    const handled = await handleRegistrationFlow(sock, jid, message, text, userId, number);
    if (handled) return;
  }

  if (registered) {
    const userNumber = registered.telefone;

    if (!getUserState(userId) || getUserState(userId).step === "IDLE") {
      setUserState(userId, { step: "AWAITING_MENU_TRIGGER" });

      await sock.sendMessage(
        jid,
        {
          text: "📋 Escreve *menu* ou *m* para ver  mais opções ...",
        },
        { quoted: message },
      );

      return;
    }

    // Handle profile update flow
    if (
      [
        "UPDATE_PROFILE_MENU",
        "UPDATE_NAME",
        "UPDATE_MARKET",
        "UPDATE_LOCATION",
        "CONFIRM_UPDATE_PROFILE",
      ].includes(getUserState(userId).step)
    ) {
      const handled = await handleProfileUpdateFlow(
        sock,
        jid,
        message,
        text,
        userId,
        userNumber,
      );
      if (handled) return;
    }

    // Handle stock update flow
    if (
      [
        "STOCK_MENU",
        "SELECT_PRODUCT",
        "UPDATE_PRODUCT_DETAILS",
        "CONFIRM_STOCK_UPDATE",
      ].includes(getUserState(userId).step)
    ) {
      const handled = await handleStockUpdateFlow(
        sock,
        jid,
        message,
        text,
        userId,
        userNumber,
      );
      if (handled) return;
    }

    // Handle free question flow
    if (getUserState(userId).step === "ASKING_FREE_QUESTION") {
      try {
        await sock.sendMessage(
          jid,
          {
            text: "⏳ Deixa-me pensar... 🤔",
          },
          { quoted: message },
        );

        const userState = getUserState(userId);
        const prompt = promptFreeQuestion(text, userState.userInfo);
        const response = await ask(prompt.system, prompt.prompt);

        setUserState(userId, { step: "AWAITING_MENU_TRIGGER" });

        await sock.sendMessage(
          jid,
          {
            text: response,
          },
          { quoted: message },
        );

        await sock.sendMessage(
          jid,
          {
            text: "📋 Escreve *menu* ou *m* para voltar ao menu ...",
          },
          { quoted: message },
        );
      } catch (error) {
        console.error("Error processing free question:", error);
        
        setUserState(userId, { step: "AWAITING_MENU_TRIGGER" });

        await sock.sendMessage(
          jid,
          {
            text: "Erro😢. Tenta de novo ou escreve *menu*.",
          },
          { quoted: message },
        );
      }
      return;
    }

    // Handle menu options
    if (getUserState(userId).step === "IN_MENU") {
      await handleMenuOption(sock, jid, message, text, userId, userNumber);
      return;
    }

    // Handle awaiting menu trigger
    if (getUserState(userId).step === "AWAITING_MENU_TRIGGER") {
      await sock.sendMessage(
        jid,
        {
          text: "📋 Escreve *menu* ou *m* para ver  mais opções ...",
        },
        { quoted: message },
      );
      return;
    }
  }
}