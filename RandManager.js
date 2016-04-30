module.exports = {
    uniqueRandomNumbers(numOfRandomNumbers, lowerBound, upperBound) {
        var randomNumbers = [];
        while (randomNumbers.length < numOfRandomNumbers) {
            var newRandomNumber = this.randomNumberInRange(lowerBound, upperBound);
            if (randomNumbers.indexOf(newRandomNumber) === -1) {
                randomNumbers.push(newRandomNumber);
            }
        }

        return randomNumbers;
    },

    randomNumberInRange(lowerBound, upperBound) {
        var fpRandomNumber = Math.random() * (upperBound - lowerBound) + lowerBound;
        return Math.floor(fpRandomNumber);
    }
};
