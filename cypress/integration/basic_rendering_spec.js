describe('Basic rendering', () => {
  it('hides the actual input field and renders Tagelect input', () => {
    cy.renderTagelectPage('tagelect', {}, () => {
        // Expect that input will be hidden
        cy.get('#tagelect').should('be.hidden');
        // Make sure the wrapper is being rendered
        cy.get('#tagelect-parent').find('[data-tagelect-wrapper]').should('exist');
      }
    );
  });
 });
