let searchInput = document.querySelector("#search_field")
let searchButton = document.querySelector("#search_button")
let infoDisplay = document.querySelector("#info");
let productHolder = document.querySelector(".products")

searchButton.addEventListener("click", (e) => {
    let searchTerm = encodeURI(searchInput.value);
    console.log(searchTerm);
    productHolder.classList.remove("active");
    productHolder.replaceChildren([]);
    $.ajax({
        type: "GET",
        url: `/api/scrap?keyword=${searchTerm}`,
        dataType: "json",
        success: function (response) {
            for (let product of response) {
                let { title, rating, reviews, image_url } = product;

                // Create elements to display product information

                let productElem = document.createElement("div");
                productElem.className = "product";

                let imageElm = document.createElement("img");
                imageElm.src = image_url;

                let infoElm = document.createElement("div");
                infoElm.className = "info";

                let titleElm = document.createElement("h2")
                titleElm.innerText = title;

                let underElm = document.createElement("div");
                underElm.className = "under"

                let ratingElm = document.createElement("h2");
                ratingElm.innerText = `Rating: ${rating}`;

                let reviewElm = document.createElement("h2");
                reviewElm.innerText = `Review: ${reviews}`;

                // Append elements to create the product structure

                underElm.appendChild(ratingElm);
                underElm.appendChild(reviewElm);

                infoElm.appendChild(titleElm)
                infoElm.appendChild(underElm);


                productElem.appendChild(imageElm);
                productElem.appendChild(infoElm);

                productHolder.appendChild(productElem);

                console.log(product);
            }
            productHolder.classList.add("active");
            // console.log(response)
        },
        error: function (data) {
            let error = data.responseJSON["status"];
            infoDisplay.innerHTML = error;
            console.log(error)
        },
    });
})