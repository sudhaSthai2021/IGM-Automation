import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StoryEditorPage } from '../pages/StoryEditorPage';
import { AlertsPage } from '../pages/AlertsPage';
import { FeedPage } from '../pages/FeedPage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { SearchPage } from '../pages/SearchPage';

export interface AlertExpectedData {
  destinations: string[];
  alertType: string;
  timeZone: string;
  emailRange: string;
}

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  login!: LoginPage;
  dashboard!: DashboardPage;
  feed!: FeedPage;
  discover!: DiscoverPage;

  search!: SearchPage;
  searchStoryTitle!: string;
  searchStoryDestinations!: string[];
  savedSearchName!: string;

  // new page
  storyEditor!: StoryEditorPage;
  alert!: AlertsPage;

  updatedHeadline: string = '';
  updatedBody: string = '';

  // Feed information
  feedDestinations: string[] = [];
  feedName: string = '';

  selectedDestinations: string[] = [];
  matchingAlerts: string[] = [];

  // Discover story information
  discoverStoryTitle: string = '';
  discoverStoryDestinations: string[] = [];
  selectedDiscoverTileTitle: string;

  discoverInstantAlertExpectedData: any;
  discoverDigestAlertExpectedData: any;
  dashboardInstantAlertExpectedData: any;
  dashboardDigestAlertExpectedData: any;

  searchStoryInstantExpectedData!: AlertExpectedData;
searchStoryDigestExpectedData!: AlertExpectedData;

savedSearchInstantExpectedData!: AlertExpectedData;
savedSearchDigestExpectedData!: AlertExpectedData;

savedSearchDashboardInstantExpectedData!: AlertExpectedData;
savedSearchDashboardDigestExpectedData!: AlertExpectedData;

  // Alert information
  alertType: string = '';

  alertExpectedData: AlertExpectedData = {
    destinations: [],
    alertType: '',
    timeZone: '',
    emailRange: ''


  };


}

setWorldConstructor(CustomWorld);