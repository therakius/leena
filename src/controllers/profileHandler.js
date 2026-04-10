// src/controllers/profileHandler.js
// Handles profile update flow

import { getBasicInfoUser, updateUserName, updateUserMarket, updateUserLocation } from "../services/userInfoService.js";
import { updateProfileMenu } from "../config/menu.js";
import { getUserState, setUserState } from "./stateManager.js";

export async function handleProfileUpdateFlow(
  sock,
  jid,
  message,
  text,
  userId,
  userPhoneNumber,
) {
  const userState = getUserState(userId);

  if (userState.step === "UPDATE_PROFILE_MENU") {
    return await handleUpdateProfileMenu(sock, jid, message, text, userId, userPhoneNumber);
  }

  if (userState.step === "UPDATE_NAME") {
    return await handleUpdateName(sock, jid, message, text, userId, userPhoneNumber);
  }

  if (userState.step === "UPDATE_MARKET") {
    return await handleUpdateMarket(sock, jid, message, text, userId, userPhoneNumber);
  }

  if (userState.step === "UPDATE_LOCATION") {
    return await handleUpdateLocation(sock, jid, message, text, userId, userPhoneNumber);
  }

  if (userState.step === "CONFIRM_UPDATE_PROFILE") {
    return await handleConfirmUpdateProfile(sock, jid, message, text, userId, userPhoneNumber);
  }

  return false;
}

async function handleUpdateProfileMenu(sock, jid, message, text, userId, userPhoneNumber) {
  if (text === "1") {
    setUserState(userId, { step: "UPDATE_NAME" });

    await sock.sendMessage(
      jid,
      {
        text: "✏️ Digite novo nome:",
      },
      { quoted: message },
    );

    return true;
  }

  if (text === "2") {
    setUserState(userId, { step: "UPDATE_MARKET" });

    await sock.sendMessage(
      jid,
      {
        text: "🏪 Digite novo mercado:",
      },
      { quoted: message },
    );

    return true;
  }

  if (text === "3") {
    setUserState(userId, { step: "UPDATE_LOCATION" });

    await sock.sendMessage(
      jid,
      {
        text: "📍 Digite nova cidade:",
      },
      { quoted: message },
    );

    return true;
  }

  if (text === "4") {
    setUserState(userId, { step: "IN_MENU" });
    const { sendMenu } = await import("./menuHandler.js");
    await sendMenu(sock, jid, message);
    return true;
  }

  await sock.sendMessage(
    jid,
    {
      text: "❌ Não entendi. Escolhe 1, 2, 3 ou 4.",
    },
    { quoted: message },
  );

  return true;
}

async function handleUpdateName(sock, jid, message, text, userId, userPhoneNumber) {
  await updateUserName(userPhoneNumber, text);

  setUserState(userId, { step: "CONFIRM_UPDATE_PROFILE" });

  await sock.sendMessage(
    jid,
    {
      text: `✅ Nome atualizado!

          Quer fazer mais mudanças?

          1️⃣ Sim
          2️⃣ Não

          _ou escreve m para menu_`,
    },
    { quoted: message },
  );

  return true;
}

async function handleUpdateMarket(sock, jid, message, text, userId, userPhoneNumber) {
  await updateUserMarket(userPhoneNumber, text);

  setUserState(userId, { step: "CONFIRM_UPDATE_PROFILE" });

  await sock.sendMessage(
    jid,
    {
      text: `✅ Mercado atualizado!

          Quer fazer mais mudanças?

          1️⃣ Sim
          2️⃣ Não

          _ou escreve m para menu_`,
    },
    { quoted: message },
  );

  return true;
}

async function handleUpdateLocation(sock, jid, message, text, userId, userPhoneNumber) {
  await updateUserLocation(userPhoneNumber, text);

  setUserState(userId, { step: "CONFIRM_UPDATE_PROFILE" });

  await sock.sendMessage(
    jid,
    {
      text: `✅ Cidade atualizada!

          Quer fazer mais mudanças?

          1️⃣ Sim
          2️⃣ Não

          _ou escreve m para menu_`,
    },
    { quoted: message },
  );

  return true;
}

async function handleConfirmUpdateProfile(sock, jid, message, text, userId, userPhoneNumber) {
  const normalized = text.toLowerCase();

  if (text === "1") {
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

    return true;
  }

  if (text === "2") {
    setUserState(userId, { step: "AWAITING_MENU_TRIGGER" });

    await sock.sendMessage(
      jid,
      {
        text: "📋 Escreve *menu* ou *m* para ver opções ...",
      },
      { quoted: message },
    );

    return true;
  }

  if (normalized === "m" || normalized === "menu") {
    setUserState(userId, { step: "IN_MENU" });
    const { sendMenu } = await import("./menuHandler.js");
    await sendMenu(sock, jid, message);
    return true;
  }

  await sock.sendMessage(
    jid,
    {
      text: "❌ Não entendi. Escolhe 1, 2 ou escreve *m*.",
    },
    { quoted: message },
  );

  return true;
}