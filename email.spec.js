const fakeAccounts = [
  {
    username: 'John Robinson',
    password: 'jrfakepassword'
  },
  {
    username: 'Hello world',
    password: 'worldHelloYou'
  },
  {
    username: 'Javascript',
    password: 'Golang'
  },
  {
    username: 'gRpc',
    password: 'ElasticKibana'
  }
]
context('Email Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('test login module', () => {
    // test ui
    cy.url().should('eq', 'http://localhost:3000/login')
    cy.get('.login-class').should('be.visible')
    cy.get('label[for="username"]').should('be.visible').click()
    cy.focused().should('have.attr', 'id', 'username')
    cy.get('label[for="password"]').should('be.visible').click()
    cy.focused().should('have.attr', 'id', 'password')
    // test login module without username password
    cy.get('button.login-btn').click()
    cy.get('div.error').invoke('text').should('equal', 'Please enter both username and password')

    // test login module with username only
    cy.get('input#username').type('fakeUsername').should('have.value', 'fakeUsername')
    cy.get('button.login-btn').click()
    cy.get('div.error').invoke('text').should('equal', 'Please enter password')

    // test login module with password only
    cy.get('input#password').type('fakePassword').should('have.value', 'fakePassword')
    cy.get('button.login-btn').click()
    cy.get('div.error').invoke('text').should('equal', 'Please enter username')

    // test login module with wrong username and password
    fakeAccounts.forEach((account) => {
      cy.get('input#username').type(account.username).should('have.value', account.username)
      cy.get('input#password').type(account.password).should('have.value', account.password)
      cy.get('button.login-btn').click()
      cy.get('div.error').invoke('text').should('equal', 'Invalid credentials!')
    })
  })

  it('test mail box module', () => {
    // test url if login with a correct account
    const CORRECT_USN = 'admin'
    const CORRECT_PWD = '123'
    let mailToDeleteName
    cy.get('input#username').type(CORRECT_USN).should('have.value', CORRECT_USN)
    cy.get('input#password').type(CORRECT_PWD).should('have.value', CORRECT_PWD)
    cy.get('button.login-btn').click()
    // cy.wait(1000) // wait for page navigation
    // check url when navigated to mailbox
    cy.url().should('eq', 'http://localhost:3000/mailbox')
    // get number of unread mails
    let unreads, deleted
    cy.get('span.unreads').invoke('text').then((num) => (unreads = Number(num)))
    cy.get('span.deleted').invoke('text').then((num) => (deleted = Number(num)))
    // going to delete the second mail
    cy.get('div.mail').then((elements) => {
      cy.wrap(elements[1]).invoke('attr', 'name').then((name) => (mailToDeleteName = name)) // get the name of the second mail that going to be deleted
    })
    // heading to trash box in order to confirm the absense of name of the mail that going to be deleted
    cy.get('a[href="/trash"]').click() // click trash mail <a> tag
    cy.wait(100)
    cy.url().should('eq', 'http://localhost:3000/trash') // check trash box url
    cy.get('div.mail').each((element) => {
      cy.wrap(element).invoke('attr', 'name').then((name) => expect(name).not.to.be.equal(mailToDeleteName))
    })

    // redirect to unread mails to delete mail with specified with name above assigned in mailToDeleteName
    cy
      .get('a[href="/mailbox"]')
      .click()
      .then(() => {
        cy.wait(100)
        cy.get(`div.mail[name=${mailToDeleteName}]`).within(($e) => { // within means scoping all the cy in the particular dom
          cy.get('button[name="deleteMail"]').click() // click delete button to move it to trash box
        })
      })
    // check unread mail and deleted mail count
    cy.get('span.unreads').invoke('text').then((num) => expect(Number(num)).to.equal(unreads - 1)) // check if the number of unread mails decreased by 1
    cy.get('span.deleted').invoke('text').then((num) => expect(Number(num)).to.equal(deleted + 1)) // check if the number of deleted mails increased by 1
    // Redirect to trash box to check the present of deleted mail
    cy.get('a[href="/trash"]').click().then(() => {
      cy.url().should('eq', 'http://localhost:3000/trash')
      cy.wait(100)
      cy.get(`div.mail[name=${mailToDeleteName}]`).should('be.visible')
    })
  })

})