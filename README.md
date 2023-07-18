# searchEngine

<p>This is a full Stack Application using Node(W/Express & Puppeteer) / Mysql and React (W/Tailwind) who emulates a search Engine</p>

<p>The backend is made of a Crawler who recursively takes the firts non indexed url into the DB gets their info (Title, description and tags) and saves it
then saves all of the hrefs and images present into the document and saves them </p>

<p>And the /Search endpoint who receives a search query and search for the best 5 results (Links and images) and retrieves them </p>

<p>The front end is a react application who takes the user search method and displays the results into a (kind of Google) list </p>

<p>Into this repo is included a Sample Db with around 80 Indexed links, 240 images, and around 3500 non indexed links around the Premier League site,
so you can search for terms like: "Premier League USA", "Luton Town", "Nike" or "Rashford" </p>

##Install and Run:

<p>You´ll need to first add the included database "Links" into your local Mysql Client (You can use the included data or drop it and start for scratch just adding a single line into the Links table with the desired utl and Indexed status set to 0. (The crawler will automatically start from here when started)</p>

<p>For the backend you need to got to /Server:  "NPM install" and "node index.js"  <br>
you can start the crawler with "node crawler.js"</p>

<p>For the front End you need to go to /Client/Search and "NPM install, then "NPM run dev"</p>

