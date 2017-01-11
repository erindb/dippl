---
layout: update
title: Why use KL divergence when speaker has uncertainty?
description: In some cases, the speaker will communicate about the prior rather than about what they know.
---

## Motivation

Sometimes in RSA, speaker utility is proportional to the listener guessing the exact same world as the speaker believes. But sometimes the speaker doesn't know. In this situation, the speaker's utility should instead be to minimize the divergence between their beliefs and the listener's updated beliefs. In situation 1, the speaker has uncertainty and uses the matching utility function. Bad things happen. In situation 2, the speaker has uncertainty, but because certain conditions are met, the effect of that uncertainty is marginalized out.

## Situation 1

~~~
var priorA = function() { return flip(0.5); };
var priorB = function() { return flip(0.8); };

var observations = {A: true};

var utterancePrior = function() {
  return uniformDraw(["A is more likely than not", "B", "!A", "!B"]);
};

var listener = function(utterance) {
  return Infer({method: "enumerate"}, function() {
    var A = priorA();
    var B = priorB();
    
    if (utterance=="A is more likely than not") {
      factor( A ? 0 : -0.1);
    } else if (utterance=="B") {
      condition(B);
    } else if (utterance=="!A") {
      condition(!A);
    } else if (utterance=="!B") {
      condition(!B);
    } else { display("oops"); }
    
    var worldState = {A: A, B: B};
    return worldState;
  });
};

var speaker = Infer({method: "enumerate"}, function() {
  
  var utterance = utterancePrior();
  
  // infer world state given observations
  var A = priorA();
  var B = priorB();
  if (observations.A) { condition(A==observations.A) }
  if (observations.B) { condition(B==observations.B) }
  var worldState = {A: A, B: B};
  
  // condition on listener inferring the same world
  var interpretation = listener(utterance);
  factor(interpretation.score(worldState))
                    
  return utterance;
});

viz.auto( listener("A is more likely than not") );
viz.auto( listener("B") );

viz.auto( speaker );
~~~

