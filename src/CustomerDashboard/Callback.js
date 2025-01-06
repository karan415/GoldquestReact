import React from 'react'
import Swal from 'sweetalert2';
const Callback = () => {
    const runCallback = () => {
        const branchData = JSON.parse(localStorage.getItem("branch"));
        const branch_id = branchData?.id;
        const branch_token = localStorage.getItem("branch_token");
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "branch_id": branch_id,
            "_token": branch_token,
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        // Show loading Swal
        Swal.fire({
            title: "Processing...",
            text: "Please wait while we process your request.",
            icon: "info",
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch("https://api.goldquestglobal.in/branch/callback-request", requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((result) => {
                        const errorMessage = result.message || 'An unexpected error occurred.';

                        // Check if the token has expired
                        if (
                            errorMessage.toLowerCase().includes("invalid") &&
                            errorMessage.toLowerCase().includes("token")
                        ) {
                            Swal.fire({
                                title: "Session Expired",
                                text: "Your session has expired. Please log in again.",
                                icon: "warning",
                                confirmButtonText: "Ok",
                            }).then(() => {
                                const branchEmail = branchData?.email || ""; // Extract branch email
                                window.open(
                                    `/customer-login?email=${encodeURIComponent(branchEmail)}`,
                                    "_self" // Open in the same tab
                                );
                            });
                        } else {
                            // Display error message from API
                            Swal.fire({
                                title: 'Error',
                                text: result.message || 'An unexpected error occurred. Please try again.',
                                icon: 'error',
                                confirmButtonText: 'OK',
                            });
                        }
                        throw new Error(errorMessage); // Stop further processing in case of error
                    });
                }
                return response.json(); // Return the successful response
            }) // Assuming the response is in JSON format
            .then((result) => {
                Swal.close();

                // Check if the response contains a new token
                const newToken = result._token || result.token;
                if (newToken) {
                    localStorage.setItem("branch_token", newToken);
                }

                Swal.fire({
                    title: "Success",
                    text: result.message || "Callback request was successful.",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            })
            .catch((error) => {
                console.error(error);
                // Hide the loading Swal in case of an error
                Swal.close();


            });
    };

    return (
        <>
                <button className='p-3 bg-white rounded-md text-green-green-500 ' onClick={runCallback}>Request Callback</button>
            
        </>
    )
}

export default Callback