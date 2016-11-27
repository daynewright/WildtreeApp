# WildTree App (Workshop Ordering Tool)

Hosted version here: [WildTree App](#)


This is an application that helps [WildTree](http://www.wildtree.com) reps communicate and purchase meat bundles from butchers for freezer meal workshops.  It solves the current problem of reps communicating with butchers by email for preparing customer bundle orders.

## Technologies

Angular | FireBase | SASS | Bower | Grunt

## Video Overview

You can watch a quick 7 minute video presentation of the application [here](#).

## Walkthrough

Below is a Walkthrough of the functionality of the application from a rep and butcher user role.

### Login

The application has user authentication through Firebase.  You are able to login with a Google or Facebook account.  _(Currently all accounts created are rep accounts.)_

<kbd>![Login](lib/img/login.png)</kbd>

## Rep Account - User Experience

### Creating Workshops

The first time you login as a rep you will see a an empty list of workshops with the option to create one.

<kbd>![CreateBoard](lib/img/dashboard.png)</kbd>

Once you click _"Add a New Workshop"_ a modal will open with options for name, date, time and bundles.

<kbd>![AddWorkshop](lib/img/addWorkshop.png)</kbd>

Once you click _"Add Workshop"_ then the modal is closed and the new workshop is added to the dashboard with options to submit the workshop, add orders or delete the workshop.

<kbd>![dashboardWorkshop](lib/img/dashboardWorkshop.png)</kbd>

### Adding Orders

Clicking on _"Update Order"_ will open the order dashboard for the new workshop as seen below.  Since it is the first time it has been selected for this workshop the order will be empty.

<kbd>![orderDashboard](lib/img/orderDashboard.png)</kbd>

Clicking on _"Add A New Order"_ will give you the option to _"Add Order"_ or  _Add Custom Order"_ _(A custom order will let you change the default meat on each meal)_.

<kbd>![addOrder](lib/img/addOrder.png)</kbd>

####  - Adding Normal Order

Select the bundle type and it will list off the meals included.  Then add the quantity you need and click _"Add Order"_.

<kbd>![NormalOrderModal](lib/img/normalOrderModal.png)</kbd>

#### - Adding Custom Order

Select the bundle you need to make custom.  You can then select the meats you need to update in each meal.  After that add the quantity and click _"Add Order"_.

<kbd>![customOrderModal](lib/img/customOrderModal.png)</kbd>

Once orders are added the order dashboard will look like the screen below with the option to remove and update orders.

<kbd>![orderDashboard2](lib/img/orderDashboard2.png)</kbd>
