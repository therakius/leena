// src/controllers/stateManager.js
// Manages user states and greeted users across the application

const userState = {};
const greetedUsers = {};

export function getUserState(userId) {
  return userState[userId];
}

export function setUserState(userId, state) {
  userState[userId] = state;
}

export function deleteUserState(userId) {
  delete userState[userId];
}

export function isUserGreeted(userId) {
  return greetedUsers[userId];
}

export function markUserAsGreeted(userId) {
  greetedUsers[userId] = true;
}

export function resetUserState(userId) {
  userState[userId] = { step: "IDLE" };
}