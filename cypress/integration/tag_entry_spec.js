describe('Tag entry', () => {
  it('adds a tag that was not in the suggestions', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['b-tag-1', 'b-tag-2'],
    });

    cy.intercept({
      method: 'GET',
      url: /\/suggestions(?!\?name=b&count=5)/,
    },
    {
      body: [],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('BTC{enter}');

      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(3)').contains('BTC');
    });
  });

  it('adds the first suggestion after pressing Tab', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['b-tag-1', 'b-tag-2'],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('b')
        .trigger('keydown', { key: 'Tab' }); // Cypress does not support type('{tab}') yet.

      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(3)').contains('b-tag-1');
    });
  });

  it('adds the first suggestion after clicking on it', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['b-tag-1', 'b-tag-2'],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('b');
      // Needed so that blur on tag input works correctly
      cy.get('[data-tagelect-wrapper]').trigger('mouseover');
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-dropdown] [data-tagelect-dropdown-item]:first-child').click();
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(3)').contains('b-tag-1');
    });
  });

  it('adds a suggestion that is not first after clicking on it', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['b-tag-1', 'b-tag-2'],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('b');

      // Needed so that blur on tag input works correctly
      cy.get('[data-tagelect-wrapper]').trigger('mouseover');

      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-dropdown] > [data-tagelect-dropdown-item]:nth-child(2)')
        .click();
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(3)').contains('b-tag-2');
    });
  });

  it('does not show suggestions if none present in the valid response from the source', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: [],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('b');
      cy.get('#tagelect-with-tags-parent [data-tagelect-dropdown]').should('not.exist');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input]')
        .should('not.have.attr', 'data-suggestion');
    });
  });

  it('does not show suggestions if response from suggestions source was not successful', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    { statusCode: 500 });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('b');
      cy.get('#tagelect-with-tags-parent [data-tagelect-dropdown]').should('not.exist');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input]')
        .should('not.have.attr', 'data-suggestion');
    });
  });

  it('does not show suggestions if response from suggestions had an empty body', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: null,
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('b');
      cy.get('#tagelect-with-tags-parent [data-tagelect-dropdown]').should('not.exist');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input]:not([data-suggestion])')
        .should('exist');
    });
  });

  it('removes suggestions after the focusing away from tag input', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['bird'],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click()
        .type('b');
      cy.get('#tagelect-with-tags-parent [data-tagelect-dropdown]').should('exist');
      // Simulate users mouse leaving tagelect wrapper and clicking somewhere
      cy.get('#tagelect-with-tags-parent').find('[data-tagelect-wrapper]').trigger('mouseout');
      cy.get('#tagelect-with-tags-parent').find('[data-tagelect-tag-input]').trigger('blur');

      // Dropdown is not visible and first suggestion isn't shown in tag input
      cy.get('#tagelect-with-tags-parent [data-tagelect-dropdown]').should('not.exist');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input][data-suggestion]')
        .should('not.exist');
    });
  });

  it('looses focus without opening dropdown or setting a suggestion', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['bird'],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .click();
      // This is needed to simulate user mouseover so that blur on input works correctly
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-wrapper]')
        .trigger('mouseover');
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag-input]')
        .trigger('blur');
      cy.get('#tagelect-with-tags-parent [data-tagelect-dropdown]').should('not.exist');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input][data-suggestion]').should('not.exist');
    });
  });

  it('does nothing if Enter is pressed in an empty tag input', () => {
    cy.renderTagelectPage('tagelect', {}, () => {
      cy.get('#tagelect-parent [data-tagelect-tag-input]')
        .click()
        .type('{enter}')
        .should('have.focus')
        .should('not.have.text');
    });
  });

  it('does not add suggestion data attribute if the input no longer has suggestions', () => {
    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=b&count=5',
    },
    {
      body: ['bird'],
    });

    cy.intercept({
      method: 'GET',
      url: '/suggestions?name=be&count=5',
    },
    {
      body: [],
    });

    cy.renderTagelectPage('tagelect-with-tags', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input]').click().type('b');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input]').click().type('e');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag-input][data-suggestion]').should('not.exist');
    });
  });

  it('only adds suggestion data if the tag input is a substring of first suggestion', () => {
    cy.intercept({
      method: 'GET',
      url: /\/suggestions(?!\?name=b&count=5)/,
    },
    {
      body: ['Alabama'],
    });

    cy.renderTagelectPage('tagelect', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-parent [data-tagelect-tag-input]').click().type('a');
      cy.get('#tagelect-parent [data-tagelect-tag-input][data-suggestion]').should('not.exist');
      cy.get('#tagelect-parent [data-tagelect-tag-input]').click().type('l');
      cy.get('#tagelect-parent [data-tagelect-tag-input][data-suggestion]').should('not.exist');

      cy.get('#tagelect-parent [data-tagelect-tag-input]').click().type('{backspace}{backspace}Al');
      cy.get('#tagelect-parent [data-tagelect-tag-input][data-suggestion]').then(($el) => {
        expect($el).to.have.data('suggestion', 'abama');
      });
      cy.get('#tagelect-parent [data-tagelect-tag-input]').click().type('A');
      cy.get('#tagelect-parent [data-tagelect-tag-input][data-suggestion]').should('not.exist');
    });
  });

  it('only allows suggestion tab completion if the tag input is a substring of first suggestion', () => {
    cy.intercept({
      method: 'GET',
      url: /\/suggestions(?!\?name=b&count=5)/,
    },
    {
      body: ['Alabama'],
    });

    cy.renderTagelectPage('tagelect', { suggestionsSource: '/suggestions' }, () => {
      cy.get('#tagelect-parent [data-tagelect-tag-input]').click().type('a');
      cy.get('#tagelect-parent [data-tagelect-tag-input][data-suggestion]').should('not.exist');
      cy.get('#tagelect-parent [data-tagelect-tag-input]')
        .trigger('keydown', { key: 'Tab' }); // Cypress does not support type('{tab}') yet.
      cy.get('#tagelect-parent [data-tagelect-tag]').should('not.exist');
      cy.get('#tagelect-parent [data-tagelect-tag-input]')
        .should('have.text', 'a');
    });
  });
});
