# TaskNetWeb

# Requirements
1. Node 22.11.0 or later
1. NPM 10.9.0 or later
1. Firebase
1. PayPal

# Firebase Setup - Important - Use Test Mode options not Production Mode

1. Create a Firebase Project
Go to the Firebase Console.

Click on "Add project" (or "Create a project").

Enter your desired Project name.

(Optional) Edit the Project ID. This ID is unique across Firebase.

Click "Continue".

You'll be asked if you want to enable Google Analytics for your project. This is recommended for most projects but can be disabled if not needed. Make your selection and click "Continue" (or "Create project" if you disabled Analytics).

If you enabled Analytics, configure your Google Analytics account (or create a new one) and select your country/region. Accept the terms.

Click "Create project". Firebase will provision your project. This might take a few moments.

Once ready, click "Continue". You will be redirected to your project's overview page.

2. Enable Firestore Database
In the Firebase console, from the left-hand navigation pane, under "Build", click on "Firestore Database".

Click on the "Create database" button.

Choose your Security rules mode:

Start in production mode: Your data is private by default. You will need to write security rules to allow access. This is recommended for production applications.

Start in test mode: Your data is open by default for a limited time (usually 30 days). This is useful for initial development but remember to secure your rules before going live.

Select a Cloud Firestore location. Choose a region closest to your users. Important: You cannot change this location later.

Click "Enable".

3. Enable Authentication with Google Sign-In
In the Firebase console, from the left-hand navigation pane, under "Build", click on "Authentication".

Click on the "Get started" button.

You will be taken to the "Sign-in method" tab.

Under "Native providers" (or "Additional providers" depending on the console version), click on "Google".

Toggle the "Enable" switch to the on position.

Select a Project support email from the dropdown. This email is shown to users when they sign in with Google.

Click "Save".

4. Enable Firebase Storage
In the Firebase console, from the left-hand navigation pane, under "Build", click on "Storage".

Click on the "Get started" button.

Review the information about security rules for Storage. You can start with the default rules and modify them later.

The default rules often allow reads and writes if the user is authenticated.

Choose a Cloud Storage location. Important: This location is tied to your default Google Cloud Platform (GCP) resource location, which was likely set when you created the project or enabled Firestore. You cannot change it easily after setting it up.

Click "Next" (or "Done").

5. Set up for Vertex AI
Firebase projects are also Google Cloud projects. Vertex AI is a Google Cloud service. To use Vertex AI with your Firebase project:

Ensure your Firebase project is on the Blaze (pay-as-you-go) plan. Vertex AI services typically require a billing-enabled project.

In the Firebase console, at the bottom of the left navigation pane, you'll see your current plan (e.g., "Spark plan"). Click on it to upgrade to the "Blaze plan" if necessary.

Enable the Vertex AI API in Google Cloud Console:

Open the Google Cloud Console.

Ensure the project selected in the Google Cloud Console is the same as your Firebase project. You can select it from the project dropdown at the top of the page.

In the navigation menu (hamburger icon ☰), go to "APIs & Services" > "Library".

Search for "Vertex AI API".

Click on it from the search results.

Click the "Enable" button. If it's already enabled, you'll see "API enabled".

Permissions for Vertex AI:

The service account you'll use (see next section) or your user account will need appropriate IAM roles to interact with Vertex AI (e.g., "Vertex AI User", "Vertex AI Service Agent"). These are typically managed in the Google Cloud Console under "IAM & Admin".

6. Obtain firebase-admin.json (Service Account Key)
The firebase-admin.json file contains credentials for a service account, which allows your backend code to interact with Firebase services with admin privileges (bypassing security rules).

In the Firebase console, click on the Gear icon (Project settings) next to "Project Overview" in the top left navigation.

Select "Project settings".

Go to the "Service accounts" tab.

You will see information about the Firebase Admin SDK.

Ensure that "Node.js" (or your preferred language for the Admin SDK) is selected in the code snippet section to see relevant instructions, though the key generation is the same.

