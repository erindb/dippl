---
layout: sailors-tutorial
title: SAILORS 2016 Tutorial
description: Examples of recursive inference from game theory.
---

~~~~
"start WebPPL"
~~~~

## Introduction

<!-- we actually will go after Noah's talk, so that helps! -->

Inductive reasoning is a type of reasoning in which the conclusions that are reached are probable (rather than certain) based on the evidence provided. The premises act as evidence for the validity of the conclusions, but this type of reasoning is inherently uncertain and thus the conclusions are merely probable to some degree - and may still be false. Probability theory (e.g. Bayes' rule) is one example of inductive reasoning.

In our examples, we will use Bayesian inference to run simulations of popular game theory games. As we will see, we can use nested inference to do even better in these games. 

## Coordination Game

Let's play a game.

**Question 1** Imagine that you and all the other SAILORS students are going to play a game. We'll drop all of you off in different places in New York City and we'll give you a specific day and time at which you all have to meet up. YOU CANNOT CONTACT EACH OTHER BEFORE YOU MEET UP. Where in the city will you try to meet?
{: .click2seeQn #qn1}

**Question 2** What if we didn't tell you the time, but we told you the day and the place. What time would you all meet there?
{: .click2seeQn #qn2}

**Question 3** Imagine you're all going to play another game. In this game, you write down an amount of money. If you all pick the same amount of money, your group actually gets that amount of money as a prize. Otherwise, no one gets any money. It could be *any* amount of money, but you all have to pick the same amount to win and you cannot discuss your answer with each other.
{: .click2seeQn #qn3}

**Discuss** What are some things you thought about when making your decision?

### Making a model

We can represent this game and many others like it as a model of **reasoning about reasoning**. Psychologists often call this **theory of mind**. You have a theory about other people's beliefs and goals that helps you predict their decisions. You often don't *know* what people will do, but you can make good guesses.

**Probabilistic programming languages** like WebPPL give a really nice interface for writing models of reasoning about reasoning. Let's model the following coordination game:

Alice and Bob are talking about meeting up for coffee in an hour, but Bob's cell phone cuts out before they can decide on a place and they can't get back in contact with one another. There are a bunch of coffee shops on campus. Alice and Bob usually go to either Bytes (40% of the time) or Coupa (30% of the time), but they sometimes go to Starbucks (20%) or CoHo (10%). They're going to try to meet up, each guessing where the other person will go.

**Question** Do you think they'll meet each other? How and where?

We can start by making a model of where Alice and Bob would go if they *weren't* reasoning about each other.

First we write a function that **samples** a coffee shop. This function will return different coffee shops with different frequencies according to their probabilities. Run it a bunch of times to see different outcomes.

~~~
var sampleCoffeeShop = function() {
	return categorical(
		[0.4,     0.3,     0.2,         0.1   ],
		['Bytes', 'Coupa', 'Starbucks', 'CoHo']
	)
}
sampleCoffeeShop();
~~~

We can use the `plotDistribution` function to show us all the different outcomes and their probabilities.

~~~
///fold:
var infer = function(fn) {return Infer({method: 'enumerate'}, fn)};
var plotDistribution = function(fn) {return viz.auto(infer(fn))};
///
var sampleCoffeeShop = function() {
	return categorical(
		[0.4,     0.3,     0.2,         0.1   ],
		['Bytes', 'Coupa', 'Starbucks', 'CoHo']
	)
}
plotDistribution(sampleCoffeeShop)
~~~

**Question** If both Alice and Bob use this function to pick the coffee shop they go to, how often will they pick the same coffee shop?

We can answer this question with a model.

~~~
///fold:
var infer = function(fn) {return Infer({method: 'enumerate'}, fn)};
var plotDistribution = function(fn) {return viz.auto(infer(fn))};
///
var sampleCoffeeShop = function() {
	return categorical(
		[0.4,     0.3,     0.2,         0.1   ],
		['Bytes', 'Coupa', 'Starbucks', 'CoHo']
	)
}
var aliceAndBobMeetup = function() {
	var alice = sampleCoffeeShop()
	var bob = sampleCoffeeShop()
	// to see the full distribution...
	return (alice == bob) // comment out this line
	// return {Alice: alice, Bob: bob} // and uncomment this line
}
plotDistribution(aliceAndBobMeetup)
~~~

Wow, most of the time they don't meet up, because they're not *reasoning about each other*. Let's make a new function `coordinateCoffeeShop` where Alice and Bob try to guess the other person's location and **condition** on ending up at the same place.

~~~
///fold:
var infer = function(fn) {return Infer({method: 'enumerate'}, fn)};
var plotDistribution = function(fn) {return viz.auto(infer(fn))};
///
var sampleCoffeeShop = function() {
	return categorical(
		[0.4,     0.3,     0.2,         0.1   ],
		['Bytes', 'Coupa', 'Starbucks', 'CoHo']
	)
}

var coordinateCoffeeShop = function() {
  // we don't *know* where the other person will go,
  // but we can guess, and choose our location accordingly
  var myLocation = sampleCoffeeShop()
  var theirLocation = sampleCoffeeShop()

  // YOUR CODE HERE:
  var sameLocation = ( ... )

  // make sure `sameLocation` is true.
  condition(sameLocation)

  return myLocation
}

var aliceAndBobMeetup = function() {
	var alice = coordinateCoffeeShop()
	var bob = coordinateCoffeeShop()
	// to see the full distribution...
	return (alice == bob) // comment out this line
	// return {Alice: alice, Bob: bob} // and uncomment this line
}
plotDistribution(aliceAndBobMeetup)
~~~

That's better... but Bob and Alice can do better if they reason more **recursively**.

![ever seen a reflection inside a reflection in a mirror](http://minimalmonkey.com/images/blog/junith-recursion.jpg){:width="200px"}

That is, they could realize that the *other* person is trying to reason about *them*, too. We can't quite do this forever, but we can do it a bunch of times. Bob can reason about Alice reasoning about Bob reasoning about where Alice will go (that's 3 nested inferences!).

~~~
///fold:
var infer = function(fn) {return Infer({method: 'enumerate'}, fn)};
var plotDistribution = function(fn) {return viz.auto(infer(fn))};
///
var sampleCoffeeShop = function() {
	return categorical(
		[0.4,     0.3,     0.2,         0.1   ],
		['Bytes', 'Coupa', 'Starbucks', 'CoHo']
	)
}

var coordinateCoffeeShop = function(levelOfRecursion) {
  // we don't *know* where the other person will go,
  // but we can guess, and choose our location accordingly
  var myLocation = sampleCoffeeShop()
  // recursion:
  var theirLocation = (levelOfRecursion==0 ? 
                       sampleCoffeeShop() : 
                       coordinateCoffeeShop(levelOfRecursion-1))

  // YOUR CODE HERE:
  var sameLocation = ( myLocation==theirLocation )

  // make sure `sameLocation` is true.
  condition(sameLocation)

  return myLocation
}

// try anything up to 5 (after that, it gets too slow)
var levelOfRecursion = 1

var aliceAndBobMeetup = function() {
	var alice = coordinateCoffeeShop(levelOfRecursion)
	var bob = coordinateCoffeeShop(levelOfRecursion)
	// to see the full distribution...
	return (alice == bob) // comment out this line
	// return {Alice: alice, Bob: bob} // and uncomment this line
}
plotDistribution(aliceAndBobMeetup)
~~~

**Exercise** Try changing the probabilitities in the original `sampleCoffeeShop` function. How does that effect the choices that Alice and Bob make?

## Guess 2/3 of the average

Let's play the game!

How do your expectations about other people's guesses effect your guess?

What if you *knew* everyone in the game was going to pick a perfect strategy?

