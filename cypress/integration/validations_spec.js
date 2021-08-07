describe('Validations', () => {
  it('validates maximum allowed tags with default error message when validation enabled', () => {
    cy.renderTagelectPage('tagelect-with-tags', { maxTags: 2 }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
        .contains("can't contain more than 2 tags");
    });
  });

  it('validates maximum allowed tags with custom error message when validation enabled', () => {
    cy.renderTagelectPage(
      'tagelect-with-tags',
      { maxTags: 2, maxTagsError: 'Please, no more than %TAGS% tags' },
      () => {
        cy.get('#tagelect-with-tags-parent')
          .find('[data-tagelect-tag-input]')
          .click()
          .type('a');
        cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
          .contains('Please, no more than 2 tags');
      },
    );
  });

  it('validates tag format with the default error message when validation enabled', () => {
    cy.renderTagelectPage('tagelect-with-tags', { validationRegex: /[0-9]/ }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
        .contains('permitted characters used');
    });
  });

  it('validates tag format with the default error message when validation enabled', () => {
    cy.renderTagelectPage(
      'tagelect-with-tags',
      { validationRegex: /[0-9]/, validationRegexError: 'Only digits allowed' },
      () => {
        cy.get('#tagelect-with-tags-parent')
          .find('[data-tagelect-tag-input]')
          .click()
          .type('a');
        cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
          .contains('Only digits allowed');
      },
    );
  });

  it('removes max tags validation error if tag input is cleared', () => {
    cy.renderTagelectPage('tagelect-with-tags', { maxTags: 2 }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
        .contains("can't contain more than 2 tags");
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('{backspace}');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
        .should('not.exist');
    });
  });

  it('removes tag format validation error if input becomes valid', () => {
    cy.renderTagelectPage('tagelect-with-tags', { validationRegex: /^[0-9]$/ }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('1')
        .type('a');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
        .contains('permitted characters used');
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('{backspace}');
      cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
        .should('not.exist');
    });
  });

  it('validates tag format when Tab-completing an invalid suggestion', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['b25'],
    });

    cy.renderTagelectPage(
      'tagelect-with-tags',
      {
        validationRegex: /^[a-z]*$/,
        suggestionsSource: '/suggestions',
      },
      () => {
        cy.get('#tagelect-with-tags-parent')
          .find('[data-tagelect-tag-input]')
          .click()
          .type('b');
        cy.get('#tagelect-with-tags-parent')
          .find('[data-tagelect-tag-input]')
          .click()
          .trigger('keydown', { key: 'Tab' }); // Cypress does not support type('{tab}') yet.
        cy.get('#tagelect-with-tags-parent [data-tagelect-error]')
          .contains('permitted characters used');
        // Expect no new tags
        cy.get('#tagelect-with-tags-parent [data-tagelect-tag]').should('have.length', 2);
        // Expect tag input having the same suggestion and content
        cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input][data-suggestion="25"]').should('exist').should('have.text', 'b');
      },
    );
  });

  it('validates no duplicate tags with the default error message when validation enabled', () => {
    cy.renderTagelectPage('tagelect', { noDuplicates: true }, () => {
      cy.get('[data-tagelect-tag-input').click().type('a{enter}');
      cy.get('[data-tagelect-tag-input').click().type('a{enter}');
      cy.get('#tagelect-parent')
        .find('[data-tagelect-error]')
        .should('exist')
        .should('have.text', 'duplicates are not allowed');
    });
  });

  it('validates no duplicate tags with the custom error message when validation enabled', () => {
    cy.renderTagelectPage('tagelect', { noDuplicates: true, noDuplicatesError: 'no duplicates' }, () => {
      cy.get('[data-tagelect-tag-input').click().type('a{enter}');
      cy.get('[data-tagelect-tag-input').click().type('a{enter}');
      cy.get('#tagelect-parent')
        .find('[data-tagelect-error]')
        .should('exist')
        .should('have.text', 'no duplicates');
    });
  });

  it('does not validate no duplicate tags when validation disabled', () => {
    cy.renderTagelectPage('tagelect', {}, () => {
      cy.get('[data-tagelect-tag-input').click().type('a{enter}');
      cy.get('[data-tagelect-tag-input').click().type('a{enter}');
      cy.get('#tagelect-parent').find('[data-tagelect-error]').should('not.exist');
    });
  });

  it('does not allow for the user to select a dropdown suggestion that causes validations to fail', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['b25'],
    });

    cy.renderTagelectPage('tagelect', { validationRegex: /^\w$/, suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-parent [data-tagelect-tag-input').click().type('b');
      cy.get('#tagelect-parent [data-tagelect-dropdown]').find('[data-tagelect-dropdown-item]:first-child').click();
      cy.get('#tagelect-parent [data-tagelect-error]').should('exist');
      cy.get('#tagelect-parent [data-tagelect-tag]').should('not.exist');
      cy.get('#tagelect-parent [data-tagelect-tag-input').should('have.text', 'b');
      cy.get('#tagelect-parent [data-tagelect-dropdown]').should('exist');
    });
  });

  it('removes validation message when input is cleared out', () => {
    cy.renderTagelectPage('tagelect', { validationRegex: /^\d*$/ }, () => {
      cy.get('#tagelect-parent [data-tagelect-tag-input').click().type('b');
      cy.get('#tagelect-parent [data-tagelect-error]').should('exist');
      cy.get('#tagelect-parent [data-tagelect-tag-input').click().type('{backspace}');
      cy.get('#tagelect-parent [data-tagelect-error]').should('not.exist');
    });
  });
});
