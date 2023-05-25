# QuickQueue

[QuickQueue](http://xkdqzglrwm.ca02.qoddiapp.com) is an open‑source development platform. It is designed to bring you recommended video games using an AI model to parse your tastes and play history!

Our project, QuickQueue, is an app designed to help users on any gaming platform efficiently find their best matched video-games by using filters and AI to provide personalized game recommendations.

## Technologies Used
QuickQueue uses HTML, CSS, Node.js, the MongoDB databse, an OpenAI key and the IGDB API. The dependecies are located in package.json.

## Features

QuickQueue provides the following features:

- A sign-up and login feature
- Profile page that stores saved games and played games
- Trending Page of the currently most popular games
- Questionnaire to personalize your recommendations for you
- Recommended Page that takes your questionnaire answers into account
- Search by tags to find games in specific genres
- A random game page that will give you something you've definitely never seen!
...and
- A hidden easter egg!

## File Contents of folder

These are all the files you can expect to see after you clone the repo!

```bash
root
|   .gitignore
|   databaseConnection.js
|   index.js
|   package.json
|   Procfile
|   README.md
|   utils.js
|   
+---public
|       banana-dance.gif
|       contra.gif
|       logo-no-background.png
|       logo-transparent.png
|       mario-mystery-box.gif
|       no-cover.png
|       peppy.png
|       pom-pom-no.png
|       snorlax-dumper.gif
|       up-arrow.png
|       
+---scripts
|       browseGamesScripts.js
|       easterEgg.js
|       gameinfo.js
|       randomGame.js
|       
+---styles
|       404.css
|       browseGame.css
|       easterEgg.css
|       gameinfo.css
|       style.css
|       trending.css
|       
\---views
    |   404.ejs
    |   browseGames.ejs
    |   easterEgg.ejs
    |   gameinfo.ejs
    |   index.ejs
    |   login.ejs
    |   questionnaire.ejs
    |   questionnaireSubmit.ejs
    |   randomGame.ejs
    |   recommended_page.ejs
    |   resetPassword.ejs
    |   signup.ejs
    |   trending_page.ejs
    |   User_Profile.ejs
    |   
    \---templates
            footer.ejs
            genreCheckbox.ejs
            header.ejs
            headerloggedout.ejs
            hoursPlay.ejs
            platformCheckbox.ejs
            playerNumCheckbox.ejs
            recommended_card.ejs
            svgs.ejs
            trending_card.ejs
```

## System Requirements

Before you begin, make sure you have the following installed:

- [Node.js v16 or above](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git/)

## Getting Started With Local Development

QuickQueue is is using a single repo with multiple dependecies.

Follow these simple instructions to set up a local development environment.

1. Clone the repository and install dependencies located in package.json:

  ```
  git clone https://github.com/aaronawylo/2800-202310-DTC02.git
  npm install 
  ```

2. If you don't have an IDE to work with Node.js, download [VS Code](https://code.visualstudio.com/docs/?dv=win)

3. Install MongoDB [here](https://www.mongodb.com/docs/manual/installation/)

4. Sign up for a MongoDB account if you don't have one, and populate your MongoDB collection using this dataset.

[Kaggle Dataset](https://www.kaggle.com/datasets/arnabchaki/popular-video-games-1980-2023)

5. Follow the steps under Account Creation and Authentication on the IGDB API documentation site here:

[IGDB API](https://api-docs.igdb.com/#getting-started)

6. Follow the instructions here on OpenAI to sign up for an OpenAI API key

[OpenAI Quickstart](https://platform.openai.com/docs/quickstart/build-your-application)


**That's it, you are good to go! Happy hacking! 👾**

## Product Features

- A sign-up and login feature

1. On the homepage, click on either the Signup button if you do not have an account, or Login if you do!

- Profile page that stores saved games and played games

1. Click the login button and login to our app
2. Open the hamburger menu in the upper right corner
3. Click your name
4. Click profile

OPTIONAL
5. Navigate to any of the game info pages
6. Click Save/Mark as Played accordingly to save to your profile

- Trending Page of the currently most popular games

1. Scroll down to see a small version of the most trending games
2. Open the hamburger menu in the upper right corner
3. Click on "Trending Games"
4. View at your leisure!

- Questionnaire to personalize your recommendations for you

1. Open the hamburger menu in the upper right corner
2. Click on Questionnaire
3. Answer the questions!

- Recommended Page that takes your questionnaire answers into account

1. Do the Questionnaire as listed above
2. The Home page has recommended games for you
3. If you want more, click on your name in the hamburger menu, and click the Recommended
4. View at your leisure!

- Search by tags to find games in specific genres

1. Login/Signup to the website
2. Open the hamburger menu in the upper right corner
3. Click on Browse Games
4. Select the categories that interest you!

- A random game page that will give you something you've definitely never seen!

1. Open the hamburger menu in the upper right corner
2. Click on "Give me a Random Game"!
3. Click the Question Mark Block to get a game!

...and
- A hidden easter egg!

No steps, but here's a hint: It's on the Random Game page!

## API Documentation and Credits

We use MongoDB as our database, check them out here!

[MongoDB Documentation](https://www.mongodb.com/docs/)

We use both the OpenAI and IGDB APIs in our app. Below you can find links to their documentations:

[OpenAI Documentation](https://platform.openai.com/docs/guides/completion/introduction)
[IGDB Documentation](https://api-docs.igdb.com/)

Please refer to their documentation if you want to expand on the app!

## AI Usage

We did use the AI to help create our app. The majority of AI usage was in using ChatGPT in checking error codes and how to troubleshoot code. There were certain usages in creating templates of code as well, for example the Easter Egg game.

We did not use AI to create data sets or clean data sets, as our Kaggle Dataset was a 10.0 score to begin with, and the IGDB API does not require cleaning.

The best use of AI is integrated into the Recommended Pages. The app takes the user's stored preferences and generates a prompt to OpenAI and asks for video game recommendations. OpenAI creates a list of video games and we search the IGDB database with names matching those games to populate our page.

We encountered limitations coming to the AI as the prompt it gives can be variable if we were not very specific in our prompts, resulting in responses that our own app could not parse. We eventually solved this problem with a more specific prompt. We also encountered limitations in ChatGPT helping diagnose code, as sometimes it would give wrong code and we would lose time parsing to see why it's wrong and then coding, rather than just coding from scratch.

## Contact Information ✨

You can contact us at quickqueuedtc@gmail.com with any questions you have!