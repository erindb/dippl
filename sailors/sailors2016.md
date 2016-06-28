---
layout: sailors-tutorial
title: SAILORS 2016 Tutorial
description: Examples of recursive inference from game theory.
---

~~~~
"start WebPPL"
~~~~

Suppose you 

## Construct Generative Model

Code:

~~~~
var sampleLocation = function() {
  if (flip(0.6)) {
    // they're both a bit more likely to go to the good restaurant
    return 'good restaurant'
  } else {
    return 'bad restaurant'
  }
}

var model = function() {
  var aliceChoice = sampleLocation()
  var bobChoice = sampleLocation()
  return {
    Alice: aliceChoice,
    Bob: bobChoice
  }
}

viz.table(Infer({method: 'enumerate'}, model))
~~~~

Your code:

~~~~
var sampleLocation = function() {
  if (flip(0.6)) {
    // they're both more likely to go to the good restaurant
    return 'good restaurant'
  } else {
    return 'bad restaurant'
  }
}

var coordinateLocation = function() {
  // we don't *know* where the other person will go,
  // but we can guess, and choose our location accordingly
  var myLocation = sampleLocation()
  var theirLocation = sampleLocation()

  // YOUR CODE HERE:
  var sameLocation = ( ... )

  // make sure `sameLocation` is true.
  condition(sameLocation)

  return myLocation
}

var model = function() {

  // YOUR CODE HERE:
  var aliceChoice = ...
  var bobChoice = ...

  return {
    Alice: aliceChoice,
    Bob: bobChoice
  }
}

viz.table(Infer({method: 'enumerate'}, model))
~~~~

~~~~
var sampleLocation = function() {
  if (flip(0.6)) {
    // they're both more likely to go to the good restaurant
    return 'good restaurant'
  } else {
    return 'bad restaurant'
  }
}

var coordinateLocation = function() {
  // we don't *know* where the other person will go,
  // but we can guess, and choose our location accordingly
  var myLocation = sampleLocation()
  var theirLocation = sampleLocation()
  var sameLocation = ( myLocation==theirLocation )
  condition(sameLocation)
  return myLocation
}

var model = function() {
  var aliceChoice = coordinateLocation()
  var bobChoice = coordinateLocation()
  return [aliceChoice, bobChoice]
}

viz.table(Infer({method: 'enumerate'}, model))
~~~~
{: .answer}

# Play around with parameters

# Talk about other kinds of games