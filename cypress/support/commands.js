// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('renderTagelectPage', (id, options, callback) => {
  cy.visit('cypress/test.html').then(window => {
    // Find input for which to initialize the Tagelect
    cy.get(`#${id}`).then(input => {
     const inputElement = input[0];

     // Initialize the Tagelect
     inputElement.tagelect = new window.Tagelect(inputElement, options);
    });

    callback();
  });
});

