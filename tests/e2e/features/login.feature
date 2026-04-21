Feature: login
 As an admin
 I want to log in to the website admin panel
 So that I can manage my products

  Scenario: login with valid credentials
    Given admin user has navigated to the login page
    When admin user log in with following credentials
      | email | password |
      | demo  | demo     |
    Then admin user should be navigated to admin panel dashboard
