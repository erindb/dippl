---
layout: update
title: Explanations Update 2016.07.12
description: Sources of uncertainty in explanations
---

## Motivation

"B because A" is an utterance. We should be able to articulate a semantics for it:

> Given this actual state of the world, counterfactually if A had been false, then B would have been false.

We have a model of counterfactual reasoning that can determine the probability of B (the explanandum) being false given that A (the explanans) is false.

How do we use this **probability** to get a **truth value** for a particular world state? Do we sample a truth value with that probability? Do we use a lifted threshold semantics on that probability?

And what are the variables whose posterior distributions are updated when an explanation is interpreted? We know that "B because A" means something more than "B and A", so there must be **other variables** beyond A and B that are being communicated. What are these other variables?

## Sources of uncertainty

Explanations like "B because A" might update the posterior distributions of...

1. A rich set of unmentioned observable variables (C, D, E, F, G, ...)
2. The future values of A and B (generalizing from this context to other contexts, "explanation for exportability")
3. Parameters of the causal structure of the world, e.g.
	* The existence of a causal connection between each pair of variables
	* The direction of the causal connections
	* Strengths of the causal connections
	* Background probabilities of all variables

Here are some potential problems with the causal structure:

The parameters of the causal structure of the world are not independent of one another, so when we counterfactualize, we should probably sample a model at uniform from the space of all possible parameters.

But when we do that, here's another problem: when we evaluate the truth of a counterfactual statement, the causal relationships need to stay in place, at least to some extent. Otherwise they couldn't communicate much about those causal relationships, could they? Hopefully, the stickiness of the model parameters to the actual world is enough.

## Semantics

Since I have the intuition that "B because A" can communicate "There is a causal relationship between A and B," let's start with that as our source of uncertainty.

For starters, let's have B true if and only if there's a causal link between the two variables *and* A happens to be true.

~~~
// if A and B are causally connected,
// then B is true whenever A is.
// otherwise, B is false.
var latentsModel = function() {
	return {
		model: uniformDraw(["A->B", "A,B"]),
		A: flip()
	};
};

var statesModel = function(latents) {
	var A = latents.A;
	var B = latents.model=="A->B" ? A : false;
	var connected = latents.model=="A->B";
	return { A: A, B: B, connected: connected };
};
///fold:
	var infer = function(fn) {return Infer({method: 'enumerate'}, fn); };
	viz.auto(infer(function() {
		var latents = latentsModel();
		var states = statesModel(latents);
		return states;
	}));
///
~~~

When the variables are connected, B is true exactly when A is true. When they are not connected, B is always false. A is true half the time always.

Given this model, and assuming that both A and B are true in the actual world (and therefore they must be causally connected) let's look at two utterances: "if not A then not B" and "if not B then not A".

~~~
///fold:
	// if A and B are causally connected,
	// then B is true whenever A is.
	// otherwise, B is false.
	var latentsModel = function() {
		return {
			model: uniformDraw(["A->B", "A,B"]),
			A: flip()
		};
	};

	var statesModel = function(latents) {
		var A = latents.A;
		var B = latents.model=="A->B" ? A : false;
		var connected = latents.model=="A->B";
		return { A: A, B: B, connected: connected };
	};

	var infer = function(fn) {return Infer({method: 'enumerate'}, fn); };
	var probTrue = function(dist) {
		return Math.exp(dist.score(true));
	};

	var counterfactualizeLatents = function(model, actual) {
		var s = 0.53; //stickiness
		var totallyDifferent = model();

		return mapObject(function(key, value) {
			return flip(s) ? actual[key] : totallyDifferent[key];
		}, actual);
	};

	var counterfactually = function(args) {
		var ifVariable = args.ifVariable;
		var hadBeen = args.hadBeen;
		var thenVariable = args.thenVariable;
		var wouldHaveBeen = args.wouldHaveBeen;
		var specifiedLatents = args.givenActualLatents;
		var specifiedStates = args.givenActualStates;
		return infer(function() {

			var actulLatents = specifiedLatents ? specifiedLatents : latentsModel();
			var actualStates = statesModel(actulLatents);
			if (specifiedStates) {
				condition(_.isEqual(specifiedStates, actualStates));
			}

			var cfLatents = counterfactualizeLatents(latentsModel, actulLatents);
			var cfStates = statesModel(cfLatents);
			condition(cfStates[ifVariable]==hadBeen);
			return cfStates[thenVariable]==wouldHaveBeen
		});
	};
///
var actualWorld = {A: true, B: true, connected: true};
print("if not A then not B:")
viz.table(counterfactually({
	ifVariable: 'A',
	hadBeen: false,
	thenVariable: 'B',
	wouldHaveBeen: false,
	givenActualStates: actualWorld
}));
print("if not B then not A:")
viz.table(counterfactually({
	ifVariable: 'B',
	hadBeen: false,
	thenVariable: 'A',
	wouldHaveBeen: false,
	givenActualStates: actualWorld
}));
~~~

There is an asymmetry between "if not A then not B" and "if not B then not A". The former is true for all counterfactual worlds. The latter is true for most but not all counterfactual worlds.

