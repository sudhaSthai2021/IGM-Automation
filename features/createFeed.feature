@smoke @feed
Feature: Create Feed

  Scenario: Create a feed and verify it appears on dashboard
    Given user is on Dashboard page for Feed
    When user navigates to Create Feed page
    And user creates a feed with destinations:
  | Content Type | PULSE  |
  | Product      | CREDIT |
  | Asset Class  | IG     |
  | Geography    | EUROPE |
    Then feed should be saved successfully
    And created feed should be visible on Dashboard