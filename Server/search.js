import { createConnection } from 'mysql';
import * as dotenv from 'dotenv';

dotenv.config();

var con = createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.SITES_DATABASE,
  });

async function search (searchQuery) {

  console.log("searching for: "+searchQuery);
    //split the search query into words
    var words = searchQuery.split(" ");
    var query, dbResults;

    var resultsArray= [];
    var imagesArray = [];
   
    //the selected block, but using a for loop instead of forEach

    for (var i = 0; i < words.length; i++) {

      query = "SELECT Url FROM Links WHERE Url LIKE '%"+words[i]+"%' LIMIT 5";
      dbResults = await queryToBd(query);

    dbResults.forEach(element => {
  
       resultsArray.push(element.Url);
      });

         query = "SELECT Url FROM Links WHERE Title LIKE '%"+words[i]+"%' LIMIT 5";
         dbResults = await queryToBd(query);

       dbResults.forEach(element => {
   
          resultsArray.push(element.Url);
         });

         query = "SELECT Url FROM Links WHERE Description LIKE '%"+words[i]+"%' LIMIT 5";
         dbResults = await queryToBd(query);

       dbResults.forEach(element => {

          resultsArray.push(element.Url);
         });

         query = "SELECT Url FROM Links WHERE Tags LIKE '%"+words[i]+"%' LIMIT 5";
         dbResults = await queryToBd(query);

       dbResults.forEach(element => {
    
          resultsArray.push(element.Url);
         });

         query = "SELECT Url FROM Images WHERE url LIKE '%"+words[i]+"%' LIMIT 5";
         dbResults = await queryToBd(query);

       dbResults.forEach(element => {
    
          imagesArray.push(element.Url);
        
         });

         query = "SELECT url FROM Images WHERE alt LIKE '%"+words[i]+"%' LIMIT 5";
         dbResults = await queryToBd(query);

       dbResults.forEach(element => {
    
          imagesArray.push(element.Url);
      
         });

     }

     // delete undefined elements
      imagesArray = imagesArray.filter(function (el) {
        return el != null;
      });

     imagesArray = sortByAppear(imagesArray);

     imagesArray = removeDuplicates(imagesArray);

      imagesArray = await searchTermsImages(imagesArray, words);

      imagesArray = await finalSelectionImages(imagesArray);


     // sort the array by the number of times the url appears
     resultsArray = sortByAppear(resultsArray);

      // remove duplicates
     resultsArray = removeDuplicates(resultsArray);

      // search the number of times the search terms appear in the url, title, description, and tags
      resultsArray = await searchTerms(resultsArray, words);

      // final sort by apearence and return the top 5 results 

      resultsArray = await finalSelection(resultsArray);

      resultsArray = [...resultsArray, imagesArray];

      resultsArray = resultsArray.flat();

    return resultsArray;

}

async function finalSelection(array) {

  var newArray = [];

  array.sort(function(a, b) {
    return b.count - a.count;
  });

  for (var i = 0; i < 5; i++) {

    if (array[i] != null) {
      newArray.push(array[i]);
    }
  }

  // get the title and description for elements in newArray

  var query, dbResults;

  for (var i = 0; i < newArray.length; i++) {

    query = "SELECT Title, Description FROM Links WHERE Url = '"+newArray[i].url+"'";

    dbResults = await queryToBd(query);

    if (dbResults[0].Title != null) {
    newArray[i].title = dbResults[0].Title;
    }
    if(dbResults[0].Description != null){
    newArray[i].description = dbResults[0].Description;
    }


  }

  // add an Id to each element in newArray

  for (var i = 0; i < newArray.length; i++) {
    newArray[i].Id = i;
    newArray[i].type = "link";
    delete newArray[i].count;
  }

 


  return newArray;

}

async function finalSelectionImages(array) {

  var newArray = [];

  array.sort(function(a, b) {
    return b.count - a.count;
  });

  for (var i = 0; i < 5; i++) {

    if (array[i] != null) {
      newArray.push(array[i]);
    }
  }

  // get the title and description for elements in newArray

  var query, dbResults;

  for (var i = 0; i < newArray.length; i++) {

    query = "SELECT alt FROM Images WHERE Url = '"+newArray[i].url+"'";

    dbResults = await queryToBd(query);

    if (dbResults[0].alt != null) {
    newArray[i].alt = dbResults[0].alt;
    }
    


  }

  // add an Id to each element in newArray

  for (var i = 0; i < newArray.length; i++) {
    newArray[i].  Id = i;
    newArray[i].type = "image";
    delete newArray[i].count;
  }


  return newArray;

}

async function searchTerms(array, words) {

  var query, dbResults;

  for (var i = 0; i < array.length; i++) {

    var count = array[i].count;


    query = "SELECT Title, Description, Tags FROM Links WHERE Url = '"+array[i].url+"'";

    dbResults = await queryToBd(query);

    // search how many times every word appears in the url, title, description, and tags

    for (var j = 0; j < words.length; j++) {

      if (dbResults[0].Title != null) {
        count += dbResults[0].Title.split(words[j]).length - 1;
      }

      if (dbResults[0].Description != null) {
        count += dbResults[0].Description.split(words[j]).length - 1;
      }

      if (dbResults[0].Tags != null) {
        count += dbResults[0].Tags.split(words[j]).length - 1;
      }

    }

    array[i].count = count;

  }

  return array;

}

async function searchTermsImages(array, words) {

  var query, dbResults;

  for (var i = 0; i < array.length; i++) {

    var count = array[i].count;


    query = "SELECT url, alt FROM Images WHERE url = '"+array[i].url+"'";

    dbResults = await queryToBd(query);

    // search how many times every word appears in the url, title, description, and tags

    for (var j = 0; j < words.length; j++) {

      if (dbResults[0].Title != null) {
        count += dbResults[0].Title.split(words[j]).length - 1;
      }

      if (dbResults[0].Description != null) {
        count += dbResults[0].Description.split(words[j]).length - 1;
      }

      if (dbResults[0].Tags != null) {
        count += dbResults[0].Tags.split(words[j]).length - 1;
      }

    }

    array[i].count = count;

  }

  return array;

}
    

function removeDuplicates(array) {

  var newArray = [];

  for (var i = 0; i < array.length; i++) {

    for (var j = 0; j < newArray.length; j++) {

      if (array[i].url == newArray[j].url) {
        break;
      }
    }

    if (j == newArray.length) {
      newArray.push(array[i]);
    }
  }

  return newArray;

}

function sortByAppear(array) {

  //create a new array of objects with the url and the number of times it appears

  var newArray = [];
  var count = 0;

  for (var i = 0; i < array.length; i++) {

    for (var j = 0; j < newArray.length; j++) {

      if (array[i] == newArray[j].url) {
        count++;
      }
    }

    if (count == 0) {
      newArray.push({url:array[i], count:1});
    }
    else {
      newArray.push({url:array[i], count:count});
    }
  }

  //sort the array by the number of times the url appears

  newArray.sort(function(a, b) {
    return b.count - a.count;
  });

  return newArray;
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
export {search};