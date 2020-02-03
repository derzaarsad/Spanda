import stringSimilarity = require('string-similarity');
import { Transaction } from "./transactions";

let sigmoid1 = (input: number): number => {
    return 1 / (1 + Math.exp(-input));
}

let feedForward = (inString: number, inDistance: number, wString: number, wDistance: number, b: number): number => {
    return sigmoid1(inString * wString + inDistance * wDistance + b);
}

let getScoreMean = (compareArray: Transaction[], transactionData: Transaction): number => {
    var out = 0.0;
    for(var i = 0; i < compareArray.length; ++i) {
        const firstNumber = transactionData.absAmount;
        const secondNumber = compareArray[i].absAmount;
        const similarityScore = stringSimilarity.compareTwoStrings(transactionData.purpose!.toLowerCase(),compareArray[i].purpose!.toLowerCase()); // dice's text similarity
        const distanceScore = Math.abs((firstNumber-secondNumber)/Math.min(firstNumber, secondNumber)); // euclidian distance
        out += feedForward(similarityScore, distanceScore, 4.594172805675617, -5.033493053166643, -0.7529925377726954); // network trained 13.12.2019
    }

    return out / compareArray.length;
}

export namespace Algorithm {
    export const GetRecurrentTransaction = (transactionsData: Transaction[]): Transaction[][] => {
        let grouped: Transaction[][] = [];
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
    
        return grouped.filter(item => item.length > 1);
    }
    
    export const GetDominantIncome = (transactionsData: Transaction[]): Transaction => {
        //TODO
        throw new Error("not implemented");
    }
}
