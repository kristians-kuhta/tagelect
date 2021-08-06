describe('Initial tag rendering', () => {
  it('renders the tags from input value', () => {
    cy.renderTagelectPage('tagelect-with-tags', {}, () => {
      // NOTE: tag-1, tag-2 comes from test.html
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(1)').contains('tag-1');
      cy.get('#tagelect-with-tags-parent [data-tagelect-tag]:nth-child(2)').contains('tag-2');
    });
  });

  it('renders no tags if value is empty', () => {
    cy.renderTagelectPage('tagelect-with-tags', {}, () => {
      cy.get('#tagelect-parent [data-tagelect-tag]').should('not.exist');
    });
  });
 });
