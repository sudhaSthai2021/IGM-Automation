@smoke @discover @alert
Feature: Create alerts from Discover page and Dashboard

  Background:
    Given user is on Dashboard page for Discover Alert

  Scenario: Create Instant and Digest alerts from Discover tile and Dashboard tile

    When user navigates to Discover page
    And user selects Discover filters
      | English          |
      | Credit           |
      | Europe           |
      | Investment Grade |

    And user captures Discover tile destinations from Add To Dashboard modal
    And user creates Instant and Digest alerts from Discover tile
    Then Discover Instant and Digest alerts should be available in Email Alerts

    When user navigates back to Discover page
    And user adds Discover tile to Dashboard with title

    Then Discover story should appear on Dashboard

    When user creates Instant and Digest alerts for the same story from Dashboard
    Then Dashboard Instant and Digest alerts should be available in Email Alerts