import shuffle from './support/shuffle.js'
import { getDefaultLogger } from './support/logging.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts'

const LOSE_MESSAGE = 'You lose!'
const WIN_MESSAGE = 'You win!'
const DRAW_MESSAGE = 'Draw!'
const defaultLogger = await getDefaultLogger()

//function to generate a fresh deck of cards
export function generateDeck() {
  const cards = []
  let suit = ['S', 'D', 'C', 'H']
  let card = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

  suit.forEach((suit) => {
    card.forEach((card) => {
      cards.push(card + suit)
    })
  })
  return cards
}

//function that counts total points for a given hand
export function pointsForHand(hand) {
  //goes through each card and calculates the score and returns the total
  let points = hand.reduce((count, card) => {
    count += pointsForCard(card[0])
    return count
  }, 0)
  //special ACE case
  if (hand.length === 2 && hand[0][0] === 'A' && hand[1][0] === 'A') return 21
  //total points for deck
  return points
}

//returns the points for a given card
export function pointsForCard(card) {
  //returns the number of points for a given card
  let points = 0

  //work out points for particular card
  if (isAce(card[0])) {
    points += 11 //ACE
  } else if (isFaceCardOr10(card[0])) {
    points += 10 //FACE or 10
  } else {
    //normal cards
    points += parseInt(card[0])
  }
  return points
}

export function isAce(card) {
  if (card[0] === 'A') {
    return true
  }
  return false
}

export function isFaceCardOr10(card) {
  if (
    card[0] === 'K' ||
    card[0] === 'Q' ||
    card[0] === 'J' ||
    card[0] === '1'
  ) {
    return true
  }
  return false
}

//adds a card to hand and returns hand
export function playerDrawsCard(deck, hand, logger) {
  let drawnCard = deck.shift()
  logger.info('Hitting')
  logger.info('Draws..' + drawnCard)
  hand.push(drawnCard)
  return hand
}

//utility function to print the end game message
export function logExitCondition(hand, player, logger) {
  if (pointsForHand(hand) === 21) {
    //who win or lose
    if (player === 'Dealer') {
      logger.info(LOSE_MESSAGE)
    } else if (player === 'Player') {
      logger.info(WIN_MESSAGE)
    }
  }
  //two aces
  if (hand.length <= 2) {
    if (hand[0][0] === 'A' && hand[1][0] === 'A') {
      //who win or lose
      if (player === 'Dealer') {
        logger.info(LOSE_MESSAGE)
      } else if (player === 'Player') {
        logger.info(WIN_MESSAGE)
      }
    }
  }
  //number of cards = 6 or greater and less than equal to 21
  if (hand.length >= 6 && pointsForHand(hand) <= 21) {
    //who win or lose
    if (player === 'Dealer') {
      logger.info(LOSE_MESSAGE)
    } else if (player === 'Player') {
      logger.info(WIN_MESSAGE)
    }
  } //greater than 21
  if (pointsForHand(hand) > 21) {
    if (player === 'Dealer') {
      logger.info('Hand bust!')
    } else if (player === 'Player') {
      logger.info('Hand bust!')
    }
  }
}

//returns true if an game ending condition has been met e.g a 21 or bust for a hand
export function exitConditionMet(hand) {
  //21
  if (pointsForHand(hand) === 21) {
    return true
  }
  //two aces
  if (hand.length <= 2) {
    if (hand[0][0] === 'A' && hand[1][0] === 'A') {
      return true
    }
  }
  //number of cards = 6 or greater and less than equal to 21
  if (hand.length >= 6 && pointsForHand(hand) <= 21) {
    return true
  } //greater than 21
  if (pointsForHand(hand) > 21) {
    return true
  }
  //no win or lose condition met
  return false
}

//compares the scores of the hands given, logs the result
export function compareScores(playerHand, dealerHand, logger) {
  if (pointsForHand(playerHand) > pointsForHand(dealerHand)) {
    logger.info(WIN_MESSAGE)
  } else if (pointsForHand(playerHand) < pointsForHand(dealerHand)) {
    logger.info(LOSE_MESSAGE)
  } else {
    logger.info(DRAW_MESSAGE)
  }
}

//when player has a turn -> makes a choice -> returns (t/f) whether player can continues or not
export function playerTurn(deck, hand, logger = defaultLogger) {
  //Accept the choice from the player
  const action = window.prompt('What do you want to do? ("hit" or "stick")')

  switch (action) {
    case 'hit': {
      //player picks up
      hand = playerDrawsCard(deck, hand, logger)
      logger.info(
        `Your hand is ${hand.join(', ')}\n(${pointsForHand(hand)} points)`
      )
      // It's still the player's turn
      return true
    }
    case 'stick': {
      logger.info('Sticking')
      // It's still the player's turn
      return false
    }
    default: {
      // Incorrect input for prompt
      logger.info('Please enter correct command: ')
      break
    }
  }
}

//Determins the best hand when the deck has been split -> returns winning hand
export function bestHand(hand1, hand2) {
  //hand 1 is higher and not bust
  var points1 = pointsForHand(hand1)
  var points2 = pointsForHand(hand2)
  if (points1 > 21) points1 = 0
  if (points2 > 21) points2 = 0
  if (points1 > points2) {
    return [...hand1]
  } else if (points2 > points1) {
    return [...hand2]
  } else {
    //hands have even points
    return [...hand1]
  }
}

