@deleteAutomationBond
Feature: Delete Automation Bonds

  Scenario: Delete all Automation Bond Sudha stories
    Given user is on Dashboard page for Search
    When user navigates to Search page
    And user deletes all bonds starting with "Automation Bond Sudha"
    Then no bonds starting with "Automation Bond Sudha" should exist
