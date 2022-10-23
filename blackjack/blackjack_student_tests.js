import {
  assert,
  assertEquals,
  assertStringIncludes,
  assertArrayIncludes
} from 'https://deno.land/std/testing/asserts.ts'
// import { something } from './blackjack.js'
import {
  compareScores,
  exitConditionMet,
  generateDeck,
  logExitCondition,
  play,
  playerDrawsCard,
  pointsForCard,
  pointsForHand,
  split
} from './blackjack.js'
import shuffle from './support/shuffle.js'
import { getTestLogger } from './support/logging.ts'
import { playerChooses, takePlayerTurn } from './support/testing.js'

//seed: 1666369614515 2 aces
//seed: 1666371379198 same first card
//seed: 1666449148721

const deck1 = ['2H', 'AS'] //13
const deck2 = ['JH', 'JD', 'QD'] //30
const deck3 = ['2S', '5C', 'AC', 'KD'] //28
const deck4 = ['AS', 'AC'] //21
const deck5 = ['KS', '5H', '6C'] //21
const deck6 = ['2H', '3D', '4D', '2D', '3S', '7S']

const deck7 = ['JH', '8C'] // 18
const deck8 = ['AC', '7H'] //18

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
    playerHand = playerDrawsCard(shuffledDeck, playerHand, logger) //JS
    //Draws KS
    assertEquals(playerDrawsCard(shuffledDeck, playerHand, logger), [
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
    assertEquals(pointsForHand(deck4), 21)
  }
)

Deno.test(
  'exitConditionMet(): Testing whether an exitConditionMet returns true or false for values',
  async () => {
    const { logger, handler } = await getTestLogger()

    //13, not bust
    assertEquals(exitConditionMet(deck1, 'Dealer', logger), false)
    assertEquals(exitConditionMet(deck1, 'Player', logger), false)
    //30, bust
    assertEquals(exitConditionMet(deck2, 'Dealer', logger), true)
    assertEquals(exitConditionMet(deck2, 'Player', logger), true)
    //28, bust
    assertEquals(exitConditionMet(deck3, 'Dealer', logger), true)
    assertEquals(exitConditionMet(deck3, 'Player', logger), true)
    //2 aces, 21
    assertEquals(exitConditionMet(deck4, 'Dealer', logger), true)
    assertEquals(exitConditionMet(deck4, 'Player', logger), true)
    //21, win
    assertEquals(exitConditionMet(deck5, 'Dealer', logger), true)
    assertEquals(exitConditionMet(deck5, 'Player', logger), true)
    //6cards, less than 21
    assertEquals(exitConditionMet(deck6, 'Dealer', logger), true)
    assertEquals(exitConditionMet(deck6, 'Player', logger), true)
  }
)

Deno.test('compareScores(): Testing the Draw', async () => {
  const { logger, handler } = await getTestLogger()
  compareScores(deck7, deck8, logger)
  //console.log(handler.messages)
  assertArrayIncludes(handler.messages, ['Draw!'])
})

Deno.test('compareScores(): Testing the Win', async () => {
  const { logger, handler } = await getTestLogger()
  compareScores(deck8, deck1, logger)
  //console.log(handler.messages)
  assertArrayIncludes(handler.messages, ['You win!'])
})

Deno.test('compareScores(): Testing the Lose', async () => {
  const { logger, handler } = await getTestLogger()
  compareScores(deck1, deck8, logger)
  //console.log(handler.messages)
  assertArrayIncludes(handler.messages, ['You lose!'])
})

Deno.test(
  'playerTurn(): choosing to stick outputs a "Hitting" message',
  async () => {
    const { logger, handler } = await getTestLogger()

    const c = playerChooses(['hit', 'stick'])
    play({ logger, seed: 12 })

    //console.log(handler.messages)
    assertArrayIncludes(handler.messages, ['Hitting'])
    c.restore()
  }
)

Deno.test(
  'compareScores(): Testing whether the scores are compared correctly (Players loses)',
  async () => {
    const { logger, handler } = await getTestLogger()
    //player loses
    compareScores(deck1, deck7, logger)
    //Player loses, 13 vs 17
    assertArrayIncludes(handler.messages, ['You lose!'])
  }
)

Deno.test(
  'compareScores(): Testing whether the scores are compared correctly (Players wins)',
  async () => {
    const { logger, handler } = await getTestLogger()
    //player loses
    compareScores(deck7, deck1, logger)
    //Player wins, 17 vs 13
    assertArrayIncludes(handler.messages, ['You win!'])
  }
)

Deno.test('Ensure player goes first and dealer goes second', async () => {
  const { logger, handler } = await getTestLogger()
  const c = playerChooses(['stick'])
  play({ logger, seed: 12 })

  let found = false
  let inOrder = true
  for (let i in handler.messages) {
    let message = handler.messages[i]
    //console.log(message)
    if (message.includes("Player's hand is")) {
      found = true
    } else if (message.includes("Dealer's hand is") && found === false)
      inOrder = false
  }
  assertEquals(inOrder, true)
  c.restore()
})

Deno.test('split(): Testing splitting deck functionality', async () => {
  const { logger, handler } = await getTestLogger()
  const c = playerChooses(['yes'])
  const seed = 1666371379198
  let deck = generateDeck(seed)
  let shuffledDeck = shuffle(deck, seed)
  play({ logger, seed })
  //split(['4H', '4D'], shuffledDeck, logger)
  console.log(handler.messages)
})

Deno.test(
  'logExitCondition(): log the correct exit winning condition',
  async () => {
    const { logger, handler } = await getTestLogger()
    logExitCondition(['AC', 'AD'], 'Player', logger)
    handler.messages.includes('You win!')

    //assertEquals(logExitCondition(['AC', 'AD'], 'Dealer', logger), 'You lose!')
  }
)
// Deno.test(
//   'canSplit(): Testing whether card matching function works',
//   async () => {
//     assertEquals(canSplit(['KH', 'KD']), true)
//     assertEquals(canSplit(['10D', '10C']), true)
//     assertEquals(canSplit(['4H', '6D']), false)
//   }
// )
