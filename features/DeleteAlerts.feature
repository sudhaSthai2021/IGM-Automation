@deleteAlerts
Feature: Delete Alerts

  Scenario: Delete all existing alerts
    Given user is on Dashboard page for alert deletion
    When user navigates to Alerts page
    And user deletes all existing alerts
    Then no alerts should be displayed