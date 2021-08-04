describe('Validations', () => {
  it('validates maximum allowed tags with default error message when validation enabled', () => {
    cy.visit('cypress/test.html').then(window => {
      cy.get('#tagelect-with-tags').then(input => {
	const inputElement = input[0];
	const options = { maxTags: 2 };

	inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	contains("can't contain more than 2 tags");
    });
  });

  it('validates maximum allowed tags with custom error message when validation enabled', () => {
    cy.visit('cypress/test.html').then(window => {
      cy.get('#tagelect-with-tags').then(input => {
	const inputElement = input[0];
	const options = { maxTags: 2, maxTagsError: 'Please, no more than %TAGS% tags' };

	inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	contains('Please, no more than 2 tags');
    });
  });

  it('validates tag format with the default error message when validation enabled', () => {
    cy.visit('cypress/test.html').then(window => {
      cy.get('#tagelect-with-tags').then(input => {
	const inputElement = input[0];
	const options = { validationRegex: /[0-9]/ };

	inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	contains('permitted characters used');
    });
  });

  it('validates tag format with the default error message when validation enabled', () => {
    cy.visit('cypress/test.html').then(window => {
      cy.get('#tagelect-with-tags').then(input => {
	const inputElement = input[0];
	const options = { validationRegex: /[0-9]/, validationRegexError: 'Only digits allowed' };

	inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	contains('Only digits allowed');
    });
  });

  it('removes max tags validation error if tag input is cleared', () => {
    cy.visit('cypress/test.html').then(window => {
      cy.get('#tagelect-with-tags').then(input => {
	const inputElement = input[0];
	const options = { maxTags: 2 };

	inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	contains("can't contain more than 2 tags");
      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('{backspace}');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	should('not.exist');
    });
  });

  it('removes tag format validation error if input becomes valid', () => {
    cy.visit('cypress/test.html').then(window => {
      cy.get('#tagelect-with-tags').then(input => {
	const inputElement = input[0];
	const options = { validationRegex: /^[0-9]$/ };

	inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('1').
	type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	contains('permitted characters used');
      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('{backspace}');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
	should('not.exist');
    });
  });

  it('validates tag format when Tab-completing an invalid suggestion', () => {
    cy.intercept({
	method: 'GET',
	url: '/suggestions?name=b&count=5'
      },
      {
	body: ['b25']
      }
    );

    cy.visit('cypress/test.html').then(window => {
      cy.get('#tagelect-with-tags').then(input => {
	const inputElement = input[0];
	const options = {
	  validationRegex: /^[a-z]*$/,
	  suggestionsSource: '/suggestions'
	};

	inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	type('b');
      cy.get('#tagelect-with-tags-parent').
	find('[data-tagelect-tag-input]').
	click().
	trigger('keydown', { key: 'Tab' }); // Cypress does not support type('{tab}') yet.
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]').
        contains('permitted characters used');
      // Expect no new tags
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]').should('have.length', 2);
      // Expect tag input having the same suggestion and content
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input][data-suggestion="25"]').should('exist').should('have.text', 'b');
    });
  });
});
