Feature: Create users
  As an admin
  I want to create users
  So that I can organize them efficiently

  Scenario Outline: Create new users
    Given the admin user has logged in with the following credentials:
      | email | password |
      | demo  | demo     |
    And the admin user has navigated to users setting page
    When the admin user creates a new user with email "<email>", password "<password>", name "<name>" and username "<username>"
    Then the new user with email "<email>" should be added to users list
    Examples:
      | email             | password    | name    | username    |
      | ashish@gmail.com  | Ashish@123  | Ashish  | AshishUser  |
      | bipin@gmail.com   | Bipin@123   | Bipin   | BipinUser   |
      | sandesh@gmail.com | Sandesh@123 | Sandesh | SandeshUser |
