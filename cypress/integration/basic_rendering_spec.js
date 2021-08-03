describe('Basic rendering', () => {
  it('hides the actual input field and renders Tagelect input', () => {
    cy.visit('cypress/test.html').then(window => {
      // Find input for which to initialize the Tagelect
      cy.get('#tagelect').then(input => {
       const inputElement = input[0];

       // Initialize the Tagelect
       inputElement.tagelect = new window.Tagelect(inputElement);
       // Expect that input will be hidden
       expect(inputElement).not.to.be.visible;
      });

      // Make sure the wrapper is being rendered
      cy.get('#tagelect-parent').find('.tagelect').should('exist');
    });
  });
 });

