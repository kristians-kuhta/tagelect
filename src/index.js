// @babel/polyfill (ex) related stuff
//
// Needed to polyfill ECMAScript features
import "core-js/stable";
// Needed to use transpiled generator functions
import "regenerator-runtime/runtime";
// More info: https://babeljs.io/docs/en/babel-polyfill/

import merge from 'lodash.merge';

import './index.scss';

import axios from 'axios';
import _merge from 'lodash.merge';

function Tagelect(element, options) {
  this._element = element;
  this.defaultOptions = {
    // max amount of tags that can be added
    // (it is possible it initially render more by setting input value)
    maxTags: undefined,
    maxTagsError: "can't contain more than %TAGS% tags",
    validationRegex: undefined, // the regex that is going to be used while validating a tag
    validationRegexMessage: 'permitted characters used', // the message shown if regexp validation fails
    noDuplicates: false, // are duplicates allowed
    noDuplicatesMessage: 'duplicates are not allowed', // the message shown if validations fail because of duplicates
    placeholder: 'Enter a tag...', // The placeholder for the tag entry
    removeButton: true, // Show remove button
    tagDelimiter: ',', // The delimiter used when setting form input value
    suggestionsCount: 5, // Fetch and display 5 suggestions
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
      error: 'tagelect-error'
    }
  }
  this.options = _merge(this.defaultOptions, options);
  this.tags = [];
  this.suggestions = [];

  // Mouse position will be continuously tracked and stored in these 2 variables
  this.mouseX = undefined;
  this.mouseY = undefined;

  if(this._element.value) {
    // Set the initial tags from hidden input value
    this.tags = this._element.value.split(',');
  }

  // Hide element
  this._element.style.display = 'none';

  // Serialize the tags to the actual form input value
  this.setInputValue = function() {
    this._element.value = this.tags.join(this.options.tagDelimiter);
  }

  this.setFirstSuggestion = function(suggestion) {
    const container = this._element.parentElement.querySelector(`.${this.options.classNames.container}`);
    const tagInput = container.querySelector(`.${this.options.classNames.tagInput}`);
    const suggestionSuffix = suggestion ? suggestion.replace(tagInput.innerText, '') : '';
    tagInput.dataset.suggestion = suggestionSuffix;
  }

  this.removeValidationErrors = function() {
    this.container.parentElement.querySelectorAll('[data-tagelect-error]').forEach(e => {
    e.remove();
    });
  }
  this.buildErrorSpan = function(errorMessage) {
    const error = document.createElement('span');
    error.classList.add(this.options.classNames.error);
    error.innerText = errorMessage;
    error.dataset.tagelectError = true;
    return error;
  }

  this.validateStuff = function(nextTag) {
    // Remove previous errors
    this.removeValidationErrors();
    const maxTags = parseInt(this.options.maxTags);

    // Error if max tags limit reached
    if(this.options.maxTags && this.tags.length === maxTags) {
      // The maxTagsError may contain templating variable %TAGS%
      const error = this.buildErrorSpan(this.options.maxTagsError.replace('%TAGS%', maxTags));
      this.container.insertAdjacentElement('afterend', error);

      return false;
    }

    // Error if tag does not match validation regex
    if(this.options.validationRegex && !nextTag.match(this.options.validationRegex)) {
     const error = this.buildErrorSpan(this.options.validationRegexMessage);
     this.container.insertAdjacentElement('afterend', error);

     return false;
    }

    if(this.options.noDuplicates && this.tags.includes(nextTag)) {
      const error = this.buildErrorSpan(this.options.noDuplicatesMessage);
      this.container.insertAdjacentElement('afterend', error);

      return false;
    }

    return true;

  }
  this.toggleDropdown = function(show) {
    const prevDropdown = document.querySelector('#tagelect-dropdown');
    // Remove previous dropdown
    if(prevDropdown) {
      prevDropdown.remove();
    }

    // Re-build a new dropdown
    if (show) {
      const dropdown = document.createElement('ul');
      dropdown.classList.add(this.options.classNames.dropdown);
      dropdown.id = 'tagelect-dropdown';
      this.suggestions.forEach((suggestion, idx) => {
	const item = document.createElement('li');
	item.classList.add(this.options.classNames.dropdownItem);
	if (idx === 0) {
	  item.classList.add(this.options.classNames.dropdownItemSelected);
	}
	item.innerText = suggestion;
	item.addEventListener('click', e => {
	  if(!this.validateStuff(e.target.innerText)) {
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
      const container = this._element.parentElement.querySelector(`.${this.options.classNames.container}`);
      container.insertAdjacentElement('afterend', dropdown);
    }
  }

  // Tag rendering
  this.renderTag = function(tagText) {
    const container = this._element.parentElement.querySelector(`.${this.options.classNames.container}`);

    //Build a tag
    const tag = document.createElement('div');
    tag.classList.add(this.options.classNames.tag);
    const tagContent = document.createElement('div');
    tagContent.classList.add(this.options.classNames.tagText);
    tagContent.innerHTML = tagText;
    tag.insertAdjacentElement('beforeend', tagContent);
    if (this.options.removeButton) {
      // Add remove button
      const removeBtn = document.createElement('div');
      removeBtn.classList.add(this.options.classNames.removeButton);
      removeBtn.innerText = '×'; // &times; icon
      tag.insertAdjacentElement('beforeend', removeBtn);
      removeBtn.addEventListener('click', e => {
	e.preventDefault();
	const tagClassName = this.options.classNames.tag;
	const tag = e.target.closest(`.${tagClassName}`);
	const removedTagText = tag.querySelector(`.${this.options.classNames.tagText}`).innerText;
	// Removing tag from state
	this.tags = this.tags.filter(tg => tg !== tagText);
	this.setInputValue();
	tag.remove();
      });
    }
    const tagInput = container.querySelector(`.${this.options.classNames.tagInput}`);
    // Prepend tag to the tags
    tagInput.insertAdjacentElement('beforebegin', tag);
  }

  this.renderTags = function() {
    const container = this._element.parentElement.querySelector(`.${this.options.classNames.container}`);
    const tagElements = container.querySelectorAll(`.${this.options.classNames.tag}`);
    // Remove previously rendered tags
    tagElements.forEach(tagElem => tagElem.remove());

    if(this.tags.length === 0) {
      return;
    }

    this.tags.forEach(tagText => {
      this.renderTag(tagText);
    });
  }
  this.focusOnTagInput = function() {
    const tagInput = this.container.querySelector(`.${this.options.classNames.tagInput}`);
    const clickEvent = new Event('click');
    tagInput.dispatchEvent(clickEvent);
  }

  this.clearTagInput = function() {
    const containerClass = this.options.classNames.container;
    const tagelect = this._element.parentElement.querySelector(`.${containerClass}`);
    const tagInput = tagelect.querySelector(`.${this.options.classNames.tagInput}`);

    tagInput.innerHTML = '';
  }

  this.fetchSuggestions = function(searchPhrase) {
    const count = this.options.suggestionsCount;
    const url = `${this._element.dataset.source}?name=${searchPhrase}&count=${count}`;

    const auth_token = document.getElementsByName('csrf-token')[0].value;

    const headers = {
      'Accept': 'application/javascript',
      'X-CSRF-Token': auth_token,
      'X-Requested-With': 'XMLHttpRequest'
    }
    axios.get(url, { headers }).then(function(response) {
      this.suggestions = response.data;
      this.setFirstSuggestion(response.data[0]);
      // If response has no data - don't show dropdown
      this.toggleDropdown(response.data.length > 0);
    }.bind(this));
  }


  // Render initial tagelect elements
  this.wrapper = document.createElement('div');
  this.wrapper.setAttribute('tabindex', '-1');
  this.wrapper.classList.add(this.options.classNames.wrapper);

  this.container = document.createElement('div');
  this.container.classList.add(this.options.classNames.container);

  // Render the input field for entering tags
  const tagInput = document.createElement('span');
  tagInput.classList.add(this.options.classNames.tagInput);
  tagInput.setAttribute('contenteditable', true);
  tagInput.dataset.placeholder = this.options.placeholder;
  tagInput.style.minWidth = `${this.options.placeholder.length*6}px`;
  // Track mouse position
  document.addEventListener('mousemove', e => {
    this.mouseX = e.pageX;
    this.mouseY = e.pageY;
  });

  tagInput.addEventListener('blur', e => {
    const dropdown = document.querySelector('#tagelect-dropdown');
    // Do nothing unless dropdown is open
    if (!dropdown) {
      return;
    }

    const { left, right, top, bottom } = dropdown.getBoundingClientRect();

    // Close dropdown -> if mouse is outside of dropdown
    if(this.mouseX < left || this.mouseX > right || this.mouseY < top || this.mouseY > bottom ) {
      this.toggleDropdown(false);
    }
  });


  // Process the keydown events for tag input
  tagInput.addEventListener('keydown', e => {
    // TODO: check the regex validation here

    // Add the suggestion as tag -> if Tab is pressed while there is a suggestion
    if(e.key === 'Tab' && e.target.innerText.length > 0 && this.suggestions.length > 0) {
      e.preventDefault();
      const tagText = this.suggestions[0];
      this.tags = this.tags.concat(tagText);
      this.renderTags();
      this.setInputValue();
      this.clearTagInput();
      this.suggestions = [];
      this.toggleDropdown(false);
      this.focusOnTagInput();
    }

    // Add tag -> if Enter pressed in non-empty input
    if((e.key === 'Enter' || e.key === ',') && e.target.innerText.length > 0) {
      if(!this.validateStuff(e.target.innerText)) {
	e.preventDefault();
	return;
      }
      e.preventDefault();
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
    if(e.key === 'Backspace' && e.target.innerText.length === 1 && this.tags.length === 0) {
      this.removeValidationErrors();
      this.toggleDropdown(false);
      return;
    }

    // Remove last tag -> if Backspace pressed in empty tag input
    if(e.key === 'Backspace' && e.target.innerText.length === 0 && this.tags.length > 0) {
      this.removeValidationErrors();
      this.tags.pop();
      this.setInputValue();
      this.renderTags();
      return;
    }

    // Do nothing -> if Enter pressed in empty tag input
    if(e.key === 'Enter' && e.target.innerText.length === 0) {
      e.preventDefault();
    }

    // If any alphanumeric or - is pressed
    // TODO: extract this as an option?
    //const allowedPrintable = !!e.key.match(/^\w{1}$|^\-{1}$/g);
    const alphanumeric = e.key.match(/^\w$/);

    // Update tag input and fetch suggestions -> if alphanum. entered or char deleted
    //
    // NOTE: The event hasn't changed the innerText yet, so we have to check for length > 1
    if(alphanumeric || (e.key === 'Backspace' && e.target.innerText.length > 1)) {
      const tagInput = this.container.querySelector(`.${this.options.classNames.tagInput}`);
      const newText = e.key === 'Backspace' ? tagInput.innerText.slice(0, -1) : tagInput.innerText + e.key;

      if(!this.validateStuff(newText)) {
	return;
      }
      this.fetchSuggestions(newText);
      this.toggleDropdown(true);
    }

    if(e.key === 'Backspace' && e.target.innerText.length === 1) {
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
