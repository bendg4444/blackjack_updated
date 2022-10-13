import shuffle from './support/shuffle.js'
import { getDefaultLogger } from './support/logging.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts'

const LOSE_MESSAGE = 'You lose!'
const WIN_MESSAGE = 'You win!'
const DRAW_MESSAGE = 'Draw!'
const defaultLogger = await getDefaultLogger()

export function generateDeck() {
  const cards = []

  // TO DO: Write your code here

  return cards
}

export function pointsFor(cards) {
  // TO DO: Write your code here
}

export function playerTurn(deck, hand, logger = defaultLogger) {
  logger.info(`Your hand is ${hand.join(', ')}\n(${pointsFor(hand)} points)`)

  //Accept the choice from the player
  const action = window.prompt('What do you want to do? ("hit" or "stick")')

  switch (action) {
    case 'hit': {
      // TO DO: Draw a card

      // It's still the player's turn
      return true
    }
    case 'stick': {
      // End the player's turn
      return false
    }
    default: {
      // Unknown action
      break
    }
  }
}

export function play({ seed = Date.now(), logger = defaultLogger } = {}) {
  const newDeck = generateDeck()
  const shuffledDeck = shuffle(newDeck, seed)
  let playerHand = [shuffledDeck.shift(), shuffledDeck.shift()]

  let isPlayerTurn = true

  while (isPlayerTurn) {
    isPlayerTurn = playerTurn(shuffledDeck, playerHand, logger)
  }

  // TO DO: Dealer's turn
}

if (import.meta.main) {
  const { seed } = parse(Deno.args)
  play({ seed })
}
