// src/controllers/stockHandler.js
// Handles stock and product information updates

import {
  getUserProducts,
  updateProductDetails,
} from "../services/productService.js";
import { getUserState, setUserState } from "./stateManager.js";

export async function handleStockUpdateFlow(
  sock,
  jid,
  message,
  text,
  userId,
  userPhoneNumber,
) {
  const userState = getUserState(userId);

  if (userState.step === "STOCK_MENU") {
    return await handleStockMenu(sock, jid, message, text, userId, userPhoneNumber);
  }

  if (userState.step === "SELECT_PRODUCT") {
    return await handleSelectProduct(sock, jid, message, text, userId, userPhoneNumber);
  }

  if (userState.step === "UPDATE_PRODUCT_DETAILS") {
    return await handleUpdateProductDetails(sock, jid, message, text, userId, userPhoneNumber);
  }

  if (userState.step === "CONFIRM_STOCK_UPDATE") {
    return await handleConfirmStockUpdate(sock, jid, message, text, userId, userPhoneNumber);
  }

  return false;
}

async function handleStockMenu(sock, jid, message, text, userId, userPhoneNumber) {
  try {
    const products = await getUserProducts(userPhoneNumber);

    if (!products || products.length === 0) {
      await sock.sendMessage(jid, {
        text: "❌ Nenhum produto encontrado. Cadastra produtos primeiro.",
      });
      return true;
    }

    // Store products in state for later reference
    const productList = products.map((p, index) => ({
      ...p,
      numero: index + 1,
    }));

    setUserState(userId, {
      step: "SELECT_PRODUCT",
      produtos: productList,
    });

    // Build product list message
    let productsMessage = "📦 *Seus Produtos*\n\n";
    productList.forEach((p) => {
      productsMessage += `${p.numero}️⃣ ${p.nome}\n`;
      productsMessage += `   💰 Preço: ${p.preco_medio || "Não definido"}\n`;
      productsMessage += `   📏 Unidade: ${p.unidade_de_medida || "Não definida"}\n`;
      productsMessage += `   📊 Stock: ${p.stock_atual || 0}\n\n`;
    });

    productsMessage += "Escolhe o número do produto para atualizar:";

    await sock.sendMessage(jid, {
      text: productsMessage,
    });
  } catch (error) {
    console.error("An error occurred:", error);

    await sock.sendMessage(jid, {
      text: "Erro😢. Tenta de novo.",
    });
  }

  return true;
}

async function handleSelectProduct(sock, jid, message, text, userId, userPhoneNumber) {
  const userState = getUserState(userId);
  const productIndex = parseInt(text) - 1;

  if (isNaN(productIndex) || productIndex < 0 || productIndex >= userState.produtos.length) {
    await sock.sendMessage(jid, {
      text: "❌ Não entendi. Escolhe um número válido.",
    });
    return true;
  }

  const selectedProduct = userState.produtos[productIndex];

  setUserState(userId, {
    ...userState,
    step: "UPDATE_PRODUCT_DETAILS",
    selectedProduct: selectedProduct,
  });

  await sock.sendMessage(jid, {
    text: `🛠️ *Atualizar ${selectedProduct.nome}*\n\nEnvia os valores assim:\npreço, unidade, stock\n\nExemplo: 50.00, kg, 100\n\nPara só atualizar preço e unidade, deixa stock vazio:\n50.00, kg, `,
  });

  return true;
}

async function handleUpdateProductDetails(sock, jid, message, text, userId, userPhoneNumber) {
  const userState = getUserState(userId);
  const selectedProduct = userState.selectedProduct;
  const values = text.split(",").map((value) => value.trim());

  if (values.length < 2) {
    await sock.sendMessage(jid, {
      text: "❌ Não entendi o formato. Envia pelo menos preço e unidade separados por vírgula.",
    });
    return true;
  }

  const [priceText, unit, stockText] = values;
  const price = parseFloat(priceText.replace(",", "."));
  const stock = stockText ? parseFloat(stockText) : null;

  if (isNaN(price)) {
    await sock.sendMessage(jid, {
      text: "❌ Não entendi o preço. Envia um número válido.",
    });
    return true;
  }

  if (!unit || unit.length === 0) {
    await sock.sendMessage(jid, {
      text: "❌ Não entendi a unidade. Envia uma unidade válida.",
    });
    return true;
  }

  if (stockText && isNaN(stock)) {
    await sock.sendMessage(jid, {
      text: "❌ Não entendi o stock. Envia um número válido ou deixa vazio.",
    });
    return true;
  }

  try {
    const result = await updateProductDetails(selectedProduct.id, price, unit, stock);

    await sock.sendMessage(jid, {
      text: `✅ Atualizado!\n*${selectedProduct.nome}*\n💰 Preço: ${result.preco_medio || price.toFixed(2)}\n📏 Unidade: ${result.unidade_de_medida || unit}\n📊 Stock: ${result.stock_atual ?? "Não mudou"}`,
    });

    setUserState(userId, {
      ...userState,
      step: "CONFIRM_STOCK_UPDATE",
    });

    const confirmMenu = `Quer fazer mais atualizações?\n\n1️⃣ Sim\n2️⃣ Não\n\n_ou escreve m para menu_`;

    await sock.sendMessage(jid, {
      text: confirmMenu,
    });
  } catch (error) {
    console.error("An error occurred:", error);

    await sock.sendMessage(jid, {
      text: "Erro😢. Tenta de novo.",
    });
  }

  return true;
}

async function handleConfirmStockUpdate(sock, jid, message, text, userId, userPhoneNumber) {
  const normalized = text.toLowerCase();

  if (text === "1") {
    setUserState(userId, {
      step: "STOCK_MENU",
    });

    // Restart the stock menu
    await handleStockMenu(sock, jid, message, "", userId, userPhoneNumber);
    return true;
  }

  if (text === "2") {
    setUserState(userId, {
      step: "AWAITING_MENU_TRIGGER",
    });

    await sock.sendMessage(jid, {
      text: "📋 Escreve *menu* ou *m* para ver opções ...",
    });
    return true;
  }

  if (normalized === "m" || normalized === "menu") {
    setUserState(userId, {
      step: "IN_MENU",
    });

    const { sendMenu } = await import("./menuHandler.js");
    await sendMenu(sock, jid, message);
    return true;
  }

  await sock.sendMessage(jid, {
    text: "❌ Não entendi. Escolhe 1, 2 ou escreve *m*.",
  });

  return true;
}