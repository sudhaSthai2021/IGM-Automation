@smoke @editor
Feature: Create Bond Issue and verify Story Editor functionality

  Scenario: Create and Publish Bond Issue

    Given user is on Dashboard page for Story Editor
    When user navigates to Author page and selects English
    And user clicks Create Bond Issue
    And user enters headline and body content
    And user verifies all Rich Text Editor controls are available and functional
    And user clicks Create
    Then Story Editor page should be displayed

    When user selects destinations:
      | Credit |
      | Europe |
      | IG     |
      | Pulse  |

    And user verifies previously entered editor content is retained
    And user verifies all Rich Text Editor controls are available and editable
    And user enables Resend Alerts
    And user clicks Publish

    Then story should be published successfully

  # And user navigates to Email Alerts page
  #And user identifies matching email alerts based on selected destinations
  # Then email notification should be received for matching alerts

 # @known_issue
 # Scenario: Verify image upload shows error in Story Editor

 #   Given user is on Dashboard page for Story Editor
 #   When user navigates to Author page and selects English
 #   And user clicks Create Bond Issue
#    Then image upload should show error message