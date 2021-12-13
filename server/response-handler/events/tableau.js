

const generateTableau = async(res, req) => {
  const numFencers = 19;
  // lookup number of fencers promoted into round

  // figure out the tableau size
  let maxRounds = 1;
  let roundSize = 1;
  while (roundSize < numFencers) {
    roundSize = roundSize * 2;
    maxRounds = maxRounds + 1;
  }

  const makeMatch = (srcNum, combinedSize, flipped, destArray) => {
    let newMatch;
    if (!srcNum) {
      return;
    }
    if (flipped) {
      newMatch = {pos2: srcNum, pos1: combinedSize - srcNum};
    } else {
      newMatch = {pos1: srcNum, pos2: combinedSize -srcNum};
    }
    destArray.push(newMatch);
  };
  const rounds = [];
  for (let roundNum = maxRounds; roundNum > 0; roundNum--) {
    const match = {pos1: 1, pos2: null};
    const round = {round: roundNum, size: Math.pow(2, maxRounds - roundNum), matches: []};
    if (rounds[rounds.length -1 ]) {
      const prevRound = rounds[rounds.length -1];
      let flipped = false;
      const combinedSize = round.size + 1;
      for (let matchCount = 0; matchCount < prevRound.matches.length; matchCount++) {
        makeMatch(prevRound.matches[matchCount].pos1, combinedSize, flipped,
          round.matches);
        flipped = !flipped;
        makeMatch(prevRound.matches[matchCount].pos2, combinedSize, flipped,
          round.matches);
        flipped = !flipped;
      }
    } else {
      round.matches.push(match);
    }
    rounds.push(round);
  }
};

const checkDERounds = async(req, res) => {
  // scan each round to see if any matches are completed

  // scan a particular DE round to see if any matches are complete and should create a new match in the next round

  // for completed matches, push eliminated athletes out into the round's ranking
}

module.exports = {
  generateTableau
}