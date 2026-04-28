Feature: Add project
  As an admin
  I want to create projects from the dashboard
  So that I can manage my projects

  Background:
    Given admin user has navigated to the login page
    And admin user log in with following credentials
      | email | password |
      | demo  | demo     |
    And admin user should be navigated to admin panel dashboard

  Scenario: Create new project successfully
    Given the admin is on the dashboard page
    When the admin creates a project with the following details
      | name        |
      | TestProject |
    Then the project "TestProject" should be visible on the dashboard
