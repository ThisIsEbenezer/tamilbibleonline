import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Your custom CSS

const App = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('1'); // Default to Chapter 1
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState('All Verses'); // Default to All Verses
  const [bookContent, setBookContent] = useState(null);
  const [chapterContent, setChapterContent] = useState(null);
  const [verseContent, setVerseContent] = useState(null);

  // Fetch books with chapters when the component mounts
  useEffect(() => {
    const fetchBooksWithChapters = async () => {
      try {
        const response = await axios.get('https://tamilbibleonlineapi.netlify.app/.netlify/functions/api/books-with-chapters');
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books with chapters:', error);
      }
    };

    fetchBooksWithChapters();
  }, []);

  useEffect(() => {
    // Function to call the API
    const addCount = async () => {
      try {
        const response = await axios.get('https://tamilbibleonlineapi.netlify.app/.netlify/functions/api/addcount');
        console.log('Hit count added:', response.data);
      } catch (error) {
        console.error('Error adding hit count:', error);
      }
    };

    // Call the function when the component loads
    addCount();
  }, []);

  // Fetch verses when a chapter is selected
  const fetchVerses = async (book, chapter) => {
    try {
      const response = await axios.get(`https://tamilbibleonlineapi.netlify.app/.netlify/functions/api/bible/${book}/${chapter}`);
      setVerses(response.data.verses.map(verse => verse.verse));
      setChapterContent(response.data);
      setVerseContent(null); // Reset verse content
    } catch (error) {
      console.error('Error fetching verses:', error);
    }
  };


  // Fetch full book data when a book is selected
  const fetchFullBook = async (book) => {
    try {
      const response = await axios.get(`https://tamilbibleonlineapi.netlify.app/.netlify/functions/api/bible/${book}`);
      setBookContent(response.data);
      // Automatically set the first chapter
      setSelectedChapter('1');
      fetchVerses(book, '1'); // Fetch verses for the first chapter
    } catch (error) {
      console.error(`Error fetching full book ${book}:`, error);
    }
  };

  // Fetch verse data when a verse is selected
  const fetchVerse = async (book, chapter, verse) => {
    try {
      const response = await axios.get(`https://tamilbibleonlineapi.netlify.app/.netlify/functions/api/bible/${book}/${chapter}/${verse}`);
      setVerseContent(response.data);
    } catch (error) {
      console.error(`Error fetching verse ${book} Chapter ${chapter} Verse ${verse}:`, error);
    }
  };

  // Handle book change
  const handleBookChange = (e) => {
    const selected = e.target.value;
    setSelectedBook(selected);
    const selectedBookData = books.find(book => book.name === selected);
    if (selectedBookData) {
      setChapters(selectedBookData.chapters);
      fetchFullBook(selected);
      setSelectedVerse('All Verses'); // Reset to All Verses
    }
  };



  // Handle chapter change
  const handleChapterChange = (e) => {
    const chapter = e.target.value;
    setSelectedChapter(chapter);
    fetchVerses(selectedBook, chapter);
    setSelectedVerse('All Verses'); // Reset to All Verses when chapter changes
  };

  // Handle verse change
  const handleVerseChange = (e) => {
    const verse = e.target.value;
    setSelectedVerse(verse);
    if (verse === 'All Verses') {
      setVerseContent(null); // Clear specific verse content
    } else {
      fetchVerse(selectedBook, selectedChapter, verse);
    }
  };

  // Fetch verses for the initially selected chapter
  useEffect(() => {
    if (selectedBook) {
      fetchVerses(selectedBook, selectedChapter);
    }
  }, [selectedBook, selectedChapter]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="bg-primary text-white text-center py-3 fixed-top">
        Tamil Bible Online
        {/* <p className="lead">Explore the Bible by Book, Chapter, and Verse</p> */}

      </header>

      <div className="container flex-grow-1 mt-5 pt-5"> {/* Adjusted margins */}
        <div className="dropdowns mb-3 ">
          <div className="row">
            <div className="col">
              <select className="form-select" value={selectedBook} onChange={handleBookChange}>
                <option value="">Select a Book</option>
                {books.map((book, index) => (
                  <option key={index} value={book.name}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select className="form-select" value={selectedChapter} onChange={handleChapterChange} disabled={!selectedBook}>
                <option value="">Select a Chapter</option>
                {chapters.map((chapter, index) => (
                  <option key={index} value={chapter}>
                    Chapter {chapter}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select className="form-select" value={selectedVerse} onChange={handleVerseChange} disabled={!selectedChapter}>
                <option value="All Verses">All Verses</option>
                {verses.map((verse, index) => (
                  <option key={index} value={verse}>
                    Verse {verse}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="content">
          {bookContent && !verseContent && (
            <div className="book-content mb-4">
              <h2>{bookContent.book.english} ({bookContent.book.tamil})</h2>
              <div className="chapter-navigation d-flex justify-content-between mb-3">
                
                <button className="btn btn-danger" disabled={selectedChapter === '1'} onClick={() => {
                  const previousChapter = (parseInt(selectedChapter) - 1).toString();
                  setSelectedChapter(previousChapter);
                  fetchVerses(selectedBook, previousChapter);
                }}>
                  Previous Chapter
                </button>
                <button className="btn btn-danger" disabled={selectedChapter === chapters.length.toString()} onClick={() => {
                  const nextChapter = (parseInt(selectedChapter) + 1).toString();
                  setSelectedChapter(nextChapter);
                  fetchVerses(selectedBook, nextChapter);
                }}>
                  Next Chapter
                </button>
              </div>
             
              <div className="chapter-content bg-white p-4 rounded shadow-sm">
                <h2 className="text-center mb-4">{selectedBook} - Chapter {selectedChapter}</h2>
                <div className="row">
                  {chapterContent && chapterContent.verses.map((verse) => (
                    <div key={verse.verse} className="col-md-12 mb-3">
                      {/* <div className="card border-red bg-primary">
                        <div className="card-body">
                          <h5 className="card-title">Chapter {selectedChapter} : Verse {verse.verse}</h5>
                          <p className="card-text">{verse.text}</p>
                        </div>
                      </div> */}
                      <div className="card mb-3 shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <div className="card-header bg-primary text-white">
                          <h5 className="card-title m-0">Chapter {selectedChapter} : Verse {verse.verse}</h5>
                        </div>
                        <div className="card-body bg-light">
                          <p className="card-text" style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>{verse.text}</p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
                <h2 className="text-center mb-4">{selectedBook} - Chapter {selectedChapter}</h2>
              </div>


              <div className="chapter-navigation d-flex justify-content-between mb-3">
                <button className="btn btn-danger" disabled={selectedChapter === '1'} onClick={() => {
                  const previousChapter = (parseInt(selectedChapter) - 1).toString();
                  setSelectedChapter(previousChapter);
                  fetchVerses(selectedBook, previousChapter);
                }}>
                  Previous Chapter
                </button>
                <button className="btn btn-danger" disabled={selectedChapter === chapters.length.toString()} onClick={() => {
                  const nextChapter = (parseInt(selectedChapter) + 1).toString();
                  setSelectedChapter(nextChapter);
                  fetchVerses(selectedBook, nextChapter);
                }}>
                  Next Chapter
                </button>
              </div>
            </div>
          )}

          {verseContent && (
            <div className="verse-content mb-4">
              <h2>{selectedBook} - Chapter {selectedChapter} - Verse {selectedVerse}</h2>

              <div className="chapter-navigation d-flex justify-content-between mb-3">
                <button className="btn btn-danger" disabled={selectedVerse === '1'} onClick={() => {
                  const previousVerse = parseInt(selectedVerse) - 1;
                  if (previousVerse >= 1) {
                    setSelectedVerse(previousVerse.toString());
                    fetchVerse(selectedBook, selectedChapter, previousVerse.toString());
                  }
                }}>
                  Previous Verse
                </button>
                <button className="btn btn-danger" disabled={selectedVerse === chapterContent.verses.length.toString()} onClick={() => {
                  const nextVerse = parseInt(selectedVerse) + 1;
                  if (nextVerse <= chapterContent.verses.length) {
                    setSelectedVerse(nextVerse.toString());
                    fetchVerse(selectedBook, selectedChapter, nextVerse.toString());
                  }
                }}>
                  Next Verse
                </button>
              </div>
              <div className="card mb-3 shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title m-0">{selectedBook} - Chapter {selectedChapter} - Verse {selectedVerse}</h5>
                </div>
                <div className="card-body bg-light">
                  <p className="card-text" style={{ fontSize: '1.1rem', lineHeight: '1.5' }}> {verseContent.text}</p>
                </div>
              </div>

             
              <div className="chapter-navigation d-flex justify-content-between mb-3">
                <button className="btn btn-secondary" disabled={selectedVerse === '1'} onClick={() => {
                  const previousVerse = parseInt(selectedVerse) - 1;
                  if (previousVerse >= 1) {
                    setSelectedVerse(previousVerse.toString());
                    fetchVerse(selectedBook, selectedChapter, previousVerse.toString());
                  }
                }}>
                  Previous Verse
                </button>
                <button className="btn btn-secondary" disabled={selectedVerse === chapterContent.verses.length.toString()} onClick={() => {
                  const nextVerse = parseInt(selectedVerse) + 1;
                  if (nextVerse <= chapterContent.verses.length) {
                    setSelectedVerse(nextVerse.toString());
                    fetchVerse(selectedBook, selectedChapter, nextVerse.toString());
                  }
                }}>
                  Next Verse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-primary text-white text-center py-1 fixed-bottom">
        <p>&copy; 2024 Tamil Bible Online.</p> 
       Made With ❤️
        <br />
      </footer>
    </div>
  );
};

export default App;
