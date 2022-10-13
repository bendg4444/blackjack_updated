import { generateDeck, playerTurn } from '../blackjack.js'
import { stub } from 'https://deno.land/x/mock@0.13.0/stub.ts'
import shuffle from './shuffle.js'

export function playerChooses(choices) {
  return stub(window, 'prompt', (p) => {
    return choices.shift()
  })
}

export function takePlayerTurn({ seed, logger } = {}) {
  let turnDeck

  if (!seed) {
    turnDeck = generateDeck()
  } else {
    turnDeck = shuffle(generateDeck(), seed)
  }

  let playerHand = [turnDeck.shift(), turnDeck.shift()]
  let isPlayerTurn = true

  while (isPlayerTurn) {
    isPlayerTurn = playerTurn(turnDeck, playerHand, logger)
  }
}
