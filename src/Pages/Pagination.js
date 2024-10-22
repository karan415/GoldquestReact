import React, { useContext ,useCallback} from 'react';
import PaginationContext from './PaginationContext';

const Pagination = () => {
  const { currentItem, setCurrentItem, showPerPage, totalResults, totalPages} = useContext(PaginationContext);

  const showNext = useCallback(() => {
    if (currentItem < totalPages) {
        setCurrentItem((prev) => prev + 1);
    }
}, [currentItem, totalPages]);

const showPrev = useCallback(() => {
    if (currentItem > 1) {
        setCurrentItem((prev) => prev - 1);
    }
}, [currentItem]);

  const handlePageClick = (page) => {
    setCurrentItem(page);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex items-center justify-between rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
      <div className="flex flex-1 justify-between sm:hidden">
        <button 
          onClick={showPrev} 
          disabled={currentItem === 1} 
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Previous page"
          type='button'
        >
          Previous
        </button>
        <button 
          onClick={showNext} 
          disabled={currentItem === totalPages} 
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Next page"
          type='button'
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing
            <span className="font-medium"> {(currentItem - 1) * showPerPage + 1} </span>
            to
            <span className="font-medium"> {Math.min(currentItem * showPerPage, totalResults)} </span>
            of
            <span className="font-medium"> {totalResults} </span>
            results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button 
              onClick={showPrev} 
              disabled={currentItem === 1} 
                type='button'
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              aria-label="Previous page"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            {pageNumbers.map((page) => (
              <button
                type='button'
                key={page}
                type='button'
                onClick={() => handlePageClick(page)}
                aria-current={page === currentItem ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentItem ? 'bg-green-500 text-white' : 'text-gray-900'} ring-1 ring-inset ring-gray-300 hover:bg-green-900 focus:z-20 focus:outline-offset-0`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={showNext}  
              type='button' 
              disabled={currentItem === totalPages} 
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              aria-label="Next page"
              type='button'
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
