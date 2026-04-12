// src/controllers/registrationHandler.js
// Handles user registration flow

import { registerUser } from "../services/registerService.js";
import { registerProduct, assignProductUser } from "../services/productService.js";
import {
  extractNameFromTextPrompt,
  extractMarketFromTextPrompt,
  extractCityFromTextPrompt,
} from "../config/messages.js";
import { ask } from "../integrations/ai.js";
import { getUserState, setUserState, deleteUserState } from "./stateManager.js";

export async function handleRegistrationFlow(sock, jid, message, text, userId, number) {
  const userState = getUserState(userId);

  if (!userState) {
    setUserState(userId, { step: "ASK_NAME" });

    await sock.sendMessage(
      jid,
      {
        text: "😊 Oi! Antes de começar, quero te conhecer!\n👉 Qual seu nome?",
      },
      { quoted: message },
    );

    return true; // Indicates registration flow was handled
  }

  if (userState.step === "ASK_NAME") {
    return await handleAskName(sock, jid, message, text, userId);
  }

  if (userState.step === "ASK_MARKET") {
    return await handleAskMarket(sock, jid, message, text, userId);
  }

  if (userState.step === "ASK_LOCATION") {
    return await handleAskLocation(sock, jid, message, text, userId);
  }

  if (userState.step === "ASK_PRODUCTS") {
    return await handleAskProducts(sock, jid, message, text, userId, number);
  }

  return false; // Not part of registration flow
}

async function handleAskName(sock, jid, message, text, userId) {
  try {
    const extractedName = await ask(
      extractNameFromTextPrompt(text).system,
      extractNameFromTextPrompt(text).prompt,
    );

    const parsedName = JSON.parse(extractedName);

    setUserState(userId, {
      step: "ASK_MARKET",
      nome: parsedName.name || text,
    });

    console.log(`extracted name: ${parsedName.name || text}`);

    await sock.sendMessage(
      jid,
      {
        text: `🤝 Oi ${parsedName.name || text}! 🧑‍🌾\n📍 Onde você vende? (nome do mercado)`,
      },
      { quoted: message },
    );
  } catch (error) {
    console.error("An error occurred:", error);

    setUserState(userId, { step: "ASK_NAME" });

    await sock.sendMessage(jid, {
      text: "Erro😢. Manda seu nome de novo.",
    });
  }

  return true;
}

async function handleAskMarket(sock, jid, message, text, userId) {
  try {
    const extractedMarket = await ask(
      extractMarketFromTextPrompt(text).system,
      extractMarketFromTextPrompt(text).prompt,
    );

    const parsedMarket = JSON.parse(extractedMarket);

    setUserState(userId, {
      ...getUserState(userId),
      step: "ASK_LOCATION",
      mercado: parsedMarket.market || text,
    });

    await sock.sendMessage(
      jid,
      {
        text: `📌 Onde fica o mercado?`,
      },
      { quoted: message },
    );
  } catch (error) {
    console.error("An error occurred:", error);

    setUserState(userId, { step: "ASK_MARKET", nome: getUserState(userId).nome });

    await sock.sendMessage(jid, {
      text: "Erro😢. Manda nome do mercado de novo.",
    });
  }

  return true;
}

async function handleAskLocation(sock, jid, message, text, userId) {
  try {
    const extractedCity = await ask(
      extractCityFromTextPrompt(text).system,
      extractCityFromTextPrompt(text).prompt,
    );

    const parsedCity = JSON.parse(extractedCity);

    setUserState(userId, {
      ...getUserState(userId),
      step: "ASK_PRODUCTS",
      localizacao: parsedCity.city || text,
    });

    console.log(`extracted city: ${parsedCity.city || text}`);

    await sock.sendMessage(
      jid,
      {
        text: `🏪 Ótimo!\n🛒 Que produtos você vende?\n✍️ Lista separados por vírgula.\nEx: tomate, cebola, alho`,
      },
      { quoted: message },
    );
  } catch (error) {
    console.error("An error occurred:", error);

    setUserState(userId, {
      ...getUserState(userId),
      step: "ASK_LOCATION",
      nome: getUserState(userId).nome,
      mercado: getUserState(userId).mercado,
    });

    await sock.sendMessage(jid, {
      text: "Erro😢. Manda localização de novo.",
    });
  }

  return true;
}

async function handleAskProducts(sock, jid, message, text, userId, number) {
  const produtos = text.split(",").map((p) => p.trim());

  console.log(produtos);

  const userData = { ...getUserState(userId), produtos, number };

  const user = await registerUser(
    userData.nome,
    userData.number,
    userData.mercado,
    userData.localizacao,
  );
  const savedProducts = await registerProduct(userData.produtos);
  const assignProductToUser = await assignProductUser(
    user.id,
    savedProducts,
  );

  deleteUserState(userId);

  await sock.sendMessage(
    jid,
    {
      text: `🎉 Pronto! Você está cadastrado!\n\n👤 Nome: ${userData.nome}\n🏪 Mercado: ${userData.mercado}\n📍 Cidade: ${userData.localizacao}\n🛒 Produtos: ${produtos.join(", ")}\n\n👍 Sempre que precisar, chama!`,
    },
    { quoted: message },
  );

  await sock.sendMessage(jid, {
    text: "📋 Escreve *menu* ou *m* para ver opções ...",
  });

  return true;
}