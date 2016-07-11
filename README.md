# UberToggler

Generic toggle component.

## What does it do?

### Toggle

In its simplest form a Toggle is something which can be on or off, like a light.

### Trigger

A Trigger is a Toggle which also can change the state of another Toggle or multiple Toggles. Think of it as a
lightswitch: the switch itself can be on or off, but the light it triggers can be on or off as well.

### But that's not all

Toggles can be:

- combined
- grouped
- used as dialogs/modals
- etc. etc.

#### What can be a Trigger?

Almost anything can be a Trigger: a link, a button, an input-element. Anything which you can bind a JavaScript-event to
can be used as a Trigger. It is recommended to use only focusable elements though!

## Library

### Toggle

The most basic Toggle. Can be on or off and that's pretty much it.

### Trigger

The default Trigger. Can activate itself and one or more Toggles. Most of the time this should be a `button`-element.

### Trigger Input

This module is used for `radio`-inputs and `checkbox`-es. Again, these are Triggers which can control one or more Toggles. When checked/selected the related Toggle(s) are activated.

### Trigger Select

This module is used for the `select`-element. Again, this Trigger can control one or more Toggles. On change the Toggle targetted by the currently selected option is activated.

### Trigger Link

This module is used for anchors. When clicked the hash in the URL gets updated and the related Toggle is updated. Additional toggles can be configured via the `aria-controls`-attribute.

### Toggle Group

A Toggle Group is a group of Toggles. In a Toggle Group only one Toggle can be active at a given time. You can
use this to create components like accordions, tabs, dropdown-menus etc. etc.

## Utils

### Mediator

Basic implementation of the [Mediator](https://carldanley.com/js-mediator-pattern/) pattern.

### Focus

Small utility to contain or exclude a node and its children from receiving focus from keyboard-users.


### $$

Shortcut for casting a NodeList to an array.

```$$(selector, context)```

## How it works

1. Initialize all Toggles
2. When Toggles are initialized, find Triggers for each Toggle
3. When a Trigger is triggered, it throws a trigger-event
4. All Toggles listen to the trigger-event.
5. When the trigger-event contains a Toggle in its targets-property, the Toggle changes its state.
6. When a Toggle changes its state, it throws a Toggle event.
7. Triggers listen for the Toggle event. This makes sure that Toggle and Triggers are always in sync.

## How to use it

Initialize the Toggles in any way you want.

### Options/settings

Every Toggle can be configured to have specific behaviour. This behaviour can be configured in various ways:

1. By passing an object to the constructor.
2. By setting `data-*`-attributes on the node your adding Toggle-behaviour to (e.g. `data-outside`).
3. The default settings for a toggle.

#### Grouping Toggles together

To create a group of Toggles, use the `group`-option on every Toggle you want to include in the Group.

When you have a Group which should -always- have an active Toggle (e.g. a tab control) use the `group-default`-option.

| Key             | Default value | Expected value |
|-----------------|---------------|----------------|
| `group`         | false         | string         |
| `group-default` | false         | boolean        |

#### Focus

It is possible to automatically set focus to an element when it is activated. Use the `focus`-option to do this.

| Key           | Default value | Expected value |
|---------------|---------------|----------------|
| `focus`       | false         | boolean        |

#### Focus containment

It is possible to trap the focus inside a Toggle when it is active. Use the `focusContain`-option to do this. When the Toggle is active, the user will only be able to click and tab within the context of the Toggle.

| Key            | Default value | Expected value |
|----------------|---------------|----------------|
| `focusContain` | false         | boolean        |

#### Focus excludement

The reverse of the Focus Containment option described above. Use the `focusExclude`-option to do this. When this option is active, the element and its children will be excluded from the focus-flow/order when the Toggle is not active.

| Key            | Default value | Expected value |
|----------------|---------------|----------------|
| `focusExclude` | false         | boolean        |


#### Close when outside

Sometimes you might want to close a Toggle when the user is no longer focussed on it, e.g. a Tooltip should be closed when a user clicks somewhere else.

To implement this behaviour use the `outside`-option.

| Key              | Default value | Expected value |
|------------------|---------------|----------------|
| `outside`        | false         | string        |

Possible values:

| Value         | Result
|---------------|-----------------------------------------|
| empty   | Toggle gets closed when clicked outside.      |
| `click` | Toggle gets closed when clicked outside.      |
| `mouse` | Toggle gets closed when mouse leaves element. |
| `both`  | Shorthand for `click` and `mouse`             |


### Target Toggles with a Trigger

By default we use the `href`-attribute, as most of the time you'll want to use an anchor. On elements which don't have an href, use the `aria-controls`-attribute with the id(s) of the Toggle(s) you want to target as its value.

#### Target multiple Toggles with one Trigger

Simply use the `aria-controls`-attribute with a space separated list of ID's of the Toggles you want to target.

### States

As said before, a Toggle can be on or off. We call this an activated or a deactivated state. These states can be set in three ways:

#### aria-hidden

The `aria-hidden`attribute must contain a boolean. This determines if an element is hidden from the user - not only in a visual way, but also when using other means of navigation.

#### aria-disabled

The `aria-disabled` attribute must contain a boolean. This determines if an element is perceivable, but not editable or otherwise operable.

#### Default

When the above scenarios don't match your requirements, this is the default. We use a simple `data-state`-attribute with a boolean-value. This has no semantic value.