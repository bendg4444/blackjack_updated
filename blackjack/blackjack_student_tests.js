import { assertEquals } from 'https://deno.land/std/testing/asserts.ts'
// import { something } from './blackjack.js'
import {
  exitConditionMet,
  generateDeck,
  play,
  playerDrawsCard,
  pointsForCard,
  pointsForHand
} from './blackjack.js'
import shuffle from './support/shuffle.js'
import { getTestLogger } from './support/logging.ts'

const deck1 = ['2H', 'AS'] //13
const deck2 = ['JH', 'JD', 'QD'] //30
const deck3 = ['2S', '5C', 'AC', 'KD'] //28
const deck4 = ['AS', 'AC'] //21
const deck5 = ['KS', '5H', '6C'] //21
const deck6 = ['2H', '3D', '4D', '2D', '3S', '7S']

Deno.test("generateDeck(): a fresh deck in 'new deck order'", () => {
  // prettier-ignore
  assertEquals(generateDeck(), [
    'AS',
    '2S',
    '3S',
    '4S',
    '5S',
    '6S',
    '7S',
    '8S',
    '9S',
    '10S',
    'JS',
    'QS',
    'KS',
    'AD',
    '2D',
    '3D',
    '4D',
    '5D',
    '6D',
    '7D',
    '8D',
    '9D',
    '10D',
    'JD',
    'QD',
    'KD',
    'AC',
    '2C',
    '3C',
    '4C',
    '5C',
    '6C',
    '7C',
    '8C',
    '9C',
    '10C',
    'JC',
    'QC',
    'KC',
    'AH',
    '2H',
    '3H',
    '4H',
    '5H',
    '6H',
    '7H',
    '8H',
    '9H',
    '10H',
    'JH',
    'QH',
    'KH'
  ])
})

Deno.test(
  'playerDrawsCard(): player draws a card and adds to deck',
  async () => {
    const { logger, handler } = await getTestLogger()
    const newDeck = generateDeck()
    const seed = 12
    let shuffledDeck = shuffle(newDeck, seed)
    let playerHand = [shuffledDeck.shift(), shuffledDeck.shift()]

    //draws once
    playerHand = playerDrawsCard(shuffledDeck, playerHand) //JS
    //Draws KS
    assertEquals(playerDrawsCard(shuffledDeck, playerHand), [
      '2H',
      'KC',
      'JS',
      'KH'
    ])
  }
)

Deno.test(
  'pointsForCard(): Testing the right score for the selected card',
  async () => {
    const { logger, handler } = await getTestLogger()

    //Cards
    const card1 = '2H'
    const card2 = '10D'
    const card3 = 'KS'
    const card4 = 'AD'

    assertEquals(pointsForCard(card1), 2)
    assertEquals(pointsForCard(card2), 10)
    assertEquals(pointsForCard(card3), 10)
    assertEquals(pointsForCard(card4), 11)
  }
)

Deno.test(
  'pointsForHand(): Testing the right amount of points returned for deck of cards',
  async () => {
    assertEquals(pointsForHand(deck1), 13)
    assertEquals(pointsForHand(deck2), 30)
    assertEquals(pointsForHand(deck3), 28)
    assertEquals(pointsForHand(deck4), 22)
  }
)

Deno.test(
  'exitConditionMet(): Testing whether an exitConditionMet returns true or false for values',
  async () => {
    //13, not bust
    assertEquals(exitConditionMet(deck1, 'Dealer'), false)
    assertEquals(exitConditionMet(deck1, 'Player'), false)
    //30, bust
    assertEquals(exitConditionMet(deck2, 'Dealer'), true)
    assertEquals(exitConditionMet(deck2, 'Player'), true)
    //28, bust
    assertEquals(exitConditionMet(deck3, 'Dealer'), true)
    assertEquals(exitConditionMet(deck3, 'Player'), true)
    //2 aces, 21
    assertEquals(exitConditionMet(deck4, 'Dealer'), true)
    assertEquals(exitConditionMet(deck4, 'Player'), true)
    //21, win
    assertEquals(exitConditionMet(deck5, 'Dealer'), true)
    assertEquals(exitConditionMet(deck5, 'Player'), true)
    //6cards, less than 21
    assertEquals(exitConditionMet(deck6, 'Dealer'), true)
    assertEquals(exitConditionMet(deck6, 'Player'), true)
  }
)