As a function on the actual world, `{A: true, B: true, connected: true}`, this counterfactualization returns a real number, not a single truth value. When should "if not A then not B" be literally true? We could sample a truth value, or use a lifted threshold semantics.

I should note that any semantics here is going to be a bit strange. Under this model, the fact that A and B are connected is identical to the fact that B is true, in terms of information content. Unfortunately, because we don't know what kinds of uncertainty are at play, it's hard to construct a minimal example that isn't obviously deficient in some way. I think this one will not be helpful, because B is so likely to be false all the time...

<!-- ## Sample a truth value

If you're like me, you think that if a speaker says "if not A then not B" in order to address the question, "Are A and B causally connected?" a listener should infer that A and B are causally connected.

~~~
///fold:
	// if A and B are causally connected,
	// then B is true whenever A is.
	// otherwise, B is false.
	var latentsModel = function() {
		return {
			model: uniformDraw(["A->B", "A,B"]),
			A: flip()
		};
	};

	var statesModel = function(latents) {
		var A = latents.A;
		var B = latents.model=="A->B" ? A : false;
		var connected = latents.model=="A->B";
		return { A: A, B: B, connected: connected };
	};

	var infer = function(fn) {return Infer({method: 'enumerate'}, fn); };
	var probTrue = function(dist) {
		return Math.exp(dist.score(true));
	};

	var counterfactualizeLatents = function(model, actual) {
		var s = 0.53; //stickiness
		var totallyDifferent = model();

		return mapObject(function(key, value) {
			return flip(s) ? actual[key] : totallyDifferent[key];
		}, actual);
	};

	var counterfactually = function(args) {
		var ifVariable = args.ifVariable;
		var hadBeen = args.hadBeen;
		var thenVariable = args.thenVariable;
		var wouldHaveBeen = args.wouldHaveBeen;
		var specifiedLatents = args.givenActualLatents;
		var specifiedStates = args.givenActualStates;
		return infer(function() {

			var actulLatents = specifiedLatents ? specifiedLatents : latentsModel();
			var actualStates = statesModel(actulLatents);
			if (specifiedStates) {
				condition(_.isEqual(specifiedStates, actualStates));
			}

			var cfLatents = counterfactualizeLatents(latentsModel, actulLatents);
			var cfStates = statesModel(cfLatents);
			condition(cfStates[ifVariable]==hadBeen);
			return cfStates[thenVariable]==wouldHaveBeen
		});
	};

	var literal = function(utterance) {
		return infer(function() {
			var latents = latentsModel();
			var states = statesModel(latents);
			if (utterance=="if not A then not B") {
				condition(sample(counterfactually({
					ifVariable: "A",
					hadBeen: false,
					thenVariable: "B",
					wouldHaveBeen: false,
					givenActualStates: states
				})));
			} else if (utterance=="if not B then not A") {
				condition(sample(counterfactually({
					ifVariable: "B",
					hadBeen: false,
					thenVariable: "A",
					wouldHaveBeen: false,
					givenActualStates: states
				})));
			} else if (utterance=="") {
				// no conditioning here
			} else {
				print("error 184: not a valid utterance");
			}
		});
	};
///
literal("if not A then not B");
~~~

## Lifted threshold

~~~
~~~ -->

<!-- 

One intuitive QUD for explanations is the causal structure of the world. This includes:

* The existence of a causal connection between each pair of variables
* The direction of the causal connections
* Strengths of the causal connections
* Background probabilities of all variables

The parameters of the causal structure of the world are not independent of one another, so when we counterfactualize, we should probably sample a model at uniform from the space of all possible parameters.

But here's a problem: when we evaluate the truth of a counterfactual statement, the causal relationships need to stay in place, at least to some extent. Otherwise they couldn't communicate much about those causal relationships. Or could they...?

#### Communicating causal models

Let's say there are two variables, A and B. They are either causally connected or they are not. If they are causally connected, then B is deterministically true whenever A is. Otherwise, B is always false.

~~~
// are A and B causally connected?

// if A and B are causally connected,
// then B is true whenever A is.
// otherwise, B is false.
var latentsModel = function() {
	return {
		model: uniformDraw(["A->B", "A,B"]),
		A: flip()
	};
};

var statesModel = function(latents) {
	var A = latents.A;
	var B = latents.model=="A->B" ? A : false;
	var connected = latents.model=="A->B";
	return { A: A, B: B, connected: connected };
};

