// Import required modules
const express = require("express")
const JSDOM = require("jsdom").JSDOM;
const axios = require("axios");

// Create an Express app
const app = express();

// Define headers for HTTP requests
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
}

// Set up Express to serve the front end
app.use(express.static(__dirname + "/public"))

// Define a route for scraping Amazon products based on a keyword
app.get("/api/scrap", (req, res) => {
    // Extract the keyword from the query parameters
    let { keyword } = req.query;
    console.log(keyword);
    if (keyword == undefined) {
        // Handle case where keyword is not provided
        res.status(400).json({
            "status": "Keyword must not be empty"
        })
    } else {
        // Construct the URL for Amazon search based on the keyword
        var url = `https://www.amazon.com/s?k=${keyword}`;

        var products = []; // Array to store scraped products

        // Make a GET request to the Amazon search URL
        axios.get(url, {
            headers,
            maxRedirects: 0
        }).then(function (response) {
            // Process the HTML content received from the response
            let html = response.data.toString();
            html = html.replace(/<style>[\s\S]*?<\/style>/g, ''); // Remove style tags from HTML

            // Create a JSDOM instance to parse the HTML
            const { window } = new JSDOM(html, { url: url, contentType: "text/html" });

            // Event listener for when DOM is fully loaded
            window.document.addEventListener('DOMContentLoaded', () => {
                // Query elements after DOM is fully loaded
                const elements = window.document.querySelectorAll(".puis-card-container.s-card-container.s-overflow-hidden.aok-relative");

                if (elements.length > 0) {

                    // Loop through each element and extract product information
                    for (let element of elements) {
                        // console.log(element.className)
                        let title = element.querySelector("span.a-size-base-plus.a-color-base.a-text-normal")?.innerHTML ?? element.querySelector("span.a-size-medium.a-color-base.a-text-normal")?.innerHTML
                        let rating = element.querySelector(".a-icon-alt")?.innerHTML;
                        let r = parseInt(element.querySelector("span.a-size-base.s-underline-text")?.innerHTML)
                        let reviews = (r == NaN) ? "No Reviews" : r;
                        let imageUrl = element.querySelector(".s-image")?.src;

                        if (title != undefined && rating != undefined && reviews != undefined && imageUrl != undefined) {
                            // Create a product object and add it to the products array
                            let product = {
                                "title": title,
                                "rating": parseFloat(rating.match(/\d+\.\d+/)[0]),
                                "reviews": reviews,
                                "image_url": imageUrl
                            };
                            // Add products to products array
                            products.push(product);
                        }
                    }
                    console.log(`Found: ${products.length}`);  // Output the number of elements found
                    if (products.length > 0) {
                        //console.log("Sending data")
                        // Send the products array as a JSON response
                        res.json(products);

                    } else {
                        res.status(404).json({
                            "status": "No products found"
                        });
                    }

                } else {
                    res.status(404).json({
                        "status": "No products found"
                    });
                }

            });

        }).catch(function (error) {
            // Handle any errors that occur during the request
            console.log(error);
            res.status(500).json({
                "status": "Unable to connect with amazon"
            });
        })
    }
})

// Start the Express server and listen on port 8000
app.listen(8000, () => {
    console.log("Listening on http://localhost:8000");
})