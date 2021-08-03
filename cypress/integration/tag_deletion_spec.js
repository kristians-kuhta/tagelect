describe('Tag deletion', () => {
  it('remove last tag when user presses Backspace in empty tag input', () => {
    cy.visit('cypress/test.html').then(window => {
      // Find input for which to initialize the Tagelect
      cy.get('#tagelect-with-tags').then(input => {
       const inputElement = input[0];

       // Initialize the Tagelect
       // TODO: share the logic somewhere
       inputElement.tagelect = new window.Tagelect(inputElement);
      });

      cy.get('[data-tagelect-tag-input]').click().type('{backspace}');
      // NOTE: tag-1, tag-2 comes from test.html
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-1');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').should('not.exist');
      cy.get('[data-tagelect-tag-input]').should('have.focus');
    });
  });

  it('removes a tag after click on remove button', () => {
    cy.visit('cypress/test.html').then(window => {
      // Find input for which to initialize the Tagelect
      cy.get('#tagelect-with-tags').then(input => {
       const inputElement = input[0];

       // Initialize the Tagelect
       // TODO: share the logic somewhere
       inputElement.tagelect = new window.Tagelect(inputElement);
      });

      // NOTE: tag-1, tag-2 comes from test.html
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-1');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1) > [data-tagelect-remove-button]').click();
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').should('not.exist');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-2');
      // TODO: should input have focus here?
      //cy.get('[data-tagelect-tag-input]').should('have.focus');
    });

  });

  it('does not remove tags if Backspace is pressed and tag input is not empty', () => {
    cy.visit('cypress/test.html').then(window => {
      // Find input for which to initialize the Tagelect
      cy.get('#tagelect-with-tags').then(input => {
       const inputElement = input[0];

       // Initialize the Tagelect
       // TODO: share the logic somewhere
       inputElement.tagelect = new window.Tagelect(inputElement);
      });

      cy.get('[data-tagelect-tag-input]').click().type('T{backspace}');
      // NOTE: tag-1, tag-2 comes from test.html
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-1');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').contains('tag-2');
      cy.get('[data-tagelect-tag-input]').should('have.focus');
    });
  });
 });

