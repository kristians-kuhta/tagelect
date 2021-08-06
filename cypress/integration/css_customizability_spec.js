describe('CSS customizability', () => {
  it('allows user to override all of the CSS classes', () => {
    cy.intercept(
      { method: 'GET', url: '/suggestions?name=b&count=5' },
      { body: ['b-tag-1'] },
    );

    cy.renderTagelectPage(
      'tagelect-with-tags',
      {
        removeButton: true,
        maxTags: 3,
        suggestionsSource: null, // Do not perform suggestion fetching
        suggestionsSource: '/suggestions', // So that the dropdown can be inspected
        classNames: {
          wrapper: 'tagelect-2',
          container: 'tagelect-content-2',
          // Two classes to keep the default behaviour that is provided by CSS
          tagInput: 'tagelect-input tagelect-input-2',
          tag: 'tagelect-tag-2',
          removeButton: 'tagelect-tag-remove-btn-2',
          tagText: 'tagelect-tag-text-2',
          dropdown: 'tagelect-dropdown-2',
          dropdownItem: 'tagelect-dropdown-item-2',
          dropdownItemSelected: 'tagelect-dropdown-item--selected-2',
          error: 'tagelect-error-2',
        },
      },
      () => {
        // Make sure the wrapper is being rendered
        cy.get('#tagelect-with-tags-parent').find('.tagelect-2').should('exist');
        cy.get('#tagelect-with-tags-parent').children('.tagelect-2').should('have.length', 1);
        cy.get('.tagelect-2').children('.tagelect-content-2').should('have.length', 1);
        cy.get('.tagelect-content-2').children('.tagelect-tag-2').should('have.length', 2);
        cy.get('.tagelect-content-2').children('.tagelect-tag-2').first().children('.tagelect-tag-text-2')
          .should('exist');
        cy.get('.tagelect-content-2').children('.tagelect-tag-2').first().children('.tagelect-tag-remove-btn-2')
          .should('exist');
        cy.get('.tagelect-content-2 > .tagelect-input-2:nth-child(3)').should('exist');

        cy.get('.tagelect-content-2 > .tagelect-input-2').click().type('b');
        cy.get('.tagelect-2 .tagelect-dropdown-2').should('exist');
        cy.get('.tagelect-2').trigger('mouseover'); // So that tag input blur works correctly
        cy.get('.tagelect-dropdown-2 > .tagelect-dropdown-item-2.tagelect-dropdown-item--selected-2').should('exist').click();

        cy.get('.tagelect-content-2 > .tagelect-input-2').click().type('a');
        cy.get('.tagelect-2 .tagelect-error-2').should('exist');
      },
    );
  });
});
