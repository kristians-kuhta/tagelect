describe('Placeholder behaviour', () => {
  it('renders the default placeholder', () => {
    cy.renderTagelectPage('tagelect', {}, () => {
      cy.get('#tagelect-parent')
        .find('[data-tagelect-tag-input][data-placeholder="Enter a tag..."]')
        .should('exist');
    });
  });

  it('renders the a custom placeholder', () => {
    cy.renderTagelectPage(
      'tagelect',
      { placeholder: 'Custom placeholder' },
      () => {
        cy.get('#tagelect-parent')
          .find('[data-tagelect-tag-input][data-placeholder="Custom placeholder"]')
          .should('exist');
      }
    );
  });
 });
