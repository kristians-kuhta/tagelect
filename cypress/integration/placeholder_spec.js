describe('Placeholder behaviour', () => {
  it('renders the default placeholder', () => {
    cy.visit('cypress/test.html').then(window => {
      // Find input for which to initialize the Tagelect
      cy.get('#tagelect').then(input => {
        const inputElement = input[0];

        // Initialize the Tagelect
        // TODO: share the logic somewhere
        inputElement.tagelect = new window.Tagelect(inputElement);
      });

      cy.get('#tagelect-parent')
	.find('[data-tagelect-tag-input][data-placeholder="Enter a tag..."]').should('exist');
    });
  });

  it('renders the a custom placeholder', () => {
    cy.visit('cypress/test.html').then(window => {
      // Find input for which to initialize the Tagelect
      cy.get('#tagelect').then(input => {
        const inputElement = input[0];

        // Initialize the Tagelect
        // TODO: share the logic somewhere
	const options = { placeholder: 'Custom placeholder' };
        inputElement.tagelect = new window.Tagelect(inputElement, options);
      });

      cy.get('#tagelect-parent')
	.find('[data-tagelect-tag-input][data-placeholder="Custom placeholder"]').should('exist');
    });
  });
 });

