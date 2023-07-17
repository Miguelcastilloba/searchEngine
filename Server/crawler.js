import * as puppeteer from 'puppeteer';
import { createConnection } from 'mysql';
import * as dotenv from 'dotenv';

dotenv.config();
const browser = await puppeteer.launch({headless:true});

var con = createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.SITES_DATABASE,
  });

  

  async function getLastLink(){

    // first we remove all duplicated links in DB by Url

    var query = "DELETE FROM Links WHERE Id NOT IN (SELECT MIN(Id) FROM Links GROUP BY Url)";
    var result = await queryToBd(query);
    
    // get the first element of the database who is not indexed
     query = "SELECT Url FROM Links WHERE Indexed = FALSE LIMIT 1";

     result = await queryToBd(query);
    // if there is no element who is not indexed, finish the program
    if(result.length == 0){
      
        process.exit();
    }else{
        // if there is an element who is not indexed, index it
        linkInfo(result[0].Url);
    }

  }

  async function linkInfo(link){

    console.log("Link Info", link);


    const page = await browser.newPage();
    await page.goto(link);
    const title = await page.title();

    var description, keywords, hrefs;
    // puppeter get description of the page if there is one
    try{
         description = await page.$eval('meta[name="description"]', element => element.content);
    }catch{
         description = "No description";
    }
 
    // puppeter get keywords of the page
    try{
    keywords = await page.$eval('meta[name="keywords"]', element => element.content);
    }catch{
     keywords = "No keywords";
    }
    // get a list of the href value of all links in the page
    try{
     hrefs = await page.$$eval('a', as => as.map(a => a.href));
  }catch{
     hrefs = []
  }
    page.close();

// Same query as above but is an update
    const query = "UPDATE Links SET Title = '"+title+"', Description = '"+description+"', Tags = '"+keywords+"', Indexed = TRUE WHERE Url = '"+link+"'";

    const success = await queryToBd(query);

    
    if(success){
 
        addLinksToBd(hrefs, link);
    
  }else{}

}

async function addLinksToBd(hrefs, link){

    // take hrefs and remove duplicates
    const uniqueHrefs = [...new Set(hrefs)];
    //take uniqueHrefs and add root to relative urls
    const rootHrefs = uniqueHrefs.map(href => {
        if(href.startsWith("/")){
            return link + href;
        }else{
            return href;
        }
    }
    );
    // remove url parameters from rootHrefs
    const rootHrefsNoParams = rootHrefs.map(href => {
        if(href.includes("?")){
            return href.split("?")[0];
        }else{
            return href;
        }
    }
    );

    
    // remove things who arent links
    hrefs = rootHrefsNoParams.filter(href => href.startsWith("http"));

    // insert rootHrefsNoParams into database
    hrefs.forEach(async href => {

        // santize href
        href = href.replace(/'/g, "\\'");
        
        const query = "INSERT INTO Links(Url, Indexed) VALUES ('"+href+"','FALSE')";
        const success = await queryToBd(query);  
 
}
    );

    getLastLink();

}

  async function queryToBd(query){

 
    return new Promise((resolve, reject) => {
      con.query(query, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });

}

getLastLink();

