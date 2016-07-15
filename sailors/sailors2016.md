---
layout: sailors-tutorial
title: SAILORS 2016 Tutorial
description: Examples of recursive inference from game theory.
---

## Start up

In this tutorial, we're going to use a language called WebPPL (pronouced "web people"). PPL stands for **probabilistic programming language**. WebPPL is a **dialect** of JavaScript, so if you've coded in JavaScript before, a lot of things will be familiar. (There are also a lot of similarities ot python.) But WebPPL has some restrictions and some added functionality to handle **probabilities** in cool ways. We'll run code boxes like the one below in this tutorial.

Click "run" to load the WebPPL language on this page.

~~~~
"start WebPPL"
~~~~

## Introduction

<!-- we actually will go after Noah's talk, so that helps! -->

Inductive reasoning is a type of reasoning in which the conclusions that are reached are probable (rather than certain) based on the evidence provided. The premises act as evidence for the validity of the conclusions, but this type of reasoning is inherently uncertain and thus the conclusions are merely probable to some degree - and may still be false. Probability theory (e.g. Bayes' rule) is one example of inductive reasoning.

Humans beings live in an uncertain world where things are constantly changing and unknown. We have to reason inductively about the world and about each other. We can use probabilistic models to understand how people make inferences and decisions under uncertainty.

In our examples, we will use Bayesian inference to run simulations of popular game theory games that require agents to reason about other agents. As we will see, we can use nested inference to capture some interesting properties about these games and do even better.

## Let's play some games

### Prisoner's Dilemma

Player 1 and Player 2 have both been arrested and are facing a long stint in jail. The prosecutors lack sufficient evidence to convict them of the main charge without further evidence, so they simultaneously offer both prisoners a bargain: 

1. If Player 1 and Player 2 each testify against the other, each of them serves 5 years in prison.

2. If one of them betrays the other while the other remains silent, the betrayer will be set free while the betrayed will serve 10 years in prison. 

3. If Player 1 and Player 2 both remain silent, both of them will only serve 2 years in prison (on lesser charges).

Player 1 and Player 2 are both in solitary confinement and have no means of communication. <!-- What should they do? -->

**Discuss** What factors might affect this decision?

<!-- **Discuss** Now imagine that Alice and Bob play the prisoner's dilemma more than once in succession. How should their strategy change? This is called the **iterated prisoner's dilemma**.

**Discuss**  -->

### Guess 2/3 the average

Everyone in the room picks a real number between 0 and 100, inclusive. We'll average all the numbers. Whoever chose the number closes to 2/3 of that average wins.

**Exercise** Write a program that determines 2/3 of the average of a list of numbers:

~~~
var allNumbers = []

var twoThirdsOfAverage = ...

display(twoThirdsOfAverage)
~~~

Let's play the game!

**Discuss** How do your expectations about other people's guesses effect your guess?

**Discuss** What if you *knew* everyone in the game was going to pick a perfect strategy?

### Coordination Games

For the next three questions, when we say to, read the question and write down your answer without talking with anyone!

**Question 1** Imagine that you and all the other SAILORS students are going to play a game. We'll drop all of you off in different places in New York City and we'll give you a specific day and time at which you all have to meet up. YOU CANNOT CONTACT EACH OTHER BEFORE YOU MEET UP. Where in the city will you try to meet? Remember, you win the game if you write down *the same answer* as the other students.
{: .click2seeQn #qn1}

**Question 2** What if we didn't tell you the time, but we told you the day and the place. What time would you all meet there? Remember, you win the game if you write down *the same answer* as the other students.
{: .click2seeQn #qn2}

**Question 3** Imagine you're all going to play a lottery game. In this game, you write down an amount of money. If you *all* pick the same amount of money, you actually get that amount of money as a prize. Otherwise, no one gets any money. It could be *any* amount, but you all have to pick the same amount to win and you cannot discuss your answer with each other. Remember, you win the game if you write down *the same answer* as the other students.
{: .click2seeQn #qn3}

**Discuss** What are some things you thought about when making your decision?

## Making a model

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

// They each think about each other

// alice thinks of a random coffee shop
// but only goes there if she thinks there's a
// relatively high probability that bob will also be there
var aliceLocation = function() {
  var alice = sampleCoffeeShop()
  var pretendBob = sampleCoffeeShop()
  
  condition(alice == pretendBob)
  
  return alice
}

// bob does the same thing
var bobLocation = function() {
  var bob = sampleCoffeeShop()
  var pretendAlice = sampleCoffeeShop()
  
  condition(bob == pretendAlice)
  
  return bob
}

var aliceAndBobMeetup = function() {
	var alice = aliceLocation()
	var bob = bobLocation()
	// to see the full distribution...
	// return (alice == bob) // comment out this line
	return {Alice: alice, Bob: bob} // and uncomment this line
}
plotDistribution(aliceAndBobMeetup)
~~~

That's better... but Bob and Alice can do better if they reason more **recursively**.

![ever seen a reflection inside a reflection in a mirror](http://minimalmonkey.com/images/blog/junith-recursion.jpg){:width="200px"}

Recursion is what happens when a function (or a story, or an image) references itself. So you end up with a function inside a function inside a function inside a function...

![or a story embedded in a story embedded in a story...](http://atlasofscience.org/wp-content/uploads/2015/11/Fig-1-Coolidge.gif){:width="400px"}

If Alice and Bob could were reasoning recursively, they could realize that the *other* person is trying to reason about *them*, too. We can't quite do this forever, but we can do it a bunch of times. Alice can reason about Bob reasoning about Alice reasoning about where Bob will go (that's 3 nested inferences!).

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

  var sameLocation = ( myLocation==theirLocation )
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

**Exercise** Try changing the `levelOfRecursion`. What happens? Why?

**Exercise** Try changing the probabilitities in the original `sampleCoffeeShop` function. How does that effect the choices that Alice and Bob make?

## References

Here are some applications of nested inductive reasoning models like the one we talked about:

**Language understanding**

Kao, J. T., Bergen, L., & Goodman, N. D. (2014). [Formalizing the pragmatics of metaphor understanding](http://cocolab.stanford.edu/papers/KaoEtAl2014-Cogsci.pdf). In Proceedings of the 36th annual meeting of the Cognitive Science Society (pp. 719-724).

Goodman, N. D., & Stuhlmüller, A. (2013). [Knowledge and implicature: Modeling language understanding as social cognition](https://web.stanford.edu/~ngoodman/papers/KnowledgeImplicature-v2.pdf). Topics in cognitive science, 5(1), 173-184.

Frank, M. C., & Goodman, N. D. (2012). [Predicting pragmatic reasoning in language games](https://web.stanford.edu/~ngoodman/papers/FrankGoodman-Science2012.pdf). Science, 336(6084), 998-998.

**Game theory**

Frey, S., & Goldstone, R. L. (2013). [Cyclic game dynamics driven by iterated reasoning](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0056416). PloS one, 8(2), e56416.