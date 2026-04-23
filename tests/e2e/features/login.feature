Feature: Admin Login
  As an admin
  I want to log in to the admin panel
  So that I can manage products efficiently

  Scenario: Successful login with valid credentials
    Given admin user has navigated to the login page
    When admin user logs in with following credentials
      | email | password |
      | demo  | demo     |
    Then admin user should be navigated to admin panel dashboard
