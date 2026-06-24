@smoke @searchAlert
Feature: Create alerts from Search page

  Scenario: Add story from Search to Dashboard and create alerts
    Given user is on Dashboard page for Search Alert
    When user navigates to Search page
    And user opens the first story result from Search
    And user adds the story to Dashboard with a generated title
    Then story tile should be visible on Dashboard

    When user creates "Instant" alert for the story tile from Dashboard
    And user creates "Digest" alert for the story tile from Dashboard
    Then email alerts should contain alert with story destinations
    #And user deletes alert with story destinations


    Scenario: Save search and create alerts from saved search and dashboard feed
    Given user is on Dashboard page for Search Alert
    When user navigates to Search page
    And user captures a random word from any story result title
    And user searches using the captured word
    And user saves the search using the captured word
    Then saved search should be available in Saved Searches dropdown

    When user creates "Instant" alert for the saved search
    And user creates "Digest" alert for the saved search
    And user adds the saved search to Dashboard
    Then saved search tile should be visible on Dashboard

    When user creates "Instant" alert for the saved search dashboard tile
    And user creates "Digest" alert for the saved search dashboard tile
    Then email alerts should contain alert with captured search name
   # And user deletes alert with captured search name