---
layout: documentation.jade
title: Reference
---

## AlgoliaSearchHelper

The `AlgoliaSearchHelper` is the main interface of the Helper library. It
lets you set the parameters for the search and retrieve information
during the search cycle with events:
 - `change`: when a parameter is set or updated
 - `search`: when the search is sent to Algolia
 - `result`: when the results are retrieved from Algolia
 - `error`: when Algolia sends back an error

You can also read the current parameters of the search using the AlgoliaSearchHelper
but it might not be the one you expect according to the last results received.

### Instanciate

{{> jsdoc jsdoc/main/algoliasearchHelper}}

### Search

Like the client, the sole purpose of the helper is to make
search query to Algolia.

There are two ways to generate a query
to Algolia.

 - The first one, using `search`, triggers the events and
all its parameters come directly from the internal search parameters
inside the Helper.
 - The second one, using `searchOnce`, is to be used
for one-shot searches that won't influence the rest of the app. It lets
you change the parameters before sending the query.

Most of the searches will be done using the first method.

{{> jsdoc jsdoc/helper/search}}
{{> jsdoc jsdoc/helper/searchOnce}}

### Query parameters shortcuts

Some query parameters are more used than others. That's why some of them have
their dedicated methods. The other parameters can still be set and get
with the [generic query parameters methods](#query-parameters).

{{> jsdoc jsdoc/helper/setQuery}}
{{> jsdoc jsdoc/helper/setIndex}}
{{> jsdoc jsdoc/helper/getIndex}}
{{> jsdoc jsdoc/helper/setPage}}
{{> jsdoc jsdoc/helper/nextPage}}
{{> jsdoc jsdoc/helper/previousPage}}
{{> jsdoc jsdoc/helper/getPage}}

### Query parameters

Those methods let you set any query parameters from Algolia. See the full
list of parameters that can be in the [rest API
documentation](https://www.algolia.com/doc/rest#query-an-index).

Before using those methods, be sure to check [the shortcuts](query-parameters-shortcuts).

{{> jsdoc jsdoc/helper/setQueryParameter}}
{{> jsdoc jsdoc/helper/getQueryParameter}}


### Conjunctive Facets

Conjunctive facets are used to filter values from a facetted
attribute. The filters set on an attribute are combined using
an `and`, hence the conjunctive adjective.

If we have a dataset of movies, and we have an array of genre for
each movie, we can then do the following:

```javascript
// helper is already configured
helper.addFacetRefinement('film-genre', 'comedy');
helper.addFacetRefinement('film-genre', 'science-fiction');

// the filters are equals to
// film-genre = comedy AND film-genre = science-fiction
```

#### Configuration

The conjunctive facets that will be used in the implementation
need to be declared at the initialization of the helper, this
way:

```javascript
var helper = AlgoliasearchHelper(client, indexName, {
  facets: ['nameOfTheAttribute']
});
```

The values that can be used for filtering are retrieved with
the answer from Algolia. They are accesisble using the
[getFacetValues](#SearchResults#getFacetValues) methods on the
[SearchResults](#SearchResults) object.

#### Methods

{{> jsdoc jsdoc/helper/clearRefinements}}
{{> jsdoc jsdoc/helper/addFacetRefinement}}
{{> jsdoc jsdoc/helper/removeFacetRefinement}}
{{> jsdoc jsdoc/helper/toggleRefinement}}
{{> jsdoc jsdoc/helper/hasRefinements}}
{{> jsdoc jsdoc/helper/getRefinements}}

### Disjunctive facets

Disjunctive facets are used to filter values from a facetted
attribute. The filters set on an attribute are combined using
an `or`, hence the disjunctive adjective.

If we have a dataset of TV's, and we have an attribute that
defines the kind of tech used, we can then do the following:

```javascript
// helper is already configured
helper.addFacetRefinement('tech', 'crt');
helper.addFacetRefinement('tech', 'led');
helper.addFacetRefinement('tech', 'plasma');

// the filters are equals to
// tech = crt OR tech = led OR tech = plasma
```

#### Configuration

The disjunctive facets that will be used in the implementation
need to be declared at the initialization of the helper, this
way:

```javascript
var helper = AlgoliasearchHelper(client, indexName, {
  disjunctiveFacets: ['nameOfTheAttribute']
});
```

The values that can be used for filtering are retrieved with
the answer from Algolia. They are accesisble using the
[getFacetValues](#SearchResults#getFacetValues) methods on the
[SearchResults](#SearchResults) object.

#### Methods

{{> jsdoc jsdoc/helper/clearRefinements}}
{{> jsdoc jsdoc/helper/addDisjunctiveFacetRefinement}}
{{> jsdoc jsdoc/helper/removeDisjunctiveFacetRefinement}}
{{> jsdoc jsdoc/helper/hasRefinements}}

### Hierarchical facets

Hierarchical facets are useful to build such navigation menus:

```sh
| products
  > fruits
    > citrus
    | strawberries
    | peaches
    | apples
```

Here, we refined the search this way:
- click on fruits
- click on citrus

#### Usage

To build such menu, you need to use hierarchical faceting:

```javascript
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [{
    name: 'products',
    attributes: ['categories.lvl0', 'categories.lvl1']
  }]
});
```

Given your objects looks like this:

```json
{
  "objectID": "123",
  "name": "orange",
  "categories": {
    "lvl0": "fruits",
    "lvl1": "fruits > citrus"
  }
}
```

And you refine `products`:

```js
helper.toggleRefinement('products', 'fruits > citrus');
```

You will get a hierarchical presentation of your facet values: a navigation menu
of your facet values.

```js
helper.on('result', function(data){
  console.log(data.hierarchicalFacets[0]);
  // {
  //   'name': 'products',
  //   'count': null,
  //   'isRefined': true,
  //   'path': null,
  //   'data': [{
  //     'name': 'fruits',
  //     'path': 'fruits',
  //     'count': 1,
  //     'isRefined': true,
  //     'data': [{
  //       'name': 'citrus',
  //       'path': 'fruits > citrus',
  //       'count': 1,
  //       'isRefined': true,
  //       'data': null
  //     }]
  //   }]
  // }
});
```

To ease navigation, we always:
- provide the root level categories
- provide the current refinement sub categories (`fruits > citrus > *`: n + 1)
- provide the parent refinement (`fruits > citrus` => `fruits`: n -1) categories
- refine the search using the current hierarchical refinement

#### Multiple values per level

Your records can also share multiple categories between one another by using arrays inside your object:

```json
{
  "objectID": "123",
  "name": "orange",
  "categories": {
    "lvl0": ["fruits", "color"],
    "lvl1": ["fruits > citrus", "color > orange"]
  }
},
{
  "objectID": "456",
  "name": "grapefruit",
  "categories": {
    "lvl0": ["fruits", "color", "new"],
    "lvl1": ["fruits > citrus", "color > yellow", "new > citrus"]
  }
}
```

#### Specifying another separator

```js
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [{
    name: 'products',
    attributes: ['categories.lvl0', 'categories.lvl1'],
    separator: '|'
  }]
});

helper.toggleRefinement('products', 'fruits|citrus');
```

Would mean that your objects look like so:

```json
{
  "objectID": "123",
  "name": "orange",
  "categories": {
    "lvl0": "fruits",
    "lvl1": "fruits|citrus"
  }
}
```

#### Specifying a different sort order for values

The default sort for the hierarchical facet view is: `isRefined:desc (first show refined), name:asc (then sort by name)`.

You can specify a different sort order by using:

```js
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [{
    name: 'products',
    attributes: ['categories.lvl0', 'categories.lvl1'],
    sortBy: ['count:desc', 'name:asc'] // first show the most common values, then sort by name
  }]
});
```

The available sort tokens are:
- count
- isRefined
- name
- path

#### Restrict results and hierarchical values to non-root level

Let's say you have a lot of levels:

```
- fruits
  - yellow
    - citrus
      - spicy
```

But you only want to get the values starting at "citrus", you can use `rootPath`

You can specify an root path to filter the hierarchical values

```
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [{
    name: 'products',
    attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3'],
    rootPath: 'fruits > yellow > citrus'
  }]
});
```

Having a rootPath will refine the results on it **automatically**.

#### Hide parent level of current parent level

By default the hierarchical facet is going to return the child and parent facet values of the current refinement.

If you do not want to get the parent facet values you can set showParentLevel to false

```js
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [{
    name: 'products',
    attributes: ['categories.lvl0', 'categories.lvl1'],
    showParentLevel: false
  }]
});
```

#### Methods 

{{> jsdoc jsdoc/helper/toggleRefinement}}
{{> jsdoc jsdoc/helper/getHierarchicalFacetBreadcrumb}}

### Facet exclusions

The facet exclusions are not a type of facets by themselves,
they are conjunctive facets. The following set of methods let
you specify wich value not to keep in the results. See the
[conjunctive facets](#conjunctive-facets) for more information
on how to configure them.

{{> jsdoc jsdoc/helper/addFacetExclusion}}
{{> jsdoc jsdoc/helper/removeFacetExclusion}}
{{> jsdoc jsdoc/helper/toggleFacetExclusion}}
{{> jsdoc jsdoc/helper/hasRefinements}}
{{> jsdoc jsdoc/helper/isExcluded}}

### Numeric filters

The numeric filters don't require any configuration. However
they require that the attribute is stored as a number in
Algolia.

{{> jsdoc jsdoc/helper/addNumericRefinement}}
{{> jsdoc jsdoc/helper/removeNumericRefinement}}
{{> jsdoc jsdoc/helper/getNumericRefinement}}

### Tag filters

The tag filters don't require any configuration. However,
they require to be stored in the `_tags` attribute in
Algolia.

{{> jsdoc jsdoc/helper/clearTags}}
{{> jsdoc jsdoc/helper/addTag}}
{{> jsdoc jsdoc/helper/removeTag}}
{{> jsdoc jsdoc/helper/toggleTag}}
{{> jsdoc jsdoc/helper/hasTag}}
{{> jsdoc jsdoc/helper/getTags}}

### State management

{{> jsdoc jsdoc/helper/getState}}
{{> jsdoc jsdoc/helper/setState}}
{{> jsdoc jsdoc/helper/overrideStateWithoutTriggeringChangeEvent}}
{{> jsdoc jsdoc/helper/getStateAsQueryString}}

### Events

{{> jsdoc jsdoc/helper/event:change}}
{{> jsdoc jsdoc/helper/event:search}}
{{> jsdoc jsdoc/helper/event:result}}
{{> jsdoc jsdoc/helper/event:error}}

## SearchResults

The SearchResults is the interface to read the results received from
Algolia search API. Most of the data is accessible directly through
properties. The exception being the data used for the features that
are implemented on top of Algolia API such as faceting.

### Results

{{> jsdoc jsdoc/results/hits}}

### Facets methods

{{> jsdoc jsdoc/results/getFacetValues}}
{{> jsdoc jsdoc/results/getFacetStats}}

### Geolocation data

{{> jsdoc jsdoc/results/aroundLatLng}}
{{> jsdoc jsdoc/results/automaticRadius}}

### Results metadata

{{> jsdoc jsdoc/results/hitsPerPage}}
{{> jsdoc jsdoc/results/nbHits}}
{{> jsdoc jsdoc/results/nbPages}}

### Parameters

{{> jsdoc jsdoc/results/index}}
{{> jsdoc jsdoc/results/query}}
{{> jsdoc jsdoc/results/page}}
{{> jsdoc jsdoc/results/parsedQuery}}

### Technical metadata

{{> jsdoc jsdoc/results/processingTimeMS}}
{{> jsdoc jsdoc/results/serverUsed}}
{{> jsdoc jsdoc/results/timeoutCounts}}
{{> jsdoc jsdoc/results/timeoutHits}}

## Types

The helper structures the way the data is sent and retrieved
from the Algolia API. Here is the list of those common structure
that you might encounter in the documentation.

{{> jsdoc jsdoc/helper/FacetRefinement}}
{{> jsdoc jsdoc/helper/NumericRefinement}}
{{> jsdoc jsdoc/results/Facet}}
{{> jsdoc jsdoc/results/HierarchicalFacet}}
{{> jsdoc jsdoc/results/FacetValue}}
{{> jsdoc jsdoc/state/FacetList}}
{{> jsdoc jsdoc/state/OperatorList}}
{{> jsdoc jsdoc/state/clearCallback}}

## SearchParameters

The SearchParameters is the class that structure all the parameters
that are needed to build a query to Algolia. It is usually reffered
as the state of the search. This state is available when receiving 
`change` and `search` events, and with `result` as a secondary
parameter.

SearchParameter is an immutable class. Each method that implies a
change of the value is actually returning a new instance, and the
previous is still the same as before the method call. The new
instance contain the change implied by the method call.

{{> jsdoc jsdoc/state/clearRefinements}}
{{> jsdoc jsdoc/state/clearTags}}
{{> jsdoc jsdoc/state/setQuery}}
{{> jsdoc jsdoc/state/setPage}}
{{> jsdoc jsdoc/state/setFacets}}
{{> jsdoc jsdoc/state/setDisjunctiveFacets}}
{{> jsdoc jsdoc/state/setHitsPerPage}}
{{> jsdoc jsdoc/state/setTypoTolerance}}
{{> jsdoc jsdoc/state/addNumericRefinement}}
{{> jsdoc jsdoc/state/getConjunctiveRefinements}}
{{> jsdoc jsdoc/state/getDisjunctiveRefinements}}
{{> jsdoc jsdoc/state/getHierarchicalRefinement}}
{{> jsdoc jsdoc/state/getExcludeRefinements}}
{{> jsdoc jsdoc/state/removeNumericRefinement}}
{{> jsdoc jsdoc/state/getNumericRefinements}}
{{> jsdoc jsdoc/state/getNumericRefinement}}
{{> jsdoc jsdoc/state/addFacetRefinement}}
{{> jsdoc jsdoc/state/addExcludeRefinement}}
{{> jsdoc jsdoc/state/addDisjunctiveFacetRefinement}}
{{> jsdoc jsdoc/state/addTagRefinement}}
{{> jsdoc jsdoc/state/removeFacetRefinement}}
{{> jsdoc jsdoc/state/removeExcludeRefinement}}
{{> jsdoc jsdoc/state/removeDisjunctiveFacetRefinement}}
{{> jsdoc jsdoc/state/removeTagRefinement}}
{{> jsdoc jsdoc/state/toggleRefinement}}
{{> jsdoc jsdoc/state/toggleFacetRefinement}}
{{> jsdoc jsdoc/state/toggleExcludeFacetRefinement}}
{{> jsdoc jsdoc/state/toggleDisjunctiveFacetRefinement}}
{{> jsdoc jsdoc/state/toggleHierarchicalFacetRefinement}}
{{> jsdoc jsdoc/state/toggleTagRefinement}}
{{> jsdoc jsdoc/state/isDisjunctiveFacet}}
{{> jsdoc jsdoc/state/isHierarchicalFacet}}
{{> jsdoc jsdoc/state/isConjunctiveFacet}}
{{> jsdoc jsdoc/state/isFacetRefined}}
{{> jsdoc jsdoc/state/isExcludeRefined}}
{{> jsdoc jsdoc/state/isDisjunctiveFacetRefined}}
{{> jsdoc jsdoc/state/isHierarchicalFacetRefined}}
{{> jsdoc jsdoc/state/isNumericRefined}}
{{> jsdoc jsdoc/state/isTagRefined}}
{{> jsdoc jsdoc/state/getRefinedDisjunctiveFacets}}
{{> jsdoc jsdoc/state/getRefinedHierarchicalFacets}}
{{> jsdoc jsdoc/state/getUnrefinedDisjunctiveFacets}}
{{> jsdoc jsdoc/state/getQueryParameter}}
{{> jsdoc jsdoc/state/setQueryParameter}}
{{> jsdoc jsdoc/state/setQueryParameters}}
{{> jsdoc jsdoc/state/filter}}
{{> jsdoc jsdoc/state/getHierarchicalFacetByName}}
{{> jsdoc jsdoc/state/make}}
{{> jsdoc jsdoc/state/validate}}