///fold:
	var infer = function(fn) {return Infer({method: 'enumerate'}, fn); };
	var counterfactualizeLatents = function(model, actual) {
		var s = 0.53; //stickiness
		var totallyDifferent = model();

		return mapObject(function(key, value) {
			return flip(s) ? actual[key] : totallyDifferent[key];
		}, actual);
	};

	var counterfactually = function(args) {
		var ifVariable = args.ifVariable;
		var hadBeen = args.hadBeen;
		var thenVariable = args.thenVariable;
		var wouldhaveBeen = args.wouldhaveBeen;
		var givenActualLatents = args.givenActualLatents;
		var givenActualStates = args.givenActualStates ? args.givenActualStates : statesModel(givenActualLatents);
		return infer(function() {
			var cfLatents = counterfactualizeLatents(latentsModel, givenActualLatents);
			var cfStates = statesModel(cfLatents);
			condition(cfStates[ifVariable]==hadBeen);
			return cfStates[thenVariable]==wouldhaveBeen
		});
	};

	var probTrue = function(dist) {
		return Math.exp(dist.score(true));
	};

	print("How likely is 'If not A, then not B' to be true in a world where...");

	print("both are true and connected: " + probTrue(counterfactually({
		ifVariable: "A",
		hadBeen: false,
		thenVariable: "B",
		wouldhaveBeen: false,
		givenActualLatents: {model: "A->B", A: true}
	})));

	print("both are true and NOT connected: " + probTrue(counterfactually({
		ifVariable: "A",
		hadBeen: false,
		thenVariable: "B",
		wouldhaveBeen: false,
		givenActualLatents: {model: "A,B", A: true}
	})));

	print("How likely is 'If not B, then not A' to be true in a world where...");

	print("both are true and connected: " + probTrue(counterfactually({
		ifVariable: "B",
		hadBeen: false,
		thenVariable: "A",
		wouldhaveBeen: false,
		givenActualLatents: {model: "A->B", A: true}
	})));

	print("both are true and NOT connected: " + probTrue(counterfactually({
		ifVariable: "B",
		hadBeen: false,
		thenVariable: "A",
		wouldhaveBeen: false,
		givenActualLatents: {model: "A,B", A: true}
	})));
///
~~~ -->

<!--
Here either B is true whenever A is true, or B is false. In this situation, "A because B" is more likely to be true of the actual world where both are true than "B because A" is.

This asymmetry remains when B has a low-valued background probability of occurring regardless of A's value.

~~~
// add a background probability for B.
// are A and B causally connected?

// if A and B are causally connected,
// then B is true whenever A is.
// otherwise, B is false.
var latentsModel = function() {
	return {
		model: uniformDraw(["A->B", "A,B"]),
		A: flip(),
		Bbackground: flip(0.1)
	};
};

var statesModel = function(latents) {
	var A = latents.A;
	var B = (latents.model=="A->B") ? (A || latents.Bbackground ? true : false) : (latents.Bbackground ? true : false);
	var connected = latents.model=="A->B";
	return { A: A, B: B, connected: connected };
};

///fold:
	var infer = function(fn) {return Infer({method: 'enumerate'}, fn); };

	var counterfactualizeLatents = function(model, actual) {
		var s = 0.53; //stickiness
		var totallyDifferent = model();

		return mapObject(function(key, value) {
			return flip(s) ? actual[key] : totallyDifferent[key];
		}, actual);
	};

	var counterfactually = function(args) {
		var ifVariable = args.ifVariable;
		var hadBeen = args.hadBeen;
		var thenVariable = args.thenVariable;
		var wouldhaveBeen = args.wouldhaveBeen;
		return infer(function() {

			var actulLatents = args.givenActualLatents ? args.givenActualLatents : latentsModel();
			var actualStates = statesModel(actulLatents);
			if (args.givenActualStates) {
				condition(_.isEqual(args.givenActualStates, actualStates));
			}

			var cfLatents = counterfactualizeLatents(latentsModel, actulLatents);
			var cfStates = statesModel(cfLatents);
			condition(cfStates[ifVariable]==hadBeen);
			return cfStates[thenVariable]==wouldhaveBeen
		});
	};

	print("If not A then not B (when connected)");
	viz.auto(counterfactually({
		ifVariable: "A",
		hadBeen: false,
		thenVariable: "B",
		wouldhaveBeen: false,
		givenActualStates: {connected: true, A: true, B: true}
	}));
	print("If not A then not B (when not connected)");
	viz.auto(counterfactually({
		ifVariable: "A",
		hadBeen: false,
		thenVariable: "B",
		wouldhaveBeen: false,
		givenActualStates: {connected: false, A: true, B: true}
	}));
	print("If not B then not A (when connected)")
	viz.auto(counterfactually({
		ifVariable: "B",
		hadBeen: false,
		thenVariable: "A",
		wouldhaveBeen: false,
		givenActualStates: {connected: true, A: true, B: true}
	}));
	print("If not B then not A (when not connected)")
	viz.auto(counterfactually({
		ifVariable: "B",
		hadBeen: false,
		thenVariable: "A",
		wouldhaveBeen: false,
		givenActualStates: {connected: false, A: true, B: true}
	}));
///
~~~

When we increase the background probability for B, "if not A then not B" becomes mostly false, because the probability of B being false across all counterfactual worlds goes down. However, the statement is *more appropriate* when there is a causal connection between the variables. As a result, "B 'cause A" can communicate a causal connection even when the background probability of B is quite high.

~~~
"i need to prove that statement."
~~~ -->

<!-- Counterfactualization when causal structure is held constant lets us see the causal relationships between variables in a way that statistical correlation ... -->