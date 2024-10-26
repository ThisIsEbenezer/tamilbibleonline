import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Your custom CSS
import { FacebookShareButton, WhatsappShareButton, TwitterShareButton, FacebookIcon, WhatsappIcon, TwitterIcon } from 'react-share';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import HitCounter from './HitCounter'; 

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
  //const [totalCount, setTotalCount] = useState(0);

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

  /*
  useEffect(() => {
    // Fetch the view count from the API when the component loads
    const fetchViewCount = async () => {
      try {
        const response = await axios.get('https://tamilbibleonlineapi.netlify.app/.netlify/functions/api/viewcount');
        const { totalCount } = response.data;
        setTotalCount(totalCount);
      } catch (error) {
        console.error('Error fetching view count:', error);
      }
    };

    fetchViewCount();
  }, []); // Empty dependency array to run the effect only once on mount
*/

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
     
     
      <header className="bg-primary text-white fixed-top py-3">
        <div className="containerheader d-flex justify-content-between align-items-center">
          {/* Logo with Link */}
          <a href="/" className="d-flex align-items-center">
            <img
              src='https://i.ibb.co/mX22r3T/tamilbibilelogo.png'
              alt="Tamil Bible Online Logo"
              className="rounded-circle" // Makes the logo round
              style={{ width: '60px', height: '60px' }} // Adjust size as needed
            />
          </a>

          {/* Title - only visible on larger screens */}
          <a href="/" className="d-none d-lg-block text-white text-decoration-none text-center flex-grow-1 mx-3">
            <h3>Tamil Bible Online</h3>
          </a>


          {/* Empty div for spacing on larger screens */}
          <div className="d-lg-none flex-grow-1" /> {/* This creates space on the right for mobile view */}
        </div>
      </header>



      <div className="container flex-grow-1 mt-5 pt-5"> {/* Adjusted margins */}
       <div className="dropdowns mb-3">
       <br />
          <div className="row">
            <div className="col-12 col-sm-4 mb-2"> {/* Full width on extra small screens, one-third on small and up */}
              <select className="form-select" value={selectedBook} onChange={handleBookChange}>
                <option value="">Select Book</option>
                {books.map((book, index) => (
                  <option key={index} value={book.name}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-4 mb-2"> {/* Full width on extra small screens, one-third on small and up */}
              <select className="form-select" value={selectedChapter} onChange={handleChapterChange} disabled={!selectedBook}>
                <option value="">Select Chapter</option>
                {chapters.map((chapter, index) => (
                  <option key={index} value={chapter}>
                    Chapter {chapter}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-4 mb-2"> {/* Full width on extra small screens, one-third on small and up */}
              <select className="form-select" value={selectedVerse} onChange={handleVerseChange} disabled={!selectedChapter}>
                <option value="All Verses">Show All Verses</option>
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
                  {/* {chapterContent && chapterContent.verses.map((verse) => (
                    <div key={verse.verse} className="col-md-12 mb-3">
           
                      <div className="card mb-3 shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <div className="card-header bg-primary text-white">
                          <h5 className="card-title m-0">Chapter {selectedChapter} : Verse {verse.verse}</h5>
                        </div>
                        <div className="card-body bg-light">
                          <p className="card-text" style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>{verse.text}</p>
                        </div>
                      </div>

                    </div>
                  ))} */}

                  {chapterContent && chapterContent.verses.map((verse) => (
                    <div key={verse.verse} className="col-md-12 mb-3">
                      <div className="card mb-3 shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <div className="card-header bg-primary text-white">
                          <h5 className="card-title m-0">{bookContent.book.tamil} : {selectedBook} - Chapter {selectedChapter} : Verse {verse.verse}</h5>
                        </div>
                        <div className="card-body bg-light">
                          <p className="card-text" style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>{verse.text}</p>

                          {/* Share and Copy Buttons */}
                          <div className="d-flex justify-content-between mt-3">
                            <div>
                              <FacebookShareButton url={`\n\n Discover more about the Bible at: http://tamilbibleonline.netlify.app/`} quote={` ${bookContent.book.tamil} ${selectedBook} : Chapter ${selectedChapter} : Verse ${verse.verse}  \n\n ${verse.text}`} className="me-2">
                                <FacebookIcon size={32} round />
                              </FacebookShareButton>

                              <WhatsappShareButton url={`\n\n Discover more about the Bible at: http://tamilbibleonline.netlify.app/`} title={` ${bookContent.book.tamil} ${selectedBook} : Chapter ${selectedChapter} : Verse ${verse.verse}  \n\n ${verse.text}`} className="me-2">
                                <WhatsappIcon size={32} round />
                              </WhatsappShareButton>

                              <TwitterShareButton url={`\n\n Discover more about the Bible at: http://tamilbibleonline.netlify.app/`} title={` ${bookContent.book.tamil} ${selectedBook} : Chapter ${selectedChapter} : Verse ${verse.verse}  \n\n ${verse.text}`} className="me-2">
                                <TwitterIcon size={32} round />
                              </TwitterShareButton>


                            </div>

                            <CopyToClipboard text={`${bookContent.book.tamil} ${selectedBook} : Chapter ${selectedChapter} : Verse ${verse.verse} \n\n ${verse.text}\n`} onCopy={() => alert('Verse copied to clipboard!')}>
                              <button className="btn btn-light btn-sm">Copy</button>
                            </CopyToClipboard>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <br /><br /><br />

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
              <h2>{bookContent.book.tamil} : {selectedBook} - Chapter {selectedChapter} - Verse {selectedVerse}</h2>

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
                  <h5 className="card-title m-0">{bookContent.book.tamil} : {selectedBook} - Chapter {selectedChapter} : Verse {selectedVerse}</h5>
                </div>
                <div className="card-body bg-light">
                  <p className="card-text" style={{ fontSize: '1.1rem', lineHeight: '1.5' }}> {verseContent.text}</p>
                  <div className="d-flex justify-content-between mt-3">
                    <div>
                      <FacebookShareButton url={`\n\n Discover more about the Bible at: http://tamilbibleonline.netlify.app/`} quote={` ${selectedBook} Chapter ${selectedChapter} : Verse ${selectedVerse}  \n\n ${verseContent.text}`} className="me-2">
                        <FacebookIcon size={32} round />
                      </FacebookShareButton>

                      <WhatsappShareButton url={`\n\n Discover more about the Bible at: http://tamilbibleonline.netlify.app/`} title={` ${selectedBook} : Chapter ${selectedChapter} : Verse ${selectedVerse}  \n\n ${verseContent.text}`} className="me-2">
                        <WhatsappIcon size={32} round />
                      </WhatsappShareButton>

                      <TwitterShareButton url={`\n\n Discover more about the Bible at: http://tamilbibleonline.netlify.app/`} title={` ${selectedBook} : Chapter ${selectedChapter} : Verse ${selectedVerse}  \n\n ${verseContent.text}`} className="me-2">
                        <TwitterIcon size={32} round />
                      </TwitterShareButton>


                    </div>

                    <CopyToClipboard text={`${selectedBook} : Chapter ${selectedChapter} : Verse ${selectedVerse} \n\n ${verseContent.text}\n`} onCopy={() => alert('Verse copied to clipboard!')}>
                      <button className="btn btn-light btn-sm">Copy</button>
                    </CopyToClipboard>
                  </div>
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
          <br /><br /><br />
        </div>
      </div>

      {/* <footer className="bg-primary text-white text-center py-1 fixed-bottom">
        <p>&copy; 2024 Tamil Bible Online.</p>
        <p>Made With ❤️</p>
        <p>Total Views: {totalCount}</p>
      </footer> */}
      <footer className="bg-primary text-white fixed-bottom">
        <div className="d-flex justify-content-between align-items-center py-3">
          {/* Left Section */}
          <div className="d-flex align-items-center border border-light p-2 rounded">
            <p className="mb-0 me-3 d-none d-sm-block">&copy; 2024 Tamil Bible Online</p>
            <h6 className="mb-0 me-3 d-block d-sm-none">&copy;  2024 Tamil Bible Online</h6>
          </div>

          {/* Center Section */}
          <div className="d-flex align-items-center border border-light p-2 rounded">
            <p className="mb-0 d-none d-sm-block">Made With ❤️</p>
            <h6 className="mb-0 d-block d-sm-none">Made With ❤️</h6>
          </div>

          <div className="d-flex align-items-center border border-light p-2 rounded">
            <p className="mb-0 d-none d-sm-block">
              Visitors: <HitCounter />
            </p>
            <h6 className="mb-0 d-block d-sm-none">
              Visitors: <HitCounter />
            </h6>
          </div>
        </div>

      </footer>

    </div>
  );
};

export default App;
