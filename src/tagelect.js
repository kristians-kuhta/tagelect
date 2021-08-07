// @babel/polyfill (ex) related stuff
//
// Needed to polyfill ECMAScript features
import 'core-js/stable';
// Needed to use transpiled generator functions
import 'regenerator-runtime/runtime';
// More info: https://babeljs.io/docs/en/babel-polyfill/

import { get } from 'axios';
import _merge from 'lodash.merge';

function Tagelect(element, options) {
  this.element = element;
  this.defaultOptions = {
    // max amount of tags that can be added
    // (it is possible it initially render more by setting input value)
    maxTags: undefined,
    maxTagsError: "can't contain more than %TAGS% tags",
    validationRegex: undefined, // the regex that is going to be used while validating a tag
    validationRegexError: 'permitted characters used', // the message shown if regexp validation fails
    noDuplicates: false, // are duplicates allowed
    noDuplicatesError: 'duplicates are not allowed', // the message shown if validations fail because of duplicates
    placeholder: 'Enter a tag...', // The placeholder for the tag entry
    removeButton: true, // Show remove button
    tagDelimiter: ',', // The delimiter used when setting form input value
    suggestionsCount: 5, // Fetch and display 5 suggestions
    suggestionHeaders: () => ({}), // Function returning headers for suggestion GET request
    suggestionsSource: null,
    // CSS classes
    classNames: {
      wrapper: 'tagelect',
      container: 'tagelect-content',
      tagInput: 'tagelect-input',
      tag: 'tagelect-tag',
      removeButton: 'tagelect-tag-remove-btn',
      tagText: 'tagelect-tag-text',
      dropdown: 'tagelect-dropdown',
      dropdownItem: 'tagelect-dropdown-item',
      dropdownItemSelected: 'tagelect-dropdown-item--selected',
      error: 'tagelect-error',
    },
  };
  this.options = _merge(this.defaultOptions, options);
  this.tags = [];
  this.suggestions = [];

  // If input has a value, try to initialize tags from it
  // by reading the value, splitting on delimiter and trimming the tag text
  if (this.element.value) {
    // Set the initial tags from hidden input value
    this.tags = this.element.value.split(this.options.tagDelimiter).map((e) => e.trim());
  }

  // Hide element
  this.element.style.display = 'none';

  // Serialize the current tags to a string (using the delimiter) and set it as input value
  function setInputValue() {
    this.element.value = this.tags.join(this.options.tagDelimiter);
  }
  this.setInputValue = setInputValue.bind(this);

  function tagelectContainerElement() {
    return this.element.parentElement.querySelector('[data-tagelect-container]');
  }
  this.tagelectContainerElement = tagelectContainerElement.bind(this);

  function setFirstSuggestion(suggestion) {
    const container = this.tagelectContainerElement();
    const tagInput = container.querySelector('[data-tagelect-tag-input]');

    if (suggestion) {
      tagInput.dataset.suggestion = suggestion.replace(tagInput.innerText, '');
    } else {
      tagInput.removeAttribute('data-suggestion');
    }
  }
  this.setFirstSuggestion = setFirstSuggestion.bind(this);

  function removeValidationErrors() {
    this.containerElement.parentElement.querySelectorAll('[data-tagelect-error]').forEach((e) => {
      e.remove();
    });
  }
  this.removeValidationErrors = removeValidationErrors.bind(this);

  function optionClasses(name) {
    return this.options.classNames[name].split(' ');
  }
  this.optionClasses = optionClasses.bind(this);

  function createTagelectElement(htmlTag, name) {
    const tagelectElement = document.createElement(htmlTag);
    const elementClasses = this.optionClasses(name);
    tagelectElement.classList.add(...elementClasses);
    tagelectElement.dataset[`tagelect${name[0].toUpperCase()}${name.slice(1)}`] = true;

    return tagelectElement;
  }
  this.createTagelectElement = createTagelectElement.bind(this);

  function buildErrorSpan(errorMessage) {
    const errorElement = this.createTagelectElement('span', 'error');
    errorElement.innerText = errorMessage;

    return errorElement;
  }
  this.buildErrorSpan = buildErrorSpan.bind(this);

  function appendError(errorMessage) {
    const errorElement = this.buildErrorSpan(errorMessage);
    this.containerElement.insertAdjacentElement('afterend', errorElement);
  }
  this.appendError = appendError.bind(this);

  function validateStuff(nextTag) {
    // Remove previous errors
    this.removeValidationErrors();
    const maxTags = parseInt(this.options.maxTags, 10);

    // Error if max tags limit reached
    if (this.options.maxTags && this.tags.length === maxTags) {
      // The maxTagsError may contain templating variable %TAGS%
      this.appendError(this.options.maxTagsError.replace('%TAGS%', maxTags));

      return false;
    }

    // Error if tag does not match validation regex
    if (this.options.validationRegex && !nextTag.match(this.options.validationRegex)) {
      this.appendError(this.options.validationRegexError);

      return false;
    }

    if (this.options.noDuplicates && this.tags.includes(nextTag)) {
      this.appendError(this.options.noDuplicatesError);

      return false;
    }

    return true;
  }
  this.validateStuff = validateStuff.bind(this);

  function renderRemoveButton() {
    const removeBtnElement = this.createTagelectElement('div', 'removeButton');
    removeBtnElement.innerText = '×'; // &times; icon
    removeBtnElement.addEventListener('click', (e) => {
      e.preventDefault();
      const tag = e.target.closest('[data-tagelect-tag]');
      const removedTagText = tag.querySelector('[data-tagelect-tag-text]').innerText;
      // Removing tag from state
      this.tags = this.tags.filter((tg) => tg !== removedTagText);
      // Clear the tag input
      this.setInputValue();
      // Remove the tag from DOM
      tag.remove();
    });
    return removeBtnElement;
  }
  this.renderRemoveButton = renderRemoveButton.bind(this);

  // Tag rendering
  function renderTag(text) {
    const container = this.tagelectContainerElement();

    // Build a tag
    const tagElement = this.createTagelectElement('div', 'tag');

    const tagTextElement = this.createTagelectElement('div', 'tagText');
    tagTextElement.innerHTML = text;
    tagElement.insertAdjacentElement('beforeend', tagTextElement);

    if (this.options.removeButton) {
      const removeButtonElement = this.renderRemoveButton();
      tagElement.insertAdjacentElement('beforeend', removeButtonElement);
    }

    const tagInput = container.querySelector('[data-tagelect-tag-input]');
    // Prepend tag to the tags
    tagInput.insertAdjacentElement('beforebegin', tagElement);
  }
  this.renderTag = renderTag.bind(this);

  function renderTags() {
    const container = this.tagelectContainerElement();
    const tagElements = container.querySelectorAll('[data-tagelect-tag]');
    // Remove previously rendered tags
    tagElements.forEach((tagElem) => tagElem.remove());

    if (this.tags.length === 0) {
      return;
    }

    this.tags.forEach((tagText) => {
      this.renderTag(tagText);
    });
  }
  this.renderTags = renderTags.bind(this);

  function focusOnTagInput() {
    const tagInput = this.containerElement.querySelector('[data-tagelect-tag-input]');
    const clickEvent = new Event('click');
    tagInput.dispatchEvent(clickEvent);
  }
  this.focusOnTagInput = focusOnTagInput.bind(this);

  function clearTagInput() {
    const tagInput = this.containerElement.querySelector('[data-tagelect-tag-input]');

    tagInput.innerHTML = '';
  }
  this.clearTagInput = clearTagInput.bind(this);

  function toggleDropdown(show) {
    const prevDropdown = document.querySelector('[data-tagelect-dropdown]');
    // Remove previous dropdown
    if (prevDropdown) {
      prevDropdown.remove();
    }

    if (!show) {
      return;
    }

    // Else re-build a new dropdown
    const dropdownElement = document.createElement('ul');
    dropdownElement.classList.add(...this.options.classNames.dropdown.split(' '));
    dropdownElement.dataset.tagelectDropdown = true;
    this.suggestions.forEach((suggestion, idx) => {
      const itemElement = document.createElement('li');
      itemElement.classList.add(...this.options.classNames.dropdownItem.split(' '));
      itemElement.dataset.tagelectDropdownItem = true;
      if (idx === 0) {
        itemElement.classList.add(...this.options.classNames.dropdownItemSelected.split(' '));
      }
      itemElement.innerText = suggestion;
      itemElement.addEventListener('click', (e) => {
        if (!this.validateStuff(e.target.innerText)) {
          return;
        }

        this.tags.push(e.target.innerText);
        this.renderTags();
        this.setInputValue();
        this.clearTagInput();
        this.focusOnTagInput();
        this.toggleDropdown(false);
      });
      dropdownElement.insertAdjacentElement('beforeend', itemElement);
    });
    this.containerElement.insertAdjacentElement('afterend', dropdownElement);
  }
  this.toggleDropdown = toggleDropdown.bind(this);

  function fetchSuggestions(searchPhrase) {
    const count = this.options.suggestionsCount;
    if (!this.options.suggestionsSource) {
      return;
    }

    const url = `${this.options.suggestionsSource}?name=${searchPhrase}&count=${count}`;
    const headers = this.options.suggestionHeaders();

    get(url, { headers }).then((response) => {
      this.suggestions = response.data === null ? [] : response.data;
      if (this.suggestions.length > 0) {
        this.setFirstSuggestion(this.suggestions[0]);
      }
      // If no suggestions found - don't show dropdown
      this.toggleDropdown(this.suggestions.length > 0);
    })
      .catch(() => {
        this.setFirstSuggestion(null);
        this.toggleDropdown(false);
      });
  }
  this.fetchSuggestions = fetchSuggestions.bind(this);

  // Render initial tagelect elements
  this.wrapperElement = document.createElement('div');
  this.wrapperElement.setAttribute('tabindex', '-1');
  this.wrapperElement.classList.add(...this.options.classNames.wrapper.split(' '));
  this.wrapperElement.dataset.tagelectWrapper = true;
  // Track if mouse is in container (used for during blur event handling)
  this.wrapperElement.addEventListener('mouseover', () => {
    this.mouseOverContainer = true;
  });

  this.wrapperElement.addEventListener('mouseout', () => {
    this.mouseOverContainer = false;
  });

  this.containerElement = document.createElement('div');
  this.containerElement.dataset.tagelectContainer = true;
  this.containerElement.classList.add(...this.options.classNames.container.split(' '));

  // Render the input field for entering tags
  const tagInputElement = document.createElement('span');
  tagInputElement.classList.add(...this.options.classNames.tagInput.split(' '));
  tagInputElement.dataset.tagelectTagInput = true;
  tagInputElement.setAttribute('contenteditable', true);
  tagInputElement.dataset.placeholder = this.options.placeholder;
  tagInputElement.style.minWidth = `${this.options.placeholder.length * 6}px`;

  tagInputElement.addEventListener('blur', () => {
    const dropdown = document.querySelector('[data-tagelect-dropdown]');
    // Do nothing unless dropdown is open
    if (!dropdown) {
      return;
    }

    // If mouse is outside of the whole container
    if (!this.mouseOverContainer) {
      this.setFirstSuggestion(null);
      this.toggleDropdown(false);
    }
  });

  // Process the keydown events for tag input
  tagInputElement.addEventListener('keydown', (e) => {
    // Add the suggestion as tag -> if Tab is pressed while there is a suggestion
    if (e.key === 'Tab' && e.target.innerText.length > 0 && this.suggestions.length > 0) {
      e.preventDefault();
      const tagText = this.suggestions[0];

      if (!this.validateStuff(tagText)) {
        return;
      }
      this.tags = this.tags.concat(tagText);
      this.renderTags();
      this.setInputValue();
      this.clearTagInput();
      this.suggestions = [];
      this.toggleDropdown(false);
      this.focusOnTagInput();
    }

    // Add tag -> if Enter pressed in non-empty input
    if ((e.key === 'Enter' || e.key === ',') && e.target.innerText.length > 0) {
      e.preventDefault();
      if (!this.validateStuff(e.target.innerText)) {
        return;
      }
      this.tags = this.tags.concat(e.target.innerText);
      this.renderTags();
      this.setInputValue();
      this.clearTagInput();
      this.suggestions = [];
      this.toggleDropdown(false);
      this.focusOnTagInput();
      return;
    }

    // Close dropdown -> if no tags and tag input is cleared
    if (e.key === 'Backspace' && e.target.innerText.length === 1 && this.tags.length === 0) {
      this.removeValidationErrors();
      this.toggleDropdown(false);
      return;
    }

    // Remove last tag -> if Backspace pressed in empty tag input
    if (e.key === 'Backspace' && e.target.innerText.length === 0 && this.tags.length > 0) {
      this.removeValidationErrors();
      this.tags.pop();
      this.setInputValue();
      this.renderTags();
      return;
    }

    // Do nothing -> if Enter pressed in empty tag input
    if (e.key === 'Enter' && e.target.innerText.length === 0) {
      e.preventDefault();
    }

    const alphanumeric = e.key.match(/^\w$/);

    // Update tag input and fetch suggestions -> if alphanum. entered or char deleted
    //
    // NOTE: The event hasn't changed the innerText yet, so we have to check for length > 1
    if (alphanumeric || (e.key === 'Backspace' && e.target.innerText.length > 1)) {
      const tagInput = this.containerElement.querySelector('[data-tagelect-tag-input]');
      const newText = e.key === 'Backspace' ? tagInput.innerText.slice(0, -1) : tagInput.innerText + e.key;

      if (!this.validateStuff(newText)) {
        return;
      }
      this.fetchSuggestions(newText);
    }

    if (e.key === 'Backspace' && e.target.innerText.length === 1) {
      this.removeValidationErrors();
      this.toggleDropdown(false);
    }
  });

  // Add elements to DOM
  this.containerElement.insertAdjacentElement('beforeend', tagInputElement);
  this.wrapperElement.insertAdjacentElement('beforeend', this.containerElement);
  this.element.insertAdjacentElement('beforebegin', this.wrapperElement);

  // Render the initial tags
  this.renderTags();
}

export default Tagelect;
