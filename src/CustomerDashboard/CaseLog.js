import React, { useState } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const CaseLog = () => {
    const [showPopup, setShowPopup] = useState(false);

    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello! How can I assist you with your ticket today?" },
    ]);
    const [userInput, setUserInput] = useState("");

    const handleSend = () => {
        if (userInput.trim()) {
            const userMessage = { sender: "user", text: userInput };
            const botReply = { sender: "bot", text: "Thank you for your message. We'll look into it!" };

            setMessages([...messages, userMessage, botReply]);
            setUserInput("");
        }
    };
    const [case_title, setcase_title] = useState({
        case_title: '',
        case_description: '',
    });
    const [passError, setPassError] = useState({});
    const handleChange = (event) => {
        const { name, value } = event.target;
        setcase_title((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (passError[name]) {
            setPassError((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const errors = {};
        if (!case_title.case_title) errors.case_title = 'Title is required';
        if (!case_title.case_description) errors.case_description = 'Confirmation password is required';
        else if (case_title.case_description !== case_title.case_title) errors.case_description = 'Passwords do not match';
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validate();
    };
    const [itemsPerPage, setItemPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const data = [
        {
            id: 1,
            org_name: 'Organization',
            title: 'case1',
            description: 'case Description',
        },
        {
            id: 2,
            org_name: 'Organization',
            title: 'case1',
            description: 'case Description',
        },
        {
            id: 3,
            org_name: 'Organization',
            title: 'case1',
            description: 'case Description',
        },
        {
            id: 4,
            org_name: 'Organization',
            title: 'case1',
            description: 'case Description',
        }
    ]
    const filteredItems = data.filter(item => {
        return (
            item.title.toLowerCase().includes(searchTerm.toLowerCase())

        );
    });
    const handleSelectChange = (e) => {
        const checkedStatus = e.target.value;
        setItemPerPage(checkedStatus);
    }


    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showPrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const showNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };


    const renderPagination = () => {
        const pageNumbers = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (!pageNumbers.includes(i)) {
                    pageNumbers.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }


            if (!pageNumbers.includes(totalPages)) {
                pageNumbers.push(totalPages);
            }
        }



        return pageNumbers.map((number, index) => (
            number === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
            ) : (
                <button
                    type="button"
                    key={`page-${number}`} // Unique key for page buttons
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 rounded-0 ${currentPage === number ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
                >
                    {number}
                </button>
            )
        ));
    };


    const replyTickets = () => {
        setShowPopup(true); // Show the popup
    };

    const handleClose = () => {
        setShowPopup(false); // Close the popup
    };
    return (
        <div className='grid md:grid-cols-2 gap-4 justify-between m-6 items-stretch'>
            <div>
                <h2 className='text-center md:text-3xl md:mt-10 md:mb-10 mt-3 font-bold mb-4'> Case Logs </h2>

                <div className='m-0 bg-white shadow-md p-3 md:h-100 rounded-md'>

                    <form className='mt-4 ' onSubmit={handleSubmit}>

                        <div className="mb-6 text-left">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="case_title">Case-Log Title</label>
                            <input
                                type="text"
                                name="case_title"
                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="case_title"
                                onChange={handleChange}
                                value={case_title.case_title}
                            />
                            {passError.case_title && <p className='text-red-500'>{passError.case_title}</p>}
                        </div>
                        <div className="mb-6 text-left">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="case_description">Case-Log Description</label>
                            <input
                                type="password"
                                name="case_description"
                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="confirmcase_title"
                                onChange={handleChange}
                                value={case_title.case_description}
                            />
                            {passError.case_description && <p className='text-red-500'>{passError.case_description}</p>}
                        </div>
                        <button type="submit" className='bg-green-400 text-white p-3 rounded-md w-full mb-4 hover:bg-green-200'>Submit Case-Logs</button>
                    </form>
                </div>
            </div>
            <div>
                <h2 className='text-center md:text-3xl md:mt-10 md:mb-10 mt-3 font-bold mb-4'> Tickets Details </h2>
                <div className=' border p-3 bg-white shadow-md rounded-md  mx-auto'>

                    <div className="md:grid md:grid-cols-2 justify-between items-center md:my-4 border-b-2 pb-4">
                        <div className="col">
                            <form action="">
                                <div className="flex gap-5 justify-between">
                                    <select name="options" onChange={handleSelectChange} id="" className='border outline-none w-10/12  p-2 text-left rounded-md '>
                                        <option value="10">10 Rows</option>
                                        <option value="20">20 Rows</option>
                                        <option value="50">50 Rows</option>
                                        <option value="200">200 Rows</option>
                                        <option value="300">300 Rows</option>
                                        <option value="400">400 Rows</option>
                                        <option value="500">500 Rows</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="col md:flex justify-end ">
                            <form action="">
                                <div className="flex md:items-stretch items-center  gap-3">
                                    <input
                                        type="search"
                                        className='outline-none border-2 p-2 text-sm rounded-md w-full my-4 md:my-0'
                                        placeholder='Search by Case'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>

                    </div>
                    <div className="overflow-x-auto py-6 px-4">

                        <table className="min-w-full">
                            <thead>
                                <tr className='bg-green-500'>
                                    <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">SL</th>
                                    <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">organisation name</th>
                                    <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Case Title</th>
                                    <th className="py-2 px-4 text-white border-r border-b text-center uppercase whitespace-nowrap">Case Description</th>
                                    <th className="py-2 px-4 text-white border-r border-b text-center uppercase whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ?
                                    (currentItems.map((item, index) => (
                                        <tr key={item.index}>
                                            <td className="py-2 px-4 border-l border-r border-b whitespace-nowrap">{item.id}</td>
                                            <td className="py-2 px-4 border-r border-b whitespace-nowrap">{item.org_name}</td>
                                            <td className="py-2 px-4 border-r border-b whitespace-nowrap">{item.title}</td>

                                            <td className="py-2 px-4 border-r border-b whitespace-nowrap text-center">

                                                {item.description}
                                            </td>
                                            <td className="py-2 px-4 border-r border-b whitespace-nowrap text-center">
                                                <button
                                                    className='bg-green-500 rounded-md hover:bg-green-200 p-2 me-3 text-white'
                                                    onClick={() => replyTickets()}
                                                >
                                                    Check In
                                                </button>
                                                <button
                                                    className='bg-red-500 rounded-md hover:bg-red-200 p-2 text-white'
                                                >
                                                    Delete
                                                </button>

                                            </td>
                                        </tr>
                                    ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-6 px-4 border-l border-r text-center border-b whitespace-nowrap">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>



                    </div>
                    <div className="flex items-center justify-end  rounded-md px-4 py-3 sm:px-6 md:m-4 mt-2">
                        <button
                            onClick={showPrev}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            aria-label="Previous page"
                        >
                            <MdArrowBackIosNew />
                        </button>
                        <div className="flex items-center">
                            {renderPagination()}
                        </div>
                        <button
                            onClick={showNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            aria-label="Next page"
                        >
                            <MdArrowForwardIos />
                        </button>
                    </div>
                </div>
            </div>


            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="flex flex-col md:after:w-6/12 h-[500px] bg-white border relative border-gray-300 rounded-lg shadow-lg mx-auto mt-10">
                        {/* Close button */}
                        <button
                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
                            onClick={handleClose}
                        >
                            X
                        </button>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.sender === 'bot'
                                                ? 'bg-gray-300 text-gray-900'
                                                : 'bg-blue-500 text-white'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input and Send Button */}
                        <div className="flex items-center p-3 bg-white border-t border-gray-300">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            />
                            <button
                                onClick={handleSend}
                                className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseLog;