//Split the cards into two hands, deal an extra card to each -> returns two hands in arr
export function split(playerHand, shuffledDeck, logger) {
  logger.info('Splitting')
  let playerHand1 = [playerHand[0], shuffledDeck.shift()]
  let playerHand2 = [playerHand[1], shuffledDeck.shift()]
  return [playerHand1, playerHand2]
}

//reausable function for logging hand and result
export function logHand(hand, player, logger) {
  logger.info(
    `${player}'s hand is ${hand.join(', ')}\n(${pointsForHand(hand)} points)`
  )
}

//GAME IS PLAYED BELOW

export function play({ seed = Date.now(), logger = defaultLogger } = {}) {
  //set up deck and player's hand
  const newDeck = generateDeck()
  const shuffledDeck = shuffle(newDeck, seed)
  logger.info(seed)
  let playerHand = [shuffledDeck.shift(), shuffledDeck.shift()]
  let isPlayerTurn = true
  logHand(playerHand, 'Player', logger)

  //End game if first cards provide winner
  if (exitConditionMet(playerHand, 'Player', logger)) {
    logExitCondition(playerHand, 'Player', logger)
    return
  }

  //splitting variables
  const card1 = playerHand[0]
  const card2 = playerHand[1]
  let hands = []
  let splitChoice = true

  //checks for same card: if so -> give player choice to split
  if (card1[0] === card2[0]) {
    while (splitChoice) {
      const action = window.prompt('Would you like to split (yes or no)')
      switch (action) {
        case 'yes': {
          //split cards
          hands = split(playerHand, shuffledDeck, logger)
          hands.forEach((hand, idx) => {
            logger.info(
              `Your hand${idx + 1} is ${hand.join(', ')} (${pointsForHand(
                hand
              )} points)`
            )
          })
          splitChoice = false
        }
        case 'no': {
          splitChoice = false
          break
        }
        default: {
          logger.info('Incorrect input')
        }
      }
    }
  }
  //cards have been split
  if (hands.length > 0) {
    //take goes for both hands individually
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i]
      let playHand = true
      logger.info(
        `**\nPlaying with hand: ${hand.join(', ')}\n(${pointsForHand(
          hand
        )} points)`
      )
      while (playHand) {
        //take player turn -> can pick up or stick
        playHand = playerTurn(shuffledDeck, hand, logger)
        if (
          //hand returns 21 & not bust
          exitConditionMet(hand, 'Player', logger) &&
          pointsForHand(hand) === 21
        ) {
          //ends game
          logExitCondition(hand, 'Player', logger)
          return
          //player's hand busts
        } else if (pointsForHand(hand) > 21) {
          logExitCondition(hand, 'Player', logger)
          playHand = false
        }
      }
    }

    //Both hands are bust -> exit game (player lost)
    if (pointsForHand(hands[0]) > 21 && pointsForHand(hands[1]) > 21) {
      logger.info('Both hands bust: ' + LOSE_MESSAGE)
      return
    }

    //choose higher-rated (and usable e.g not bust) hand for player
    playerHand = [...bestHand(hands[0], hands[1])]

    logger.info(
      `\n*Your best hand ${playerHand.join(', ')} (${pointsForHand(
        playerHand
      )} points)*\n`
    )
    //1 hand (no split) -> e.g play normally
  } else {
    //Player makes a choice while still in the game e.g isPlayerTurn = true
    while (isPlayerTurn) {
      //player takes turn
      isPlayerTurn = playerTurn(shuffledDeck, playerHand, logger)

      //count the points after each player turn & check for win or lose
      if (exitConditionMet(playerHand, 'Player', logger)) {
        if (pointsForHand(playerHand) > 21) {
          //prints out lose message in result of bust & ends game
          logger.info(LOSE_MESSAGE)
          return
        }
        logExitCondition(playerHand, 'Player', logger)
        return
      }
    }
  }

  //Running the dealers turn
  let isDealersTurn = true
  let dealersHand = [shuffledDeck.shift(), shuffledDeck.shift()]
  logHand(dealersHand, 'Dealer', logger)

  //dealer wins on initial cards
  if (exitConditionMet(dealersHand, 'Dealer', logger)) {
    logExitCondition(dealersHand, 'Dealer', logger)
    return
  }
  //dealer draws more than 17 -> end turn -> compare scores
  if (pointsForHand(dealersHand) >= 17) {
    compareScores(playerHand, dealersHand, logger)
  } else {
    //needs to draw more cards
    while (isDealersTurn) {
      //dealer draws a card
      dealersHand = playerDrawsCard(shuffledDeck, dealersHand, logger)
      logHand(dealersHand, 'Dealer', logger)

      //checks whether win or lose
      if (exitConditionMet(dealersHand, 'Dealer', logger)) {
        logExitCondition(dealersHand, 'Dealer', logger)
        if (pointsForHand(dealersHand) > 21) logger.info(WIN_MESSAGE)
        return
      } //check whether loop has end
      if (pointsForHand(dealersHand) >= 17) {
        isDealersTurn = false
      }
    }
    compareScores(playerHand, dealersHand, logger)
  }
}

if (import.meta.main) {
  const { seed } = parse(Deno.args)
  play({ seed })
}
