describe('Tag deletion', () => {
  it('remove last tag when user presses Backspace in empty tag input', () => {
    cy.renderTagelectPage('tagelect-with-tags', {}, () => {
      cy.get('[data-tagelect-tag-input]').click().type('{backspace}');
      // NOTE: tag-1, tag-2 comes from test.html
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-1');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').should('not.exist');
      cy.get('[data-tagelect-tag-input]').should('have.focus');
    });
  });

  it('removes a tag after click on remove button', () => {
    cy.renderTagelectPage('tagelect-with-tags', {}, () => {

      // NOTE: tag-1, tag-2 comes from test.html
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-1');
      cy.get('#tagelect-with-tags-parent')
        .find('[data-tagelect-tag]:nth-child(1) > [data-tagelect-remove-button]')
        .click();
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').should('not.exist');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-2');
      // TODO: should input have focus here?
      //cy.get('[data-tagelect-tag-input]').should('have.focus');
    });

  });

  it('does not remove tags if Backspace is pressed and tag input is not empty', () => {
    cy.renderTagelectPage('tagelect-with-tags', {}, () => {
      cy.get('[data-tagelect-tag-input]').click().type('T{backspace}');
      // NOTE: tag-1, tag-2 comes from test.html
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-1');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').contains('tag-2');
      cy.get('[data-tagelect-tag-input]').should('have.focus');
    });
  });
});
