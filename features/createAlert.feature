@smoke @createAlert
Feature: Create Email Alert

Scenario Outline: Create Alert for a Feed
  Given user is on Dashboard page
  When user captures destinations for any available feed
 And user creates an "<AlertType>" alert for the same feed
  Then alert destinations should match the feed destinations

Examples:
  | AlertType |
  | Instant   |
  | Digest    |