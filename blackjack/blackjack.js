import shuffle from './support/shuffle.js'
import { getDefaultLogger } from './support/logging.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts'

const LOSE_MESSAGE = 'You lose!'
const WIN_MESSAGE = 'You win!'
const DRAW_MESSAGE = 'Draw!'
const defaultLogger = await getDefaultLogger()

export function generateDeck() {
  const cards = []
  let suit = ''
  let card = ''
  for (let i = 0; i < 4; i++) {
    //suit
    if (i === 0) suit = 'S'
    if (i === 1) suit = 'D'
    if (i === 2) suit = 'C'
    if (i === 3) suit = 'H'
    for (let j = 0; j < 13; j++) {
      //card
      if (j === 0) card = 'A'
      if (j === 1) card = '2'
      if (j === 2) card = '3'
      if (j === 3) card = '4'
      if (j === 4) card = '5'
      if (j === 5) card = '6'
      if (j === 6) card = '7'
      if (j === 7) card = '8'
      if (j === 8) card = '9'
      if (j === 9) card = '10'
      if (j === 10) card = 'J'
      if (j === 11) card = 'Q'
      if (j === 12) card = 'K'
      cards.push(card + suit)
    }
  }
  return cards
}

export function pointsForHand(hand) {
  //count the points for the hand given

  //goes through each card and calculates the score and returns the total
  let points = hand.reduce((count, card) => {
    count += pointsForCard(card[0])
    return count
  }, 0)
  //total points for deck
  return points
}

export function pointsForCard(card) {
  //returns the number of points for a given card
  let points = 0

  //work out points for particular card
  if (card[0] === 'A') {
    points += 11 //ACE
  } else if (card[0] === 'K' || card[0] === 'Q' || card[0] === 'J') {
    points += 10 //FACE
  } else if (card[0] === '1') {
    points += 10 //10
  } else {
    points += parseInt(card[0])
  } //Normal card (2->9)
  //returns the number of points
  return points
}

//function for player to draw card
export function playerDrawsCard(deck, hand) {
  let drawnCard = deck.shift()
  defaultLogger.info('Hitting')
  defaultLogger.info('You draw ' + drawnCard)
  hand.push(drawnCard)
  return hand
}

export function exitConditionMet(hand, player) {
  //function to establish whether an exit condition is met
  //return a true or false
  //if true, process write out the correct end game response depending on player
  if (pointsForHand(hand) === 21) {
    //who win or lose
    if (player === 'Dealer') {
      defaultLogger.info(LOSE_MESSAGE)
    } else if (player === 'Player') {
      defaultLogger.info(WIN_MESSAGE)
    }
    return true
  }
  //two aces
  if (hand.length <= 2) {
    if (hand[0][0] === 'A' && hand[1][0] === 'A') {
      //who win or lose
      if (player === 'Dealer') {
        defaultLogger.info(LOSE_MESSAGE)
      } else if (player === 'Player') {
        defaultLogger.info(WIN_MESSAGE)
      }
      return true
    }
  }
  //number of cards = 6 or greater and less than equal to 21
  if (hand.length >= 6 && pointsForHand(hand) <= 21) {
    //who win or lose
    if (player === 'Dealer') {
      defaultLogger.info(LOSE_MESSAGE)
    } else if (player === 'Player') {
      defaultLogger.info(WIN_MESSAGE)
    }
    return true
  } //greater than 21
  if (pointsForHand(hand) > 21) {
    if (player === 'Dealer') {
      defaultLogger.info(WIN_MESSAGE)
    } else if (player === 'Player') {
      defaultLogger.info(LOSE_MESSAGE)
    }
    return true
  }
  //no win or lose condition met
  return false
}

export function playerTurn(deck, hand, logger = defaultLogger) {
  //Accept the choice from the player
  const action = window.prompt('What do you want to do? ("hit" or "stick")')

  switch (action) {
    case 'hit': {
      // TO DO: Draw a card
      hand = playerDrawsCard(deck, hand)
      // It's still the player's turn
      logger.info(
        `Your hand is ${hand.join(', ')}\n(${pointsForHand(hand)} points)`
      )
      return true
    }
    case 'stick': {
      // End the player's turn
      return false
    }
    default: {
      // Unknown action
      logger.info('Please enter correct command: ')
      break
    }
  }
}

//Plays game
export function play({ seed = Date.now(), logger = defaultLogger } = {}) {
  //ran once
  const newDeck = generateDeck()
  const shuffledDeck = shuffle(newDeck, seed)
  let playerHand = [shuffledDeck.shift(), shuffledDeck.shift()]
  let isPlayerTurn = true

  logger.info(
    `Your hand is ${playerHand.join(', ')}\n(${pointsForHand(
      playerHand
    )} points)`
  )

  //End game if first cards provide winner
  if (exitConditionMet(playerHand, 'Player')) {
    return
  }

  //Player makes a choice while still in the game e.g isPlayerTurn = true
  while (isPlayerTurn) {
    //player takes turn
    isPlayerTurn = playerTurn(shuffledDeck, playerHand, logger)

    //count the points after each player turn & check for win or lose
    if (exitConditionMet(playerHand, 'Player')) {
      return
    }
  }

  let isDealersTurn = true
  let dealersHand = [shuffledDeck.shift(), shuffledDeck.shift()]

  logger.info(
    `Dealer's hand is ${dealersHand.join(', ')}\n(${pointsForHand(
      dealersHand
    )} points)`
  )
  //dealer wins on drawn cards?
  if (exitConditionMet(dealersHand, 'Dealer')) {
    return
  }
  //dealer draws more than 17
  if (pointsForHand(dealersHand) >= 17) {
    logger.info('comparing scores')
    //compare scores
  } else {
    //needs to draw more cards
    while (isDealersTurn) {
      //dealer draws a card
      let drawnCard = shuffledDeck.shift()
      logger.info('Dealer draws ' + drawnCard)
      dealersHand.push(drawnCard)
      logger.info(
        `Dealer's hand is ${dealersHand.join(', ')}\n(${pointsForHand(
          dealersHand
        )} points)`
      )
      //checks whether win or lose
      if (exitConditionMet(dealersHand, 'Dealer')) {
        return
      } //check whether loop has end
      if (pointsForHand(dealersHand) >= 17) {
        isDealersTurn = false
      }
    }
    logger.info('comparing scores 2')
  }
}

if (import.meta.main) {
  const { seed } = parse(Deno.args)
  play({ seed })
}
