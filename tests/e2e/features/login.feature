Feature: login feature
  As a user
  I want to login
  So I can see my dashboard

  Scenario: Admin loggs in whith valid credentials
    Given the user has navigated to the login page
    When the user logs in with username "demo" and password "demo"
    Then the user should be navigated to the dashboard

  Scenario: A registered user loggs in with valid credentials
    Given the user has navigated to the login page
    When the user logs in with username "Alice" and password "aliceDemo@123"
    Then the user should be navigated to the dashboard
