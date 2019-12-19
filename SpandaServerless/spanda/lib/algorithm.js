'use strict'

const stringSimilarity = require('string-similarity');

const getScoreMean = (compareArray, transactionData) => {
    var out = 0.0;
    for(var i = 0; i < compareArray.length; ++i) {
        const firstNumber = Math.abs(transactionData.amount);
        const secondNumber = Math.abs(compareArray[i].amount);
        const similarityScore = stringSimilarity.compareTwoStrings(transactionData.purpose.toLowerCase(),compareArray[i].purpose.toLowerCase()); // dice's text similarity
        const distanceScore = Math.abs((firstNumber-secondNumber)/Math.min(firstNumber, secondNumber)); // euclidian distance
        out += feedForward(similarityScore, distanceScore, 4.594172805675617, -5.033493053166643, -0.7529925377726954); // network trained 13.12.2019
    }

    return out / compareArray.length;
}

const sigmoid1 = function(input) {
    return 1 / (1 + Math.exp(-input));
}

const feedForward = (inString, inDistance, wString, wDistance, b) => {
    return sigmoid1(inString * wString + inDistance * wDistance + b);
}

exports.GetRecurrentTransaction = (transactionsData) => {
    var grouped = [];
    for(var i = 0; i < transactionsData.length; ++i) {
        var matchGroupIndex = -1;
        var lastScore = 0.0;
        for(var k = 0; k < grouped.length; ++k) {

            const out = getScoreMean(grouped[k], transactionsData[i]);
            if((out > 0.5) && (out > lastScore)) {
                matchGroupIndex = k;
                lastScore = out;
            }
        }

        if(matchGroupIndex < 0) {
            grouped.push([]);
            matchGroupIndex = grouped.length-1;
        }
        grouped[matchGroupIndex].push(transactionsData[i]);
    }

    return grouped;
}