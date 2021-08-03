describe('Initial tag rendering', () => {
  it('renders the tags from input value', () => {
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
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').contains('tag-2');
    });
  });

  it('renders no tags if value is empty', () => {
    cy.visit('cypress/test.html').then(window => {
      // Find input for which to initialize the Tagelect
      cy.get('#tagelect').then(input => {
       const inputElement = input[0];

       // Initialize the Tagelect
       // TODO: share the logic somewhere
       inputElement.tagelect = new window.Tagelect(inputElement);
      });

      cy.get('#tagelect-parent [data-tagelect-tag]').should('not.exist');
    });
  });
 });

