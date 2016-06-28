---
layout: default
title: WebPPL Pages
---

<div class="main">
  <h1>WebPPL Pages</h1>
  <span class="authors">Erin Bennett</span>
</div>

**About:** 
My fork of [dippl.org](dippl.org).

{% assign sorted_pages = site.pages | sort:"name" %}

### Chapters

{% for p in sorted_pages %}
    {% if p.layout == 'sailors-tutorial' %}
- [{{ p.title }}]({{ site.baseurl }}{{ p.url }})<br>
    <em>{{ p.description }}</em>
    {% endif %}
{% endfor %}
