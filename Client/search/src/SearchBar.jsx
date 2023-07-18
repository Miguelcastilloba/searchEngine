// SearchBar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

async function fetchData(query) {
  try {
    const response = await axios.get('http://localhost:3000/Search?query='+query);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

const Search = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchData().then((data) => {
      setResults(data);
    });
  }, []);

  return (
    <div className='flex flex-col'>
  
        <form  onSubmit={(e) => {
            e.preventDefault();
            fetchData(e.target.query.value).then((data) => {
                setResults(data);
            });
        }}>
              <div className="flex items-center border-b border-teal-500 py-2 mb-10">
            <input type="text" name="query" className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none' />
            <input type="submit" value="Search" className='flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded'/>
            </div>
        </form>

        <div className='grid grid-cols-3 gap-4 mb-10'>

            {

              results.filter((result) => result.type === "image").map((result) => (

                <div key={result.Id} className='content-start items-start flex flex-col'>
                    <img src={result.url} alt={result.alt || "Non available description"} className='mb-2'/>
                    
                </div>

            ))

            }

        </div>

        <ul className='content-start items-start flex flex-col'>
        
            {

              results.filter((result) => result.type === "link").map((result) => (
          
                <li key={result.Id} className='mb-6 content-start items-start flex flex-col'>
                    <h3><a href={result.url}>{result.title || result.url}</a></h3>
                    <p className='text-left'>{result.description || "non available description"}</p>
                </li>
          
            ))
            
            }

           

        </ul>


    </div>
  );
};

export  {Search};
