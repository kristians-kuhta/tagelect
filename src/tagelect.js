// @babel/polyfill (ex) related stuff
//
// Needed to polyfill ECMAScript features
import 'core-js/stable';
// Needed to use transpiled generator functions
import 'regenerator-runtime/runtime';
// More info: https://babeljs.io/docs/en/babel-polyfill/

import merge from 'lodash.merge';

import { get } from 'axios';
import _merge from 'lodash.merge';

function Tagelect(element, options) {
  this._element = element;
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

  if (this._element.value) {
    // Set the initial tags from hidden input value
    this.tags = this._element.value.split(',').map((e) => e.trim());
  }

  // Hide element
  this._element.style.display = 'none';

  // Serialize the tags to the actual form input value
  this.setInputValue = function () {
    this._element.value = this.tags.join(this.options.tagDelimiter);
  };

  this.setFirstSuggestion = function (suggestion) {
    const container = this._element.parentElement.querySelector('[data-tagelect-container]');
    const tagInput = container.querySelector('[data-tagelect-tag-input]');

    if (suggestion) {
      tagInput.dataset.suggestion = suggestion.replace(tagInput.innerText, '');
    } else {
      tagInput.removeAttribute('data-suggestion');
    }
  };

  this.removeValidationErrors = function () {
    this.container.parentElement.querySelectorAll('[data-tagelect-error]').forEach((e) => {
      e.remove();
    });
  };
  this.buildErrorSpan = function (errorMessage) {
    const error = document.createElement('span');
    error.classList.add(...this.options.classNames.error.split(' '));
    error.innerText = errorMessage;
    error.dataset.tagelectError = true;
    return error;
  };

  this.validateStuff = function (nextTag) {
    // Remove previous errors
    this.removeValidationErrors();
    const maxTags = parseInt(this.options.maxTags);

    // Error if max tags limit reached
    if (this.options.maxTags && this.tags.length === maxTags) {
      // The maxTagsError may contain templating variable %TAGS%
      const error = this.buildErrorSpan(this.options.maxTagsError.replace('%TAGS%', maxTags));
      this.container.insertAdjacentElement('afterend', error);

      return false;
    }

    // Error if tag does not match validation regex
    if (this.options.validationRegex && !nextTag.match(this.options.validationRegex)) {
      const error = this.buildErrorSpan(this.options.validationRegexError);
      this.container.insertAdjacentElement('afterend', error);

      return false;
    }

    if (this.options.noDuplicates && this.tags.includes(nextTag)) {
      const error = this.buildErrorSpan(this.options.noDuplicatesMessage);
      this.container.insertAdjacentElement('afterend', error);

      return false;
    }

    return true;
  };
  this.toggleDropdown = function (show) {
    const prevDropdown = document.querySelector('[data-tagelect-dropdown]');
    // Remove previous dropdown
    if (prevDropdown) {
      prevDropdown.remove();
    }

    if (!show) {
      return;
    }

    // Else re-build a new dropdown
    const dropdown = document.createElement('ul');
    dropdown.classList.add(...this.options.classNames.dropdown.split(' '));
    dropdown.dataset.tagelectDropdown = true;
    this.suggestions.forEach((suggestion, idx) => {
      const item = document.createElement('li');
      item.classList.add(...this.options.classNames.dropdownItem.split(' '));
      item.dataset.tagelectDropdownItem = true;
      if (idx === 0) {
        item.classList.add(...this.options.classNames.dropdownItemSelected.split(' '));
      }
      item.innerText = suggestion;
      item.addEventListener('click', (e) => {
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
      dropdown.insertAdjacentElement('beforeend', item);
    });
    const container = this._element.parentElement.querySelector('[data-tagelect-container]');
    container.insertAdjacentElement('afterend', dropdown);
  };

  // Tag rendering
  this.renderTag = function (text) {
    const container = this._element.parentElement.querySelector('[data-tagelect-container]');

    // Build a tag
    const tag = document.createElement('div');
    tag.classList.add(...this.options.classNames.tag.split(' '));
    tag.dataset.tagelectTag = true;

    const tagText = document.createElement('div');
    tagText.classList.add(...this.options.classNames.tagText.split(' '));
    tagText.dataset.tagelectTagText = true;
    tagText.innerHTML = text;
    tag.insertAdjacentElement('beforeend', tagText);
    if (this.options.removeButton) {
      // Add remove button
      const removeBtn = document.createElement('div');
      removeBtn.classList.add(...this.options.classNames.removeButton.split(' '));
      removeBtn.dataset.tagelectRemoveButton = true;
      removeBtn.innerText = '×'; // &times; icon
      tag.insertAdjacentElement('beforeend', removeBtn);
      removeBtn.addEventListener('click', (e) => {
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
    tagInput.insertAdjacentElement('beforebegin', tag);
  };

  this.renderTags = function () {
    const container = this._element.parentElement.querySelector('[data-tagelect-container]');
    const tagElements = container.querySelectorAll('[data-tagelect-tag]');
    // Remove previously rendered tags
    tagElements.forEach((tagElem) => tagElem.remove());

    if (this.tags.length === 0) {
      return;
    }

    this.tags.forEach((tagText) => {
      this.renderTag(tagText);
    });
  };
  this.focusOnTagInput = function () {
    const tagInput = this.container.querySelector('[data-tagelect-tag-input]');
    const clickEvent = new Event('click');
    tagInput.dispatchEvent(clickEvent);
  };

  this.clearTagInput = function () {
    const tagelect = this._element.parentElement.querySelector('[data-tagelect-container]');
    const tagInput = this.container.querySelector('[data-tagelect-tag-input]');

    tagInput.innerHTML = '';
  };

  this.fetchSuggestions = function (searchPhrase) {
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
      .catch((_e) => {
        this.setFirstSuggestion(null);
        this.toggleDropdown(false);
      });
  };

  // Render initial tagelect elements
  this.wrapper = document.createElement('div');
  this.wrapper.setAttribute('tabindex', '-1');
  this.wrapper.classList.add(...this.options.classNames.wrapper.split(' '));
  this.wrapper.dataset.tagelectWrapper = true;
  // Track if mouse is in container (used for during blur event handling)
  this.wrapper.addEventListener('mouseover', (e) => {
    this.mouseOverContainer = true;
  });
  this.wrapper.addEventListener('mouseout', (e) => {
    this.mouseOverContainer = false;
  });

  this.container = document.createElement('div');
  this.container.dataset.tagelectContainer = true;
  this.container.classList.add(...this.options.classNames.container.split(' '));

  // Render the input field for entering tags
  const tagInput = document.createElement('span');
  tagInput.classList.add(...this.options.classNames.tagInput.split(' '));
  tagInput.dataset.tagelectTagInput = true;
  tagInput.setAttribute('contenteditable', true);
  tagInput.dataset.placeholder = this.options.placeholder;
  tagInput.style.minWidth = `${this.options.placeholder.length * 6}px`;

  tagInput.addEventListener('blur', (e) => {
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
  tagInput.addEventListener('keydown', (e) => {
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
      const tagInput = this.container.querySelector('[data-tagelect-tag-input]');
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
  this.container.insertAdjacentElement('beforeend', tagInput);
  this.wrapper.insertAdjacentElement('beforeend', this.container);
  this._element.insertAdjacentElement('beforebegin', this.wrapper);

  // Render the initial tags
  this.renderTags();
}

export default Tagelect;
