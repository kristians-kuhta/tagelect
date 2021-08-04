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
    noDuplicatesMessage: 'duplicates are not allowed', // the message shown if validations fail because of duplicates
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

  // Mouse position will be continuously tracked and stored in these 2 variables
  this.mouseX = undefined;
  this.mouseY = undefined;

  if (this.element.value) {
    // Set the initial tags from hidden input value
    this.tags = this.element.value.split(',').map((e) => e.trim());
  }

  // Hide element
  this.element.style.display = 'none';

  // Serialize the tags to the actual form input value
  function setInputValue() {
    this.element.value = this.tags.join(this.options.tagDelimiter);
  }
  this.setInputValue = setInputValue.bind(this);

  function setFirstSuggestion(suggestion) {
    const container = this.element.parentElement.querySelector('[data-tagelect-container]');
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

  function buildErrorSpan(errorMessage) {
    const errorElement = document.createElement('span');
    errorElement.classList.add(...this.options.classNames.error.split(' '));
    errorElement.innerText = errorMessage;
    errorElement.dataset.tagelectError = true;
    return errorElement;
  }
  this.buildErrorSpan = buildErrorSpan.bind(this);

  function validateStuff(nextTag) {
    // Remove previous errors
    this.removeValidationErrors();
    const maxTags = parseInt(this.options.maxTags, 10);

    // Error if max tags limit reached
    if (this.options.maxTags && this.tags.length === maxTags) {
      // The maxTagsError may contain templating variable %TAGS%
      const error = this.buildErrorSpan(this.options.maxTagsError.replace('%TAGS%', maxTags));
      this.containerElement.insertAdjacentElement('afterend', error);

      return false;
    }

    // Error if tag does not match validation regex
    if (this.options.validationRegex && !nextTag.match(this.options.validationRegex)) {
      const error = this.buildErrorSpan(this.options.validationRegexError);
      this.containerElement.insertAdjacentElement('afterend', error);

      return false;
    }

    if (this.options.noDuplicates && this.tags.includes(nextTag)) {
      const error = this.buildErrorSpan(this.options.noDuplicatesMessage);
      this.containerElement.insertAdjacentElement('afterend', error);

      return false;
    }

    return true;
  }
  this.validateStuff = validateStuff.bind(this);

  // Tag rendering
  function renderTag(text) {
    const container = this.element.parentElement.querySelector('[data-tagelect-container]');

    // Build a tag
    const tagElement = document.createElement('div');
    tagElement.classList.add(...this.options.classNames.tag.split(' '));
    tagElement.dataset.tagelectTag = true;

    const tagTextElement = document.createElement('div');
    tagTextElement.classList.add(...this.options.classNames.tagText.split(' '));
    tagTextElement.dataset.tagelectTagText = true;
    tagTextElement.innerHTML = text;
    tagElement.insertAdjacentElement('beforeend', tagTextElement);
    if (this.options.removeButton) {
      // Add remove button
      const removeBtnElement = document.createElement('div');
      removeBtnElement.classList.add(...this.options.classNames.removeButton.split(' '));
      removeBtnElement.dataset.tagelectRemoveButton = true;
      removeBtnElement.innerText = '×'; // &times; icon
      tagElement.insertAdjacentElement('beforeend', removeBtnElement);
      removeBtnElement.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = e.target.closest('[data-tagelect-tag]');
        const removedTagText = tag.querySelector('[data-tagelect-tag-text]').innerText;
        // Removing tag from state
        this.tags = this.tags.filter((tg) => tg !== removedTagText);
        this.setInputValue();
        tag.remove();
      });
    }
    const tagInput = container.querySelector('[data-tagelect-tag-input]');
    // Prepend tag to the tags
    tagInput.insertAdjacentElement('beforebegin', tagElement);
  }
  this.renderTag = renderTag.bind(this);

  function renderTags() {
    const container = this.element.parentElement.querySelector('[data-tagelect-container]');
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
      this.toggleDropdown(true);
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
