Feature: Login
    As an admin user
    I want to log in to the website admin panel
    so that I can manage my projects

  Scenario: Login with valid credentials
    Given the admin user has navigated to the login page
    When the admin user logs in with the following credentials:
      | email | password |
      | demo  | demo     |
    Then the admin user should be navigated to admin panel dashboard