Click on the "Generate new private key" button.

A warning will appear stating that you should store this key securely. Click "Generate key".

A JSON file (e.g., your-project-name-firebase-adminsdk-xxxx-xxxxxxxxxx.json) will be downloaded to your computer.

Rename this file to firebase-admin.json (or as required by your application's configuration).

# PayPal Sandbox Setup & API Credentials Guide
This guide will walk you through setting up a PayPal Developer Sandbox environment and obtaining your test Client ID and Client Secret for integrating PayPal into your application.

1. Access the PayPal Developer Dashboard
Go to the PayPal Developer Portal.

If you have an existing PayPal account, you can often use it to log in. If not, you'll need to sign up for a developer account (which may also create a business account if you don't have one).

Click on "Log In to Dashboard" in the top right corner.

Enter your PayPal account credentials and log in.

2. Navigate to API Credentials
Once logged into the Developer Dashboard, you should land on the "My Apps & Credentials" page.

Ensure that the toggle at the top of this section is set to "Sandbox" (not "Live"). This is crucial for getting test credentials.


(Illustrative placeholder: The actual UI might show a toggle or tabs for Sandbox/Live)

3. Create a New Sandbox App
Under the "REST API apps" section, click the "Create App" button.

If you already have sandbox apps, you might see them listed here. You can either use an existing one or create a new one for your specific project.

Enter an "App Name" for your test application (e.g., "My Test Store", "Project X Integration").

Choose a "Sandbox developer account". This will be automatically selected or you might have a list if you've created multiple sandbox business/personal accounts. For most basic integrations, the default one is fine.

Click the "Create App" button.

4. Obtain Your Sandbox API Credentials
After your app is created, you will be taken to its details page.

On this page, you will find your Sandbox API credentials:

Client ID: This is a long string of characters.

Secret: This is also a long string of characters. By default, it might be hidden. Click "Show" to reveal it.


(Illustrative placeholder: The actual UI will display your credentials)

Copy these credentials securely. You will need them to configure your application to use the PayPal Sandbox environment for testing payments.

Client ID: SB_CLIENT_ID_EXAMPLE_XXXXXXXXXXXXXXXXXXXX (This is what it will look like)

Secret: SB_SECRET_EXAMPLE_YYYYYYYYYYYYYYYYYYYYYYYY (This is what it will look like)

5. (Optional) Create Sandbox Test Accounts
For thorough testing, you'll likely want to create sandbox buyer and seller accounts:

In the PayPal Developer Dashboard, navigate to "Sandbox" > "Accounts" from the left-hand menu (or a similar navigation path).

Here you can create pre-configured sandbox accounts (both business and personal types) with mock balances.

You can then use the credentials (email/password) of these sandbox accounts to simulate making and receiving payments in your application when it's integrated with your Sandbox Client ID and Secret.

# How to run
1. run `npm i`
1. create a `.env` file in the project root
1. Add the folowing properties to the .env
    1. `NEXT_PUBLIC_DEV=true`
    1. `NEXT_PUBLIC_API_URL=http://localhost:1020`
    1. `NEXT_PUBLIC_FIREBASE_API_KEY=<provided api key>`
    1. `NEXT_PUBLIC_FIREBASE_APPID=<provided app id>`
    1. `NEXT_PUBLIC_AUTH_DOMAIN=<provided auth domain>`
    1. `NEXT_PUBLIC_MEASUREMENT_ID<provided measurement id>`
    1. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<provided messaging sender id>`
    1. `NEXT_PUBLIC_FIREBASE_PROJECT_ID=<provided project id>`
    1. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<provided storage bucket>`
    1. `NEXT_PUBLIC_PAYPAL_CLIENT_ID=<paypal client id>`
    1. `PAYPAL_CLIENT_ID=<paypal client id>`
    1. `PAYPAL_CLIENT_SECRET=<paypal client secret>`
    1. `PAYPAL_ENV=sandbox`
1. Run `npm run dev` to run the API locally on `http://localhost:3000